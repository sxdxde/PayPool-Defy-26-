// SPDX-License-Identifier: MIT

pragma solidity ^0.8.30;

import { e, ebool, euint256, inco } from "@inco/lightning/src/Lib.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title SalaryPool
 * @notice FHE-encrypted salary benchmarking for confidential percentile rankings
 * @dev Stores encrypted salaries by role. Percentile computation happens client-side
 *      using attested decryption to preserve privacy while allowing comparisons.
 */
contract SalaryPool is Ownable2Step {
    
    error InsufficientFees();
    error AlreadySubmitted();
    error NoSalarySubmitted();
    error EmptyBucket();
    
    event SalarySubmitted(uint256 indexed roleId, address indexed submitter, uint256 bucketSize);
    
    struct SalaryBucket {
        euint256[] salaries;
        mapping(address => bool) hasSubmitted;
        mapping(address => uint256) userSalaryIndex;
    }
    
    // roleId => SalaryBucket
    mapping(uint256 => SalaryBucket) private salaryBuckets;
    
    // roleId => count of submissions
    mapping(uint256 => uint256) public bucketCounts;
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Submit encrypted salary for a specific role
     * @param roleId The role identifier (e.g., 1 = React Dev Bangalore)
     * @param encryptedSalary FHE-encrypted salary amount
     */
    function submitSalary(
        uint256 roleId,
        bytes calldata encryptedSalary
    ) 
        external 
        payable 
    {
        _requireFee(1);
        
        if (salaryBuckets[roleId].hasSubmitted[msg.sender]) {
            revert AlreadySubmitted();
        }
        
        // Convert encrypted input to euint256
        euint256 salary = e.newEuint256(encryptedSalary, msg.sender);
        e.allow(salary, address(this));
        e.allow(salary, msg.sender);
        
        // Store encrypted salary
        salaryBuckets[roleId].salaries.push(salary);
        salaryBuckets[roleId].hasSubmitted[msg.sender] = true;
        salaryBuckets[roleId].userSalaryIndex[msg.sender] = salaryBuckets[roleId].salaries.length - 1;
        bucketCounts[roleId]++;
        
        emit SalarySubmitted(roleId, msg.sender, bucketCounts[roleId]);
    }
    
    /**
     * @notice Get encrypted salary handle for user (for attested decryption client-side)
     * @param roleId The role identifier
     * @return The encrypted salary handle for the caller
     */
    function getMySalary(uint256 roleId) external view returns (euint256) {
        if (!salaryBuckets[roleId].hasSubmitted[msg.sender]) {
            revert NoSalarySubmitted();
        }
        
        uint256 index = salaryBuckets[roleId].userSalaryIndex[msg.sender];
        return salaryBuckets[roleId].salaries[index];
    }
    
    /**
     * @notice Get all encrypted salary handles in a bucket
     * @dev Used for clientside percentile calculation via attested computations
     * @param roleId The role identifier
     * @return Array of encrypted salary handles
     */
    function getAllSalaries(uint256 roleId) external view returns (euint256[] memory) {
        return salaryBuckets[roleId].salaries;
    }
    
    /**
     * @notice Get the encrypted market rate (sum) for a role
     * @dev Returns encrypted sum - division happens client-side
     * @param roleId The role identifier
     * @return Encrypted sum of all salaries
     */
    function getMarketRateSum(uint256 roleId) external returns (euint256) {
        if (bucketCounts[roleId] == 0) {
            revert EmptyBucket();
        }
        
        euint256[] memory salaries = salaryBuckets[roleId].salaries;
        
        // Calculate encrypted sum
        euint256 sum = salaries[0];
        for (uint256 i = 1; i < salaries.length; i++) {
            sum = e.add(sum, salaries[i]);
        }
        
        return sum;
    }
    
    /**
     * @notice Check if an address has submitted for a role
     */
    function hasUserSubmitted(uint256 roleId, address user) external view returns (bool) {
        return salaryBuckets[roleId].hasSubmitted[user];
    }
    
    /**
     * @notice Get the encrypted salary handle for a user (view by anyone)
     * @dev For attested computation comparisons
     */
    function getUserSalaryHandle(uint256 roleId, address user) external view returns (euint256) {
        if (!salaryBuckets[roleId].hasSubmitted[user]) {
            revert NoSalarySubmitted();
        }
        
        uint256 index = salaryBuckets[roleId].userSalaryIndex[user];
        return salaryBuckets[roleId].salaries[index];
    }
    
    /**
     * @dev Require minimum fee for FHE operations
     */
    function _requireFee(uint256 cipherTextCount) internal view {
        if (msg.value < inco.getFee() * cipherTextCount) {
            revert InsufficientFees();
        }
    }
}
