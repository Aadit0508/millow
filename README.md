<div align="center">

<br/>

```
██████╗ ███████╗ █████╗ ██╗         ███████╗███████╗████████╗ █████╗ ████████╗███████╗
██╔══██╗██╔════╝██╔══██╗██║         ██╔════╝██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██╔════╝
██████╔╝█████╗  ███████║██║         █████╗  ███████╗   ██║   ███████║   ██║   █████╗  
██╔══██╗██╔══╝  ██╔══██║██║         ██╔══╝  ╚════██║   ██║   ██╔══██║   ██║   ██╔══╝  
██║  ██║███████╗██║  ██║███████╗    ███████╗███████║   ██║   ██║  ██║   ██║   ███████╗
╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝    ╚══════╝╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚══════╝
```

### **Tokenize · Trade · List · Own**
#### *Virtual Properties on the Blockchain*

<br/>

![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.0-363636?style=for-the-badge&logo=solidity)
![Hardhat](https://img.shields.io/badge/Hardhat-2.0-F0C000?style=for-the-badge&logo=hardhat)
![React](https://img.shields.io/badge/React-18.0-61DAFB?style=for-the-badge&logo=react)
![Ethers.js](https://img.shields.io/badge/Ethers.js-v5-3C3C3D?style=for-the-badge&logo=ethereum)
![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![IPFS](https://img.shields.io/badge/Storage-IPFS%20%2F%20Pinata-65C2CB?style=for-the-badge&logo=ipfs)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Recent Changes](#recent-changes)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Manual Property Addition](#manual-property-addition)
- [User Roles](#user-roles)
- [Search and Filtering](#search-and-filtering)
- [Metadata Storage](#metadata-storage)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [License](#license)

---

## Overview

A decentralized application that uses blockchain technology and NFTs to represent real estate properties. Users can browse listed properties, interact with an escrow-based purchase flow, and manually add new property listings by minting new NFTs.

The app combines Solidity smart contracts, a Hardhat local development chain, and a React frontend. Static demo properties are included, while newly added properties are uploaded to IPFS through Pinata and then stored on-chain through each NFT's `tokenURI`.

---

## Features

| | Feature | Description |
|---|---|---|
| ⬡ | **Secure Ownership** | Properties tokenized as ERC-721 NFTs |
| ⚖️ | **Escrow Workflow** | Buyer, seller, inspector, and lender approvals handled by the escrow contract |
| ➕ | **Manual Property Addition** | Sellers can upload images, generate metadata, mint NFTs, and list from the UI |
| ☁️ | **IPFS Metadata Storage** | New property images and metadata uploaded to Pinata/IPFS |
| 🔍 | **Search and Filters** | Filter by text, residence type, price range, and bedrooms |
| 👤 | **Role-Aware UI** | Connected wallet labeled as seller, buyer, inspector, lender, or connected user |
| 🧭 | **Operational Navigation** | Buy, Rent, and Sell nav actions update the app view and seller flow |
| ✉️ | **In-App Contact Inquiry** | Property detail modals include a contact form — no external mail client |
| 🔗 | **Polished Footer** | Author contact details, LinkedIn, repo link, and project disclaimer |
| ✅ | **Hardhat Testing** | Smart contract behavior covered by a local test suite |

---

## Recent Changes

```diff
+ Added seller-only manual listing through the `List New Property` modal
+ New listings upload image and metadata to Pinata/IPFS
+ Frontend refreshes from totalSupply() and tokenURI() after minting and listing
+ Added real search/filter controls for property discovery
+ Added operational nav actions for Buy, Rent, and Sell
+ Added connected user role display in the navigation bar
+ Added in-app Contact Agent inquiry form inside the property detail modal
+ Improved clicked property detail modal with token, residence type, and compact facts grid
+ Added project footer with author/contact links and a demo disclaimer
~ Fixed lender funding math to use ethers BigNumber subtraction
+ Added .env.example documenting the required Pinata JWT
```

---

## Technology Stack

| Technology | Purpose |
|------------|---------|
| **Solidity** | Smart contract development |
| **OpenZeppelin** | ERC-721 NFT implementation |
| **Hardhat** | Local blockchain, deployment, and testing |
| **Ethers.js** | Blockchain interaction from scripts and React |
| **React.js** | Frontend UI |
| **Pinata / IPFS** | Storage for manually added property images and metadata |

---

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** — v16 or v18 recommended for this Hardhat version
- **npm** or **yarn**
- **MetaMask** browser extension
- **Pinata account + JWT** for manual property uploads

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Aadit0508/millow.git
cd millow
git checkout manual-property-addition
```

### 2. Install Dependencies

```bash
npm install
```

---

## Environment Variables

Manual property addition requires a Pinata JWT so the browser can upload the image and generated metadata JSON to IPFS.

Create a `.env` file in the project root:

```env
REACT_APP_PINATA_JWT=your_pinata_jwt_here
```

> ⚠️ Do **not** commit your real `.env` file. Use `.env.example` as the template.

---

## Usage

### 1 — Run Tests

```bash
npx hardhat test
```

### 2 — Start Local Blockchain

```bash
npx hardhat node
```

> Keep this terminal running.

### 3 — Deploy Smart Contracts

In a second terminal:

```bash
npx hardhat run ./scripts/deploy.js --network localhost
```

### 4 — Launch Frontend

In a third terminal:

```bash
npm run start
```

App opens at **`http://localhost:3000`**

---

## Manual Property Addition

> Only the **seller wallet** can add a new property.

In the local Hardhat deploy script, accounts are assigned like this:

```js
const [buyer, seller, inspector, lender] = await ethers.getSigners()
```

> ⚠️ The seller is the **second** Hardhat account in MetaMask, not the first.

### Steps

1. Start the Hardhat node
2. Deploy the contracts
3. Start the React app
4. Connect MetaMask to the local Hardhat network
5. Switch MetaMask to the **seller** account
6. Click `Sell` in the navigation
7. Click `+ List New Property`
8. Fill in property details and the buyer wallet address
9. Upload a property image
10. Submit the form

### What Happens Under the Hood

```
Image → Pinata/IPFS
         ↓
Metadata JSON → Pinata/IPFS
                 ↓
          Mint NFT (tokenURI = IPFS metadata URL)
                 ↓
       Approve escrow contract
                 ↓
        List token in escrow
                 ↓
     Refresh property cards from chain
```

---

## User Roles

The navigation bar shows the connected wallet's role based on the deployed escrow contract:

| Role | Permissions |
|------|-------------|
| 🟡 **Seller** | Can list new properties and finalize sales |
| 🔵 **Buyer** | Can deposit earnest money and approve the sale |
| 🟢 **Inspector** | Can approve the inspection |
| 🟣 **Lender** | Can approve lending and fund the remaining purchase amount |
| ⚪ **Connected** | Wallet connected but no known escrow role |

> MetaMask doesn't allow silent account switching. To act in a different role, manually switch accounts in MetaMask.

---

## Search and Filtering

The property list supports:

- **Text search** — name, address, description, and residence type
- **Residence type** — filter by property category
- **Price range** — minimum and maximum price
- **Bedrooms** — minimum bedroom count

Filtering works for both the original local metadata properties and newly minted IPFS properties — all cards load from NFT `tokenURI()` values.

---

## Metadata Storage

The first six demo properties use local metadata:

```
public/metadata/
├── 1.json
├── 2.json
├── 3.json
├── 4.json
├── 5.json
└── 6.json
```

Manually added properties work differently:

- Image → uploaded to Pinata/IPFS
- Metadata JSON → generated in-browser, uploaded to Pinata/IPFS
- IPFS metadata URL → stored on-chain as the NFT `tokenURI`

After a browser reload, manually added properties persist as long as the local Hardhat blockchain is still running and the Pinata URLs are available.

> ⚠️ Restarting `npx hardhat node` resets the local chain. Uploaded Pinata metadata may survive, but locally minted NFTs must be re-minted.

---

## Testing

```bash
# Run smart contract tests
npx hardhat test

# Production build
npm run build
```

---

## Project Structure

```
millow/
├── contracts/           # Solidity smart contracts
├── scripts/             # Deployment scripts
├── test/                # Smart contract tests
├── src/
│   ├── abis/            # Contract ABIs used by the frontend
│   ├── assets/          # Images and static frontend assets
│   ├── components/      # React components
│   ├── App.js           # Main application component
│   └── config.json      # Deployed contract addresses by chain ID
├── public/              # Public assets and demo metadata
├── hardhat.config.js    # Hardhat configuration
├── package.json         # Project dependencies and scripts
└── .env.example         # Environment variable template
```

---

## License

This project is licensed under the **MIT License**.

---

<div align="center">

<br/>

*Built with* ❤️ *by* **Aadit Mehtani**

<br/>

**[↑ Back to top](#real-estate-nft-dapp)**

</div>
