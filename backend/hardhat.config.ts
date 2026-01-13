import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from "dotenv";

dotenv.config(); // Load environment variables

const PRIVATE_KEY = process.env.PRIVATE_KEY_BASE_SEPOLIA || "";
const PRIVATE_KEY_ANVIL = process.env.PRIVATE_KEY_ANVIL || "";
const INFURA_KEY = process.env.INFURA_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.30",  // Specify the Solidity version
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "cancun" // Specify the EVM version
    }
  },
  networks: {
    hardhat: {}, // Local Hardhat network

    // Inco's local node, based on anvil, called https://github.com/Inco-fhevm/lightning-rod
    // Make sure to run `docker compose up` to start the local node and covalidator
    anvil: {
      url: "http://localhost:8545",
      accounts: PRIVATE_KEY_ANVIL ? [PRIVATE_KEY_ANVIL] : [],
      chainId: 31337
    },

    // Base Sepolia L2 testnet
    baseSepolia: {
      url: BASE_SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 84532
    },

    // Ethereum Sepolia testnet
    sepolia: {
      url: INFURA_KEY
        ? `https://sepolia.infura.io/v3/${INFURA_KEY}`
        : "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
      timeout: 60000 // 60 seconds
    }
  },

  // Etherscan API key for contract verification
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
      baseSepolia: process.env.BASESCAN_API_KEY || ""
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      }
    ]
  }
};

export default config;

