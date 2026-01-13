import { createWalletClient, createPublicClient, http, custom, type Address } from "viem";
import { privateKeyToAccount, mnemonicToAccount } from "viem/accounts";
import { baseSepolia, anvil, hardhat } from "viem/chains";
import * as dotenv from "dotenv";
import { HexString } from "@inco/js";

dotenv.config();

// Determine whether to use Anvil (local) or Base Sepolia by reading Hardhat's runtime environment
import { network } from "hardhat";
const networkName = network.name;
const USE_LOCAL = networkName === "anvil" || networkName === "hardhat" || networkName === "localhost";
console.log(`Detected network: ${networkName}`);

// Choose chain and RPC URL based on network
const chain = networkName === "hardhat" ? hardhat : (USE_LOCAL ? anvil : baseSepolia);
const rpcUrl = USE_LOCAL
  ? process.env.LOCAL_CHAIN_RPC_URL || "http://localhost:8545"
  : process.env.BASE_SEPOLIA_RPC_URL || "https://base-sepolia-rpc.publicnode.com";

// Load and validate PRIVATE_KEY based on selected network
// Load and validate PRIVATE_KEY based on selected network
let PRIVATE_KEY_ENV = USE_LOCAL
  ? process.env.PRIVATE_KEY_ANVIL
  : process.env.PRIVATE_KEY_BASE_SEPOLIA;

// Fallback to default Hardhat Account #0 private key if running on hardhat network and key is missing
if ((networkName === "hardhat" || networkName === "localhost") && !PRIVATE_KEY_ENV) {
  PRIVATE_KEY_ENV = "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
}

if (!PRIVATE_KEY_ENV) {
  throw new Error(
    `Missing ${USE_LOCAL ? "PRIVATE_KEY_ANVIL" : "PRIVATE_KEY_BASE_SEPOLIA"} in .env file`
  );
}

const PRIVATE_KEY = PRIVATE_KEY_ENV.startsWith("0x")
  ? (PRIVATE_KEY_ENV as HexString)
  : (`0x${PRIVATE_KEY_ENV}` as HexString);

if (PRIVATE_KEY.length !== 66) {
  throw new Error("Invalid private key length in .env file");
}

// Create account from private key
const account = privateKeyToAccount(PRIVATE_KEY);

// Determine transport based on network
// For 'hardhat' network (in-process), use custom transport with network.provider
const transport = networkName === "hardhat"
  ? custom(network.provider)
  : http(rpcUrl);

// Public client (read-only)
export const publicClient = createPublicClient({
  chain,
  transport,
});

// Wallet client (signing)
export const wallet = createWalletClient({
  account,
  chain,
  transport,
});


// Generate named wallets from mnemonic
const MNEMONIC = process.env.SEED_PHRASE;
if (!MNEMONIC) throw new Error("Missing SEED_PHRASE in .env file");

export const namedWallets: Record<string, ReturnType<typeof createWalletClient>> = {
  alice: createWalletClient({
    account: mnemonicToAccount(MNEMONIC, { path: "m/44'/60'/0'/0/0" }),
    chain,
    transport,
  }),
  bob: createWalletClient({
    account: mnemonicToAccount(MNEMONIC, { path: "m/44'/60'/0'/0/1" }),
    chain,
    transport,
  }),
  charlie: createWalletClient({
    account: mnemonicToAccount(MNEMONIC, { path: "m/44'/60'/0'/0/2" }),
    chain,
    transport,
  }),
  dave: createWalletClient({
    account: mnemonicToAccount(MNEMONIC, { path: "m/44'/60'/0'/0/3" }),
    chain,
    transport,
  }),
  carol: createWalletClient({
    account: mnemonicToAccount(MNEMONIC, { path: "m/44'/60'/0'/0/4" }),
    chain,
    transport,
  }),
  john: createWalletClient({
    account: mnemonicToAccount(MNEMONIC, { path: "m/44'/60'/0'/0/4" }),
    chain,
    transport,
  }),
};

console.log("Named wallets created:");
Object.entries(namedWallets).forEach(([name, client]) => {
  console.log(`   - ${name}: ${client.account?.address as Address}`);
});
