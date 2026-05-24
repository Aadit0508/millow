<div align="center">

# Real Estate NFT DApp

### Tokenize, Trade, List, and Own Virtual Properties on the Blockchain

[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.0-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.0-yellow?style=for-the-badge&logo=hardhat)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-18.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-v5-blue?style=for-the-badge&logo=ethereum)](https://docs.ethers.io/v5/)

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

- **Secure Ownership** - Properties are tokenized as ERC-721 NFTs.
- **Escrow Workflow** - Buyer, seller, inspector, and lender approvals are handled by the escrow contract.
- **Manual Property Addition** - Sellers can upload a property image, generate metadata, mint an NFT, and list it from the UI.
- **IPFS Metadata Storage** - New property images and metadata are uploaded to Pinata/IPFS.
- **Search and Filters** - Users can search and filter properties by text, residence type, price range, and bedrooms.
- **Role-Aware UI** - The connected wallet is labeled as seller, buyer, inspector, lender, or connected user.
- **Operational Navigation** - Buy, Rent, and Sell navigation actions update the app view and seller flow.
- **In-App Contact Inquiry** - Property detail modals include a contact form instead of opening an external mail client.
- **Polished Project Footer** - Footer includes author contact details, LinkedIn, repo link, and project disclaimer.
- **Hardhat Testing** - Smart contract behavior is covered by a local test suite.

---

## Recent Changes

- Added seller-only manual listing through the `List New Property` modal.
- New listings upload image and metadata to Pinata/IPFS.
- After minting and listing a property, the frontend refreshes from `totalSupply()` and `tokenURI()`.
- Added real search/filter controls for property discovery.
- Added operational nav actions for Buy, Rent, and Sell.
- Added connected user role display in the navigation bar.
- Added an in-app Contact Agent inquiry form inside the property detail modal.
- Improved clicked property detail modal with token, residence type, and a compact facts grid.
- Added a project footer with author/contact links and a demo disclaimer.
- Fixed lender funding math to use ethers `BigNumber` subtraction.
- Added `.env.example` documenting the required Pinata JWT.

---

## Technology Stack

| Technology | Purpose |
|------------|---------|
| **Solidity** | Smart contract development |
| **OpenZeppelin** | ERC-721 NFT implementation |
| **Hardhat** | Local blockchain, deployment, and testing |
| **Ethers.js** | Blockchain interaction from scripts and React |
| **React.js** | Frontend UI |
| **Pinata/IPFS** | Storage for manually added property images and metadata |

---

## Prerequisites

Before you begin, install:

- **Node.js** - Recommended: Node 16 or 18 for this Hardhat version
- **npm** or **yarn**
- **MetaMask**
- **Pinata account and JWT** for manual property uploads

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

Do not commit your real `.env` file. Use `.env.example` as the template.

---

## Usage

### 1. Run Tests

```bash
npx hardhat test
```

### 2. Start Local Blockchain

```bash
npx hardhat node
```

Keep this terminal running.

### 3. Deploy Smart Contracts

In a second terminal:

```bash
npx hardhat run ./scripts/deploy.js --network localhost
```

### 4. Launch Frontend

In another terminal:

```bash
npm run start
```

The application will open at:

```text
http://localhost:3000
```

---

## Manual Property Addition

Only the seller wallet can add a new property.

In the local Hardhat deploy script, accounts are assigned like this:

```js
const [buyer, seller, inspector, lender] = await ethers.getSigners()
```

That means the seller is usually the second Hardhat account in MetaMask, not the first one.

To add a property:

1. Start the Hardhat node.
2. Deploy the contracts.
3. Start the React app.
4. Connect MetaMask to the local Hardhat network.
5. Switch MetaMask to the seller account.
6. Click `Sell` in the navigation.
7. Click `+ List New Property`.
8. Fill in the property details and buyer wallet address.
9. Upload a property image.
10. Submit the form.

The app will:

1. Upload the image to Pinata/IPFS.
2. Generate metadata JSON in the browser.
3. Upload the metadata JSON to Pinata/IPFS.
4. Mint a new NFT using the metadata URL as the `tokenURI`.
5. Approve the escrow contract.
6. List the new token in escrow.
7. Refresh the property cards from the blockchain.

---

## User Roles

The navigation bar shows the connected wallet role based on the deployed escrow contract:

- **Seller** - Can list new properties and finalize sales.
- **Buyer** - Can deposit earnest money and approve the sale.
- **Inspector** - Can approve inspection.
- **Lender** - Can approve lending and fund the remaining purchase amount.
- **Connected** - Wallet is connected but does not match a known escrow role.

MetaMask does not allow apps to silently switch accounts. If you need another role, switch to the relevant account in MetaMask.

---

## Search and Filtering

The property list supports:

- Text search across name, address, description, and residence type
- Residence type filtering
- Minimum price
- Maximum price
- Minimum bedrooms

Filtering works for both the original local metadata properties and newly minted IPFS properties because all cards are loaded from NFT `tokenURI()` values.

---

## Metadata Storage

The first six demo properties use local metadata files:

```text
public/metadata/1.json
public/metadata/2.json
public/metadata/3.json
public/metadata/4.json
public/metadata/5.json
public/metadata/6.json
```

New manually added properties are different:

- The image is uploaded to Pinata/IPFS.
- The generated metadata JSON is uploaded to Pinata/IPFS.
- The IPFS metadata URL is stored on-chain as the NFT `tokenURI`.

After a browser reload, manually added properties will still appear as long as the same local Hardhat blockchain is still running and the Pinata/IPFS URLs remain available.

If you restart `npx hardhat node`, the local blockchain state resets. The uploaded Pinata metadata may still exist, but the locally minted NFTs will be gone unless you mint them again.

---

## Testing

Run the smart contract tests:

```bash
npx hardhat test
```

Run the React production build:

```bash
npm run build
```

---

## Project Structure

```text
millow/
├── contracts/          # Solidity smart contracts
├── scripts/            # Deployment scripts
├── test/               # Smart contract tests
├── src/                # React frontend source
│   ├── abis/           # Contract ABIs used by the frontend
│   ├── assets/         # Images and static frontend assets
│   ├── components/     # React components
│   ├── App.js          # Main application component
│   └── config.json     # Deployed contract addresses by chain ID
├── public/             # Public assets and demo metadata
├── hardhat.config.js   # Hardhat configuration
├── package.json        # Project dependencies and scripts
└── .env.example        # Environment variable template
```

---

## License

This project is licensed under the MIT License.

---

<div align="center">

### Built by Aadit Mehtani

**[Back to top](#real-estate-nft-dapp)**

</div>
