<div align="center">

# 🏠 Real Estate NFT DApp

### Tokenize, Trade, and Own Virtual Properties on the Blockchain

[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.0-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.0-yellow?style=for-the-badge&logo=hardhat)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-18.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-v5-blue?style=for-the-badge&logo=ethereum)](https://docs.ethers.io/v5/)
[![Sepolia](https://img.shields.io/badge/Network-Sepolia%20Testnet-6f3ff5?style=for-the-badge&logo=ethereum)](https://sepolia.etherscan.io/)
[![IPFS](https://img.shields.io/badge/Metadata-IPFS%20via%20Pinata-65C2CB?style=for-the-badge&logo=ipfs)](https://pinata.cloud/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Deployed Contracts](#-deployed-contracts)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Usage](#-usage)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [License](#-license)

---

## 🌟 Overview

A decentralized application (DApp) that revolutionizes real estate transactions by leveraging blockchain technology and NFTs. This platform enables users to buy, sell, and own virtual properties as non-fungible tokens on the **Ethereum Sepolia testnet**.

Property metadata and images are permanently stored on **IPFS via Pinata**, ensuring decentralized and censorship-resistant storage. Smart contracts handle the full escrow lifecycle — from listing to inspection, approval, and final sale.

> **Branch:** This is the `sepolia` branch — deployed on Ethereum Sepolia testnet with IPFS metadata.
> For the local development version, see the `main` branch.

---

## ✨ Features

- 🔐 **Secure Ownership** - Properties tokenized as ERC-721 NFTs on Ethereum
- 💰 **Escrow Smart Contract** - Full escrow lifecycle: list → inspect → approve → finalize
- 🌍 **Live on Sepolia** - Deployed on Ethereum Sepolia testnet, accessible to anyone
- 📦 **IPFS Metadata** - All property metadata and images stored permanently on IPFS via Pinata
- 🎨 **Interactive UI** - React-based interface for browsing and purchasing properties
- 🧪 **Comprehensive Testing** - Full test suite ensuring contract reliability
- ⚡ **Hardhat Framework** - Rapid iteration and multi-network deployment
- 🌐 **Ethers.js Integration** - Smooth blockchain interactions from the frontend

---

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **Solidity** | Smart contract development (RealEstate + Escrow) |
| **JavaScript** | Frontend development and contract testing |
| **Hardhat** | Ethereum development environment & deployment |
| **Ethers.js** | Blockchain interaction library |
| **React.js** | Frontend framework |
| **Pinata / IPFS** | Decentralized metadata and image storage |
| **Alchemy** | Sepolia RPC endpoint |

---

## 📜 Deployed Contracts

> Network: **Ethereum Sepolia Testnet** (Chain ID: 11155111)

| Contract | Address |
|----------|---------|
| **RealEstate (NFT)** | `0xe80a350f23E5C096Dd9AC6191E063c38E6D2bDBb` |
| **Escrow** | `0x2F9D62804162a671987249d511E4463F2c9A8B0E` |

You can verify these contracts on [Sepolia Etherscan](https://sepolia.etherscan.io/).

---

## 📦 Prerequisites

Before you begin, ensure you have the following:

- **Node.js** (v16.x or higher) — [Download here](https://nodejs.org/en/)
- **npm** or **yarn** package manager
- **MetaMask** browser extension — [Install here](https://metamask.io/download/)
- **Alchemy account** — for Sepolia RPC URL — [Sign up here](https://alchemy.com/)
- **Sepolia ETH** — get free test ETH from [faucet.alchemy.com](https://faucet.alchemy.com/)

---

## 🚀 Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Aadit0508/millow.git
cd millow
git checkout sepolia
```

### 2️⃣ Install Dependencies

```bash
npm install
```

---

## 🔐 Environment Setup

Create a `.env` file in the project root:

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

PRIVATE_KEY_SELLER=your_seller_private_key
PRIVATE_KEY_BUYER=your_buyer_private_key
PRIVATE_KEY_INSPECTOR=your_inspector_private_key
PRIVATE_KEY_LENDER=your_lender_private_key
```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

To get your private key from MetaMask: **3 dots → Account Details → Export Private Key**

---

## 💻 Usage

### Connect MetaMask to Sepolia

1. Open MetaMask
2. Click the network dropdown
3. Select **"Sepolia test network"**
4. Make sure you have Sepolia ETH (get it free from [faucet.alchemy.com](https://faucet.alchemy.com/))

### Launch the Frontend

```bash
npm run start
```

The application will open at `http://localhost:3000`. MetaMask will prompt you to connect your wallet.

---

### Re-deploying Contracts (optional)

If you want to deploy your own instance:

```bash
npx hardhat run ./scripts/deploy.js --network sepolia
```

Then update `src/config.json` with your new contract addresses under chain ID `11155111`.

---

## 🧪 Testing

```bash
# Run all tests
npx hardhat test

# Run tests with gas reporting
REPORT_GAS=true npx hardhat test

# Run a specific test file
npx hardhat test test/RealEstate.test.js
```

---

## 📁 Project Structure

```
millow/
├── contracts/
│   ├── RealEstate.sol      # ERC-721 NFT contract
│   └── Escrow.sol          # Escrow logic contract
├── scripts/
│   └── deploy.js           # Deployment script (Sepolia + IPFS URIs)
├── test/                   # Smart contract tests
├── src/
│   ├── components/         # React components
│   ├── abis/               # Contract ABIs
│   ├── assets/             # Images and static files
│   ├── config.json         # Contract addresses per network
│   └── App.js              # Main application component
├── public/
│   └── metadata/           # Local property metadata (reference)
├── hardhat.config.js       # Hardhat + Sepolia network config
├── .env                    # Secret keys (never commit this)
└── package.json
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### 🌟 Built with ❤️ using Web3 Technologies

**Deployed on Ethereum Sepolia Testnet • Metadata on IPFS**

**[⬆ back to top](#-real-estate-nft-dapp)**

</div>