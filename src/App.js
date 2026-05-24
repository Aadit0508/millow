import { useEffect, useMemo, useState } from "react";
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

const getAttributeValue = (property, traitType) => {
  const attribute = property.attributes?.find(
    (item) => item.trait_type?.toLowerCase() === traitType.toLowerCase(),
  );

  return attribute?.value;
};

const getPrice = (property) => Number(getAttributeValue(property, "Purchase Price")) || 0;
const getPropertyType = (property) => getAttributeValue(property, "Type of Residence") || "";
const getBedrooms = (property) => Number(getAttributeValue(property, "Bed Rooms")) || 0;
const getBathrooms = (property) => Number(getAttributeValue(property, "Bathrooms")) || 0;
const getSquareFeet = (property) => Number(getAttributeValue(property, "Square Feet")) || 0;

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
  const [filters, setFilters] = useState({
    query: "",
    propertyType: "all",
    minPrice: "",
    maxPrice: "",
    minBedrooms: "any",
  });

  const propertyTypes = useMemo(() => {
    const types = homes
      .map((property) => getPropertyType(property))
      .filter(Boolean);

    return [...new Set(types)].sort();
  }, [homes]);

  const filteredHomes = useMemo(() => {
    const searchTerm = filters.query.trim().toLowerCase();
    const minPrice = filters.minPrice === "" ? null : Number(filters.minPrice);
    const maxPrice = filters.maxPrice === "" ? null : Number(filters.maxPrice);
    const minBedrooms = filters.minBedrooms === "any" ? null : Number(filters.minBedrooms);

    return homes.filter((property) => {
      const price = getPrice(property);
      const propertyType = getPropertyType(property);
      const bedrooms = getBedrooms(property);
      const searchableText = [
        property.name,
        property.address,
        property.description,
        propertyType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (searchTerm && !searchableText.includes(searchTerm)) return false;
      if (filters.propertyType !== "all" && propertyType !== filters.propertyType) return false;
      if (minPrice !== null && price < minPrice) return false;
      if (maxPrice !== null && price > maxPrice) return false;
      if (minBedrooms !== null && bedrooms < minBedrooms) return false;

      return true;
    });
  }, [filters, homes]);

  const handleFilterChange = (name, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      propertyType: "all",
      minPrice: "",
      maxPrice: "",
      minBedrooms: "any",
    });
  };

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
      <Search query={filters.query} onQueryChange={(value) => handleFilterChange("query", value)} />

      <div className="cards__section">
        <div className="cards__header">
          <div>
            <h3>Homes for You</h3>
            <p>{filteredHomes.length} of {homes.length} properties shown</p>
          </div>
          <button className="filters__clear" onClick={clearFilters} type="button">
            Clear Filters
          </button>
        </div>
        <hr />

        <div className="filters">
          <label>
            Type
            <select
              value={filters.propertyType}
              onChange={(e) => handleFilterChange("propertyType", e.target.value)}
            >
              <option value="all">All types</option>
              {propertyTypes.map((propertyType) => (
                <option value={propertyType} key={propertyType}>
                  {propertyType}
                </option>
              ))}
            </select>
          </label>

          <label>
            Min Price
            <input
              type="number"
              min="0"
              placeholder="ETH"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            />
          </label>

          <label>
            Max Price
            <input
              type="number"
              min="0"
              placeholder="ETH"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            />
          </label>

          <label>
            Bedrooms
            <select
              value={filters.minBedrooms}
              onChange={(e) => handleFilterChange("minBedrooms", e.target.value)}
            >
              <option value="any">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </label>
        </div>

        <div className="cards">
          {filteredHomes.map((home, index) => (
            <div className="card" key={index} onClick={() => togglePop(home)}>
              <div className="card__image">
                <img src={home.image} alt="Home/"></img>
              </div>
              <div className="card__info">
                <h4>{getPrice(home)} ETH</h4>
                <p>
                  <strong>{getBedrooms(home)}</strong> bds |
                  <strong>{getBathrooms(home)}</strong> ba |
                  <strong>{getSquareFeet(home)}</strong> sqft
                </p>
                <p>{home.address}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredHomes.length === 0 && (
          <div className="cards__empty">
            <h4>No properties match your filters</h4>
            <p>Try a different search, price range, residence type, or bedroom count.</p>
          </div>
        )}
      </div>

      {account && (
        <div className="seller-actions">
          <button
            className="mint-btn"
            onClick={() => setMintToggle(true)}
            disabled={!isSeller}
            title={isSeller ? "List a new property" : "Switch to the seller wallet to list a property"}
          >
            {isSeller ? "+ List New Property" : "Only Seller Can List Properties"}
          </button>
          {!isSeller && (
            <p className="seller-actions__hint">
              Switch MetaMask to the seller account from your Hardhat deploy.
            </p>
          )}
        </div>
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
