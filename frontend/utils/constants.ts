import { type Address } from "viem";

export const SALARY_POOL_ADDRESS: Address = "0x0562387B0DCc9D48795B6de979640932C0b610dd";

export const SALARY_POOL_ABI = [
    {
        type: "function",
        name: "submitSalary",
        inputs: [
            { name: "roleId", type: "uint256" },
            { name: "encryptedSalary", type: "bytes" },
        ],
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        name: "hasUserSubmitted",
        inputs: [
            { name: "roleId", type: "uint256" },
            { name: "user", type: "address" },
        ],
        outputs: [{ type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "bucketCounts",
        inputs: [{ name: "roleId", type: "uint256" }],
        outputs: [{ type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "event",
        name: "SalarySubmitted",
        inputs: [
            { name: "roleId", type: "uint256", indexed: true },
            { name: "user", type: "address", indexed: true },
            { name: "count", type: "uint256", indexed: false },
        ],
    },
    {
        type: "error",
        name: "AlreadySubmitted",
    },
    {
        type: "error",
        name: "InsufficientFee",
    },
] as const;

export type City = "Bangalore" | "Mumbai" | "Delhi" | "Hyderabad" | "Pune";
export type JobPosition = "Software Engineer" | "Senior Software Engineer" | "Engineering Manager" | "Product Manager" | "Data Scientist";

export const CITIES: City[] = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune"];
export const JOB_POSITIONS: JobPosition[] = [
    "Software Engineer",
    "Senior Software Engineer",
    "Engineering Manager",
    "Product Manager",
    "Data Scientist",
];

// Generate roleId from city + position
export function generateRoleId(city: City, position: JobPosition): number {
    const cityIndex = CITIES.indexOf(city);
    const positionIndex = JOB_POSITIONS.indexOf(position);
    return cityIndex * 10 + positionIndex + 1;
}

export function getRoleDescription(city: City, position: JobPosition): string {
    return `${position} in ${city}`;
}
