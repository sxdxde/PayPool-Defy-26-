#!/usr/bin/env node

/**
 * Deployment script for SalaryPool contract to Sepolia testnet
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-sepolia.ts --network sepolia
 * 
 * Make sure to set the following in your .env file:
 *   - INFURA_KEY: Your Infura API key
 *   - PRIVATE_KEY_BASE_SEPOLIA: Private key with Sepolia ETH
 *   - ETHERSCAN_API_KEY: For contract verification (optional)
 */

import { viem } from "hardhat";
import { formatEther } from "viem";

async function main() {
    console.log("🚀 Deploying SalaryPool to Sepolia testnet...\n");

    // Get deployer account
    const [deployer] = await viem.getWalletClients();
    const publicClient = await viem.getPublicClient();

    console.log("📋 Deployment Details:");
    console.log("   Deployer:", deployer.account.address);

    // Check balance
    const balance = await publicClient.getBalance({
        address: deployer.account.address
    });
    console.log("   Balance:", formatEther(balance), "ETH");

    if (balance === 0n) {
        throw new Error("❌ Deployer account has no ETH. Get testnet ETH from https://sepoliafaucet.com/");
    }

    // Get current network
    const chainId = await publicClient.getChainId();
    console.log("   Chain ID:", chainId);
    console.log("   Network:", chainId === 11155111 ? "Sepolia ✅" : "⚠️  Unknown");

    if (chainId !== 11155111) {
        throw new Error("❌ Not connected to Sepolia testnet! Chain ID should be 11155111");
    }

    console.log("\n📝 Deploying SalaryPool contract...");

    // Deploy the contract
    const salaryPool = await viem.deployContract("SalaryPool");

    console.log("\n✅ SalaryPool deployed successfully!");
    console.log("   Contract Address:", salaryPool.address);

    // Wait for a few confirmations
    console.log("\n⏳ Waiting for confirmations...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

    console.log("\n📊 Contract Information:");
    console.log("   Address:", salaryPool.address);
    console.log("   Network: Sepolia Testnet");
    console.log("   Explorer:", `https://sepolia.etherscan.io/address/${salaryPool.address}`);

    console.log("\n🔍 To verify the contract on Etherscan, run:");
    console.log(`   npx hardhat verify --network sepolia ${salaryPool.address}`);

    console.log("\n💡 Next Steps:");
    console.log("   1. Update frontend contract address in constants.ts");
    console.log("   2. Verify contract on Etherscan (optional)");
    console.log("   3. Test contract interaction from frontend");

    return salaryPool.address;
}

// Execute deployment
main()
    .then((address) => {
        console.log(`\n✨ Deployment completed! Contract: ${address}\n`);
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });
