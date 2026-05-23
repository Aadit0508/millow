import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Navigation from "./components/Navigation";
import Search from "./components/Search";
import Home from "./components/Home";

// ABIs
import RealEstate from "./abis/RealEstate.json";
import Escrow from "./abis/Escrow.json";

// Config
import config from "./config.json";
import MintProperty from "./components/MintProperty";

function App() {
  const [mintToggle, setMintToggle] = useState(false);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [realEstate, setRealEstate] = useState(null);
  const [homes, setHomes] = useState([]);
  const [home, setHome] = useState(null);
  const [toggle, setToggle] = useState();
  const [isSeller, setIsSeller] = useState(false);

  const syncSellerRole = async (escrowContract, selectedAccount) => {
    if (!escrowContract || !selectedAccount) {
      setIsSeller(false);
      return;
    }

    const sellerAddress = await escrowContract.seller();
    setIsSeller(
      ethers.utils.getAddress(selectedAccount) ===
        ethers.utils.getAddress(sellerAddress),
    );
  };

  const loadHomes = async (realEstateContract) => {
    const totalSupply = await realEstateContract.totalSupply();
    const total = totalSupply.toNumber();
    const loadedHomes = [];

    for (let i = 1; i <= total; i++) {
      try {
        const uri = await realEstateContract.tokenURI(i);
        const response = await fetch(uri);
        const metadata = await response.json();

        loadedHomes.push({
          ...metadata,
          id: metadata.id || String(i),
        });
      } catch (error) {
        console.warn(`Unable to load metadata for token ${i}`, error);
      }
    }

    setHomes(loadedHomes);
  };

  const refreshHomes = async () => {
    if (!realEstate) return;
    await loadHomes(realEstate);
  };

  const loadBlockChainData = async () => {
    if (typeof window.ethereum === "undefined") return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    const network = await provider.getNetwork();
    console.log("Chain ID:", network.chainId);

    if (!config[network.chainId]) {
      throw new Error(`No contract config found for chain ${network.chainId}`);
    }

    const realEstate = new ethers.Contract(
      config[network.chainId].realEstate.address,
      RealEstate,
      provider,
    );
    console.log(await realEstate.name())

    setRealEstate(realEstate);
    await loadHomes(realEstate);

    const escrow = new ethers.Contract(
      config[network.chainId].escrow.address,
      Escrow,
      provider,
    );
    setEscrow(escrow);

    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const connectedAccount = ethers.utils.getAddress(accounts[0]);
    setAccount(connectedAccount);
    await syncSellerRole(escrow, connectedAccount);

    window.ethereum.on("accountsChanged", async (accounts) => {
      if (!accounts.length) {
        setAccount(null);
        setIsSeller(false);
        return;
      }

      const selectedAccount = ethers.utils.getAddress(accounts[0]);
      setAccount(selectedAccount);
      await syncSellerRole(escrow, selectedAccount);
    });
  };

  useEffect(() => {
    loadBlockChainData();
  }, []);

  const togglePop = (home) => {
    setHome(home)
    toggle ? setToggle(false) : setToggle(true)
  }

  if (typeof window.ethereum === 'undefined') {
    return (
      <div className='metamask-warning'>
        <h1>MetaMask Required</h1>
        <p>Please install MetaMask to use this application.</p>
        <a href="https://metamask.io/download/" target="_blank" rel="noreferrer">
          Install MetaMask
        </a>
      </div>
    )
  }

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />

      <div className="cards__section">
        <h3>Homes for You</h3>
        <hr />

        <div className="cards">
          {homes.map((home, index) => (
            <div className="card" key={index} onClick={() => togglePop(home)}>
              <div className="card__image">
                <img src={home.image} alt="Home/"></img>
              </div>
              <div className="card__info">
                <h4>{home.attributes[0].value} ETH</h4>
                <p>
                  <strong>{home.attributes[2].value}</strong> bds |
                  <strong>{home.attributes[3].value}</strong> ba |
                  <strong>{home.attributes[4].value}</strong>sqft
                </p>
                <p>{home.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isSeller && (
        <button className="mint-btn" onClick={() => setMintToggle(true)}>
          + List New Property
        </button>
      )}

      {mintToggle && (
        <MintProperty
          realEstate={realEstate}
          escrow={escrow}
          provider={provider}
          account={account}
          onClose={() => setMintToggle(false)}
          onPropertyAdded={refreshHomes}
        />
      )}

      {toggle && (
        <Home home={home} provider={provider} account={account} escrow={escrow} togglePop={togglePop} />
      )}
    </div>
  );
}

export default App;
