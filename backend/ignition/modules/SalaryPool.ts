import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Deploy SalaryPool contract for encrypted salary benchmarking
 */
const SalaryPoolModule = buildModule("SalaryPoolModule", (m) => {
  // Deploy SalaryPool contract
  const salaryPool = m.contract("SalaryPool", []);

  return { salaryPool };
});

export default SalaryPoolModule;
