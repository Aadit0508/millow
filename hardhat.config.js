require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.17",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [
        process.env.PRIVATE_KEY_SELLER,    // index 0 → seller
        process.env.PRIVATE_KEY_BUYER,     // index 1 → buyer
        process.env.PRIVATE_KEY_INSPECTOR, // index 2 → inspector
        process.env.PRIVATE_KEY_LENDER     // index 3 → lender
      ]
    }
  }
};