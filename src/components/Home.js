import { useEffect, useState } from "react";

import close from "../assets/close.svg";

const Home = ({ home, provider, account, escrow, togglePop }) => {
  const [hasBought, setHasBought] = useState(false);
  const [hasLended, setHasLended] = useState(false);
  const [hasInspected, setHasInspected] = useState(false);
  const [hasSold, setHasSold] = useState(false);

  const [buyer, setBuyer] = useState(null);
  const [lender, setLender] = useState(null);
  const [inspector, setInspector] = useState(null);
  const [seller, setSeller] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactStatus, setContactStatus] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    contact: "",
    message: "",
  });

  const [owner, setOwner] = useState(null);

  const getAttributeValue = (traitType) => {
    const attribute = home.attributes.find(
      (item) => item.trait_type.toLowerCase() === traitType.toLowerCase(),
    );

    return attribute?.value;
  };

  const price = getAttributeValue("Purchase Price");
  const residenceType = getAttributeValue("Type of Residence");
  const bedrooms = getAttributeValue("Bed Rooms");
  const bathrooms = getAttributeValue("Bathrooms");
  const squareFeet = getAttributeValue("Square Feet");
  const yearBuilt = getAttributeValue("Year Built");

  const fetchDetails = async () => {
    // -- Buyer

    const buyer = await escrow.buyer(home.id);
    setBuyer(buyer);

    const hasBought = await escrow.approval(home.id, buyer);
    setHasBought(hasBought);

    // -- Seller

    const seller = await escrow.seller();
    setSeller(seller);

    const hasSold = await escrow.approval(home.id, seller);
    setHasSold(hasSold);

    // -- Lender

    const lender = await escrow.lender();
    setLender(lender);

    const hasLended = await escrow.approval(home.id, lender);
    setHasLended(hasLended);

    // -- Inspector

    const inspector = await escrow.inspector();
    setInspector(inspector);

    const hasInspected = await escrow.inspectionPassed(home.id);
    setHasInspected(hasInspected);
  };

  const fetchOwner = async () => {
    if (await escrow.isListed(home.id)) return;

    const owner = await escrow.buyer(home.id);
    setOwner(owner);
  };

  // Buyer deposits earnest money and approves sale
  const buyHandler = async () => {
    const escrowAmount = await escrow.escrowAmount(home.id); // Get required deposit
    const signer = await provider.getSigner(); // Get connected wallet

    // Deposit earnest money
    let transaction = await escrow
      .connect(signer)
      .depositEarnest(home.id, { value: escrowAmount });
    await transaction.wait();

    // Approve the sale
    transaction = await escrow.connect(signer).approveSale(home.id);
    await transaction.wait();

    setHasBought(true); // Update UI
  };

  // Inspector marks inspection as passed
  const inspectHandler = async () => {
    const signer = await provider.getSigner(); // Get inspector wallet

    // Update inspection status
    const transaction = await escrow
      .connect(signer)
      .updateInspectionStatus(home.id, true);
    await transaction.wait();

    setHasInspected(true); // Update UI
  };

  // Lender approves sale and sends remaining funds
  const lendHandler = async () => {
    const signer = await provider.getSigner(); // Get lender wallet

    // Approve the sale
    const transaction = await escrow.connect(signer).approveSale(home.id);
    await transaction.wait();

    // Calculate remaining amount (purchase price - deposit)
    const purchasePrice = await escrow.purchasePrice(home.id);
    const escrowAmount = await escrow.escrowAmount(home.id);
    const lendAmount = purchasePrice.sub(escrowAmount);

    // Send funds to escrow contract
    await signer.sendTransaction({
      to: escrow.address,
      value: lendAmount,
      gasLimit: 60000,
    });

    setHasLended(true); // Update UI
  };

  // Seller approves and finalizes sale
  const sellHandler = async () => {
    const signer = await provider.getSigner(); // Get seller wallet

    // Approve sale
    let transaction = await escrow.connect(signer).approveSale(home.id);
    await transaction.wait();

    // Finalize transaction (transfer NFT + funds)
    transaction = await escrow.connect(signer).finalizeSale(home.id);
    await transaction.wait();

    setHasSold(true); // Update UI
  };

  const contactHandler = () => {
    setShowContactForm((isOpen) => !isOpen);
    setContactStatus("");
    setContactForm((currentForm) => ({
      ...currentForm,
      message:
        currentForm.message ||
        `I am interested in ${home.name} at ${home.address}. Please share the next steps.`,
    }));
  };

  const contactChangeHandler = (e) => {
    const { name, value } = e.target;
    setContactForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const contactSubmitHandler = (e) => {
    e.preventDefault();

    const inquiry = {
      ...contactForm,
      propertyId: home.id,
      propertyName: home.name,
      wallet: account,
      createdAt: new Date().toISOString(),
    };

    console.log("Property inquiry submitted", inquiry);
    setContactStatus("Inquiry saved. An agent can follow up with the details you entered.");
    setContactForm({ name: "", contact: "", message: "" });
  };

  useEffect(() => {
    fetchDetails();
    fetchOwner();
  }, [hasSold]);

  return (
    <div className="home">
      <div className="home__details">
        <div className="home__image">
          <img src={home.image} alt="Home" />
        </div>
        <div className="home__overview">
          <div className="home__meta">
            <span>Token #{home.id}</span>
            <span>{residenceType}</span>
          </div>

          <h1>{home.name}</h1>
          <p>
            <strong>{bedrooms}</strong> bds |
            <strong>{bathrooms}</strong> ba |
            <strong>{squareFeet}</strong> sqft
          </p>
          <p>{home.address}</p>

          <h2>{price} ETH</h2>

          <div className="home__facts-grid">
            <div>
              <span>Residence</span>
              <strong>{residenceType}</strong>
            </div>
            <div>
              <span>Bedrooms</span>
              <strong>{bedrooms}</strong>
            </div>
            <div>
              <span>Bathrooms</span>
              <strong>{bathrooms}</strong>
            </div>
            <div>
              <span>Square Feet</span>
              <strong>{squareFeet}</strong>
            </div>
            <div>
              <span>Year Built</span>
              <strong>{yearBuilt}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{owner ? "Sold" : "Listed"}</strong>
            </div>
          </div>

          {owner ? (
            <div className="home__owned">
              Owned by {owner.slice(0, 6) + "..." + owner.slice(38, 42)}
            </div>
          ) : (
            <div>
              {account === inspector ? (
                <button
                  className="home__buy"
                  onClick={inspectHandler}
                  disabled={hasInspected}
                >
                  Approve Inspection
                </button>
              ) : account === lender ? (
                <button
                  className="home__buy"
                  onClick={lendHandler}
                  disabled={hasLended}
                >
                  Approve & Lend
                </button>
              ) : account === seller ? (
                <button
                  className="home__buy"
                  onClick={sellHandler}
                  disabled={hasSold}
                >
                  Approve & Sell
                </button>
              ) : (
                <button
                  className="home__buy"
                  onClick={buyHandler}
                  disabled={hasBought}
                >
                  Buy
                </button>
              )}

              <button className="home__contact" onClick={contactHandler}>
                {showContactForm ? "Hide contact" : "Contact agent"}
              </button>

              {showContactForm && (
                <form className="home__contact-form" onSubmit={contactSubmitHandler}>
                  <input
                    name="name"
                    placeholder="Your name"
                    value={contactForm.name}
                    onChange={contactChangeHandler}
                    required
                  />
                  <input
                    name="contact"
                    placeholder="Email or phone"
                    value={contactForm.contact}
                    onChange={contactChangeHandler}
                    required
                  />
                  <textarea
                    name="message"
                    placeholder="Message"
                    value={contactForm.message}
                    onChange={contactChangeHandler}
                    required
                  />
                  <button type="submit">Send inquiry</button>
                </form>
              )}

              {contactStatus && <p className="home__contact-status">{contactStatus}</p>}
            </div>
          )}

          <hr />

          <h2>Overview</h2>

          <p>{home.description}</p>

          <hr />

          <h2>Facts and features</h2>

          <ul>
            {home.attributes.map((attribute, index) => (
              <li key={index}>
                <strong>{attribute.trait_type}</strong> : {attribute.value}
              </li>
            ))}
          </ul>
        </div>

        <button onClick={togglePop} className="home__close">
          <img src={close} alt="Close" />
        </button>
      </div>
    </div>
  );
};

export default Home;
