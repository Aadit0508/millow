import { useState } from "react";
import { ethers } from "ethers";

function MintProperty({
  realEstate,
  escrow,
  provider,
  account,
  onClose,
  onPropertyAdded,
}) {
  const emptyForm = {
    name: "",
    address: "",
    description: "",
    image: null,
    purchasePrice: "",
    escrowAmount: "",
    buyerAddress: "",
    residenceType: "",
    bedrooms: "",
    bathrooms: "",
    sqft: "",
    yearBuilt: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const parsePinataError = (data, fallback) => {
    if (typeof data?.error === "string") return data.error;
    if (data?.error?.details) return data.error.details;
    if (data?.error?.reason) return data.error.reason;
    return fallback;
  };

  const uploadImageToPinata = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
      },
      body: formData,
    });
    const data = await res.json();

    if (!res.ok || !data.IpfsHash) {
      throw new Error(parsePinataError(data, "Image upload failed"));
    }

    return `https://ipfs.io/ipfs/${data.IpfsHash}`;
  };

  const uploadMetadataToPinata = async (metadata) => {
    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
      },
      body: JSON.stringify(metadata),
    });
    const data = await res.json();

    if (!res.ok || !data.IpfsHash) {
      throw new Error(parsePinataError(data, "Metadata upload failed"));
    }

    return `https://ipfs.io/ipfs/${data.IpfsHash}`;
  };

  const validateForm = () => {
    if (!process.env.REACT_APP_PINATA_JWT) {
      throw new Error("Missing REACT_APP_PINATA_JWT in your environment");
    }

    if (!provider || !realEstate || !escrow || !account) {
      throw new Error("Connect the seller wallet before listing a property");
    }

    if (!form.image) {
      throw new Error("Select a property image");
    }

    if (!ethers.utils.isAddress(form.buyerAddress)) {
      throw new Error("Enter a valid buyer wallet address");
    }

    if (Number(form.purchasePrice) <= 0 || Number(form.escrowAmount) <= 0) {
      throw new Error("Purchase price and escrow amount must be greater than zero");
    }

    if (Number(form.escrowAmount) > Number(form.purchasePrice)) {
      throw new Error("Escrow amount cannot be greater than purchase price");
    }
  };

  const handleMint = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      validateForm();

      const signer = provider.getSigner();

      setStatus("Uploading image to IPFS...");
      const imageUrl = await uploadImageToPinata(form.image);

      const totalSupply = await realEstate.totalSupply();
      const newId = totalSupply.toNumber() + 1;

      const metadata = {
        name: form.name,
        address: form.address,
        description: form.description,
        image: imageUrl,
        id: String(newId),
        attributes: [
          { trait_type: "Purchase Price", value: Number(form.purchasePrice) },
          { trait_type: "Type of Residence", value: form.residenceType },
          { trait_type: "Bed Rooms", value: Number(form.bedrooms) },
          { trait_type: "Bathrooms", value: Number(form.bathrooms) },
          { trait_type: "Square Feet", value: Number(form.sqft) },
          { trait_type: "Year Built", value: Number(form.yearBuilt) },
        ],
      };

      setStatus("Uploading metadata to IPFS...");
      const tokenURI = await uploadMetadataToPinata(metadata);

      setStatus("Minting NFT...");
      const mintTx = await realEstate.connect(signer).mint(tokenURI);
      const mintReceipt = await mintTx.wait();

      const transferEvent = mintReceipt.events.find((event) => event.event === "Transfer");
      const tokenId = transferEvent.args.tokenId.toNumber();

      setStatus("Approving escrow...");
      const approveTx = await realEstate.connect(signer).approve(escrow.address, tokenId);
      await approveTx.wait();

      setStatus("Listing on escrow...");
      const listTx = await escrow.connect(signer).list(
        tokenId,
        ethers.utils.getAddress(form.buyerAddress),
        ethers.utils.parseUnits(form.purchasePrice.toString(), "ether"),
        ethers.utils.parseUnits(form.escrowAmount.toString(), "ether"),
      );
      await listTx.wait();

      await onPropertyAdded?.();
      setStatus(`Done. Property minted as Token #${tokenId} and listed.`);
      setForm(emptyForm);
    } catch (err) {
      console.error(err);
      setStatus("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="mint-overlay"
      onClick={(e) => e.target.classList.contains("mint-overlay") && onClose()}
    >
      <div className="mint-modal">
        <div className="mint-modal__header">
          <h2>List new property</h2>
          <button className="mint-modal__close" onClick={onClose}>&#x2715;</button>
        </div>

        <form onSubmit={handleMint}>
          <input name="name" placeholder="Property Name" value={form.name} onChange={handleChange} required />
          <input name="address" placeholder="Street Address" value={form.address} onChange={handleChange} required />
          <input name="residenceType" placeholder="Type (e.g. Condo, House)" value={form.residenceType} onChange={handleChange} required />
          <input name="purchasePrice" placeholder="Purchase Price (ETH)" type="number" step="0.01" value={form.purchasePrice} onChange={handleChange} required />
          <input name="escrowAmount" placeholder="Escrow Amount (ETH)" type="number" step="0.01" value={form.escrowAmount} onChange={handleChange} required />
          <input name="bedrooms" placeholder="Bedrooms" type="number" value={form.bedrooms} onChange={handleChange} required />
          <input name="bathrooms" placeholder="Bathrooms" type="number" value={form.bathrooms} onChange={handleChange} required />
          <input name="sqft" placeholder="Square Feet" type="number" value={form.sqft} onChange={handleChange} required />
          <input name="yearBuilt" placeholder="Year Built" type="number" value={form.yearBuilt} onChange={handleChange} required />
          <input name="buyerAddress" placeholder="Buyer Wallet Address (0x...)" value={form.buyerAddress} onChange={handleChange} required />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
          <input name="image" type="file" accept="image/*" onChange={handleChange} required />
          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Mint & List Property"}
          </button>
        </form>

        {status && <p className="mint-status">{status}</p>}
      </div>
    </div>
  );
}

export default MintProperty;
