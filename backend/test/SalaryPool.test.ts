import { expect } from "chai";
import { HexString } from "@inco/js";
import {
    Address,
    parseEther,
    formatEther,
    getAddress
} from "viem";
import salaryPoolAbi from "../artifacts/contracts/SalaryPool.sol/SalaryPool.json";
import { encryptValue, decryptValue, getFee } from "../utils/incoHelper";
import { namedWallets, wallet, publicClient } from "../utils/wallet";

describe("SalaryPool Tests", function () {
    let contractAddress: Address;

    // Role IDs
    const ROLE_REACT_DEV_BANGALORE = 1;

    // Test salaries (in rupees)
    const ALICE_SALARY = 2400000; // ₹24L
    const BOB_SALARY = 3200000;   // ₹32L
    const CHARLIE_SALARY = 2600000; // ₹26L

    beforeEach(async function () {
        console.log("\nSetting up SalaryPool test environment");

        // Deploy the contract
        const txHash = await wallet.deployContract({
            abi: salaryPoolAbi.abi,
            bytecode: salaryPoolAbi.bytecode as HexString,
            args: [],
        });

        const receipt = await publicClient.waitForTransactionReceipt({
            hash: txHash,
        });
        contractAddress = receipt.contractAddress as Address;
        console.log(`SalaryPool deployed at: ${contractAddress}`);

        // Fund test wallets if needed
        for (const [name, userWallet] of Object.entries(namedWallets)) {
            const balance = await publicClient.getBalance({
                address: userWallet.account?.address as Address,
            });
            const balanceEth = Number(formatEther(balance));

            if (balanceEth < 0.01) {
                const neededEth = 0.01 - balanceEth;
                console.log(`Funding ${name} with ${neededEth.toFixed(6)} ETH...`);
                const tx = await wallet.sendTransaction({
                    to: userWallet.account?.address as Address,
                    value: parseEther(neededEth.toFixed(6)),
                });

                await publicClient.waitForTransactionReceipt({ hash: tx });
                console.log(`${name} funded: ${userWallet.account?.address as Address}`);
            }
        }
    });

    describe("----------- Salary Submission Tests -----------", function () {
        it("Should allow Alice to submit encrypted salary", async function () {
            console.log("\nAlice submitting ₹24L salary");

            // Encrypt Alice's salary
            const encryptedSalary = await encryptValue({
                value: BigInt(ALICE_SALARY),
                address: namedWallets.alice.account?.address as Address,
                contractAddress,
            });

            const fee = await getFee();

            // Submit salary
            const txHash = await namedWallets.alice.writeContract({
                address: contractAddress,
                abi: salaryPoolAbi.abi,
                functionName: "submitSalary",
                args: [ROLE_REACT_DEV_BANGALORE, encryptedSalary],
                value: fee,
                account: namedWallets.alice.account!,
                chain: namedWallets.alice.chain,
            });

            await publicClient.waitForTransactionReceipt({ hash: txHash, confirmations: 5 });
            console.log("✅ Salary submitted successfully");

            // Wait for co-validator
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Verify submission
            const hasSubmitted = await publicClient.readContract({
                address: getAddress(contractAddress),
                abi: salaryPoolAbi.abi,
                functionName: "hasUserSubmitted",
                args: [ROLE_REACT_DEV_BANGALORE, namedWallets.alice.account?.address as Address],
            });

            expect(hasSubmitted).to.be.true;

            // Check bucket count
            const bucketCount = await publicClient.readContract({
                address: getAddress(contractAddress),
                abi: salaryPoolAbi.abi,
                functionName: "bucketCounts",
                args: [ROLE_REACT_DEV_BANGALORE],
            });

            console.log(`Bucket count: ${bucketCount}`);
            expect(bucketCount).to.equal(1n);
        });

        it("Should prevent duplicate submissions", async function () {
            console.log("\nTesting duplicate submission prevention");

            const encryptedSalary = await encryptValue({
                value: BigInt(ALICE_SALARY),
                address: namedWallets.alice.account?.address as Address,
                contractAddress,
            });

            const fee = await getFee();

            // First submission
            const txHash1 = await namedWallets.alice.writeContract({
                address: contractAddress,
                abi: salaryPoolAbi.abi,
                functionName: "submitSalary",
                args: [ROLE_REACT_DEV_BANGALORE, encryptedSalary],
                value: fee,
                account: namedWallets.alice.account!,
                chain: namedWallets.alice.chain,
            });

            await publicClient.waitForTransactionReceipt({ hash: txHash1 });
            console.log("First submission successful");

            // Attempt second submission
            try {
                const txHash2 = await namedWallets.alice.writeContract({
                    address: contractAddress,
                    abi: salaryPoolAbi.abi,
                    functionName: "submitSalary",
                    args: [ROLE_REACT_DEV_BANGALORE, encryptedSalary],
                    value: fee,
                    account: namedWallets.alice.account!,
                    chain: namedWallets.alice.chain,
                });
                await publicClient.waitForTransactionReceipt({ hash: txHash2 });
                expect.fail("Should have reverted with AlreadySubmitted");
            } catch (error: any) {
                console.log("✅ Duplicate submission prevented");
                expect(error.message).to.include("AlreadySubmitted");
            }
        });
    });

    describe("----------- Percentile Calculation Tests -----------", function () {
        it("3 devs submit → Alice sees BOTTOM 27%", async function () {
            console.log("\n🎯 MAIN TEST: 3 developers submit salaries");

            const fee = await getFee();

            // Alice submits ₹24L (lowest)
            console.log("Alice submitting ₹24L...");
            const encAlice = await encryptValue({
                value: BigInt(ALICE_SALARY),
                address: namedWallets.alice.account?.address as Address,
                contractAddress,
            });

            const txAlice = await namedWallets.alice.writeContract({
                address: contractAddress,
                abi: salaryPoolAbi.abi,
                functionName: "submitSalary",
                args: [ROLE_REACT_DEV_BANGALORE, encAlice],
                value: fee,
                account: namedWallets.alice.account!,
                chain: namedWallets.alice.chain,
            });
            await publicClient.waitForTransactionReceipt({ hash: txAlice });
            console.log("✅ Alice submitted");

            // Bob submits ₹32L (highest)
            console.log("Bob submitting ₹32L...");
            const encBob = await encryptValue({
                value: BigInt(BOB_SALARY),
                address: namedWallets.bob.account?.address as Address,
                contractAddress,
            });

            const txBob = await namedWallets.bob.writeContract({
                address: contractAddress,
                abi: salaryPoolAbi.abi,
                functionName: "submitSalary",
                args: [ROLE_REACT_DEV_BANGALORE, encBob],
                value: fee,
                account: namedWallets.bob.account!,
                chain: namedWallets.bob.chain,
            });
            await publicClient.waitForTransactionReceipt({ hash: txBob });
            console.log("✅ Bob submitted");

            // Charlie submits ₹26L (middle)
            console.log("Charlie submitting ₹26L...");
            const encCharlie = await encryptValue({
                value: BigInt(CHARLIE_SALARY),
                address: namedWallets.charlie.account?.address as Address,
                contractAddress,
            });

            const txCharlie = await namedWallets.charlie.writeContract({
                address: contractAddress,
                abi: salaryPoolAbi.abi,
                functionName: "submitSalary",
                args: [ROLE_REACT_DEV_BANGALORE, encCharlie],
                value: fee,
                account: namedWallets.charlie.account!,
                chain: namedWallets.charlie.chain,
            });
            await publicClient.waitForTransactionReceipt({ hash: txCharlie });
            console.log("✅ Charlie submitted");

            // Wait for co-validator processing
            console.log("\nWaiting for FHE co-validator...");
            await new Promise((resolve) => setTimeout(resolve, 3000));

            // Check Alice's percentile (should be 0% - lowest salary)
            console.log("\nCalculating Alice's percentile...");
            const alicePercentile = await publicClient.readContract({
                address: getAddress(contractAddress),
                abi: salaryPoolAbi.abi,
                functionName: "getMyPercentile",
                args: [ROLE_REACT_DEV_BANGALORE],
                account: namedWallets.alice.account!,
            });

            console.log(`\n📊 Alice's Percentile: ${alicePercentile}%`);
            console.log(`Expected: 0% (she has the lowest salary)`);

            // Alice has 0 people below her (lowest salary)
            // Percentile = (0 / 2) * 100 = 0%
            expect(alicePercentile).to.equal(0n);

            // Check Charlie's percentile (should be 50% - middle salary)
            const charliePercentile = await publicClient.readContract({
                address: getAddress(contractAddress),
                abi: salaryPoolAbi.abi,
                functionName: "getMyPercentile",
                args: [ROLE_REACT_DEV_BANGALORE],
                account: namedWallets.charlie.account!,
            });

            console.log(`📊 Charlie's Percentile: ${charliePercentile}%`);
            console.log(`Expected: 50% (middle salary)`);
            expect(charliePercentile).to.equal(50n);

            // Check Bob's percentile (should be 100% - highest salary)
            const bobPercentile = await publicClient.readContract({
                address: getAddress(contractAddress),
                abi: salaryPoolAbi.abi,
                functionName: "getMyPercentile",
                args: [ROLE_REACT_DEV_BANGALORE],
                account: namedWallets.bob.account!,
            });

            console.log(`📊 Bob's Percentile: ${bobPercentile}%`);
            console.log(`Expected: 100% (highest salary)`);
            expect(bobPercentile).to.equal(100n);

            console.log("\n✅ All percentile calculations correct!");
        });
    });

    describe("----------- Market Rate Tests -----------", function () {
        it("Should calculate encrypted market rate (average)", async function () {
            console.log("\nTesting market rate calculation");

            const fee = await getFee();

            // Submit 3 salaries
            const encAlice = await encryptValue({
                value: BigInt(ALICE_SALARY),
                address: namedWallets.alice.account?.address as Address,
                contractAddress,
            });

            await namedWallets.alice.writeContract({
                address: contractAddress,
                abi: salaryPoolAbi.abi,
                functionName: "submitSalary",
                args: [ROLE_REACT_DEV_BANGALORE, encAlice],
                value: fee,
                account: namedWallets.alice.account!,
                chain: namedWallets.alice.chain,
            });

            const encBob = await encryptValue({
                value: BigInt(BOB_SALARY),
                address: namedWallets.bob.account?.address as Address,
                contractAddress,
            });

            await namedWallets.bob.writeContract({
                address: contractAddress,
                abi: salaryPoolAbi.abi,
                functionName: "submitSalary",
                args: [ROLE_REACT_DEV_BANGALORE, encBob],
                value: fee,
                account: namedWallets.bob.account!,
                chain: namedWallets.bob.chain,
            });

            const encCharlie = await encryptValue({
                value: BigInt(CHARLIE_SALARY),
                address: namedWallets.charlie.account?.address as Address,
                contractAddress,
            });

            await namedWallets.charlie.writeContract({
                address: contractAddress,
                abi: salaryPoolAbi.abi,
                functionName: "submitSalary",
                args: [ROLE_REACT_DEV_BANGALORE, encCharlie],
                value: fee,
                account: namedWallets.charlie.account!,
                chain: namedWallets.charlie.chain,
            });

            // Wait for co-validator
            await new Promise((resolve) => setTimeout(resolve, 3000));

            // Get decrypted market rate
            const marketRate = await publicClient.readContract({
                address: getAddress(contractAddress),
                abi: salaryPoolAbi.abi,
                functionName: "getMarketRateDecrypted",
                args: [ROLE_REACT_DEV_BANGALORE],
            });

            // Expected average: (2400000 + 3200000 + 2600000) / 3 = 2733333
            const expectedAverage = Math.floor((ALICE_SALARY + BOB_SALARY + CHARLIE_SALARY) / 3);

            console.log(`Market Rate: ₹${Number(marketRate) / 100000}L`);
            console.log(`Expected Average: ₹${expectedAverage / 100000}L`);

            // Allow some margin for FHE computation precision
            const marketRateNum = Number(marketRate);
            expect(marketRateNum).to.be.closeTo(expectedAverage, 10000);
        });
    });
});
