"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import Header from "@/components/Header";
import { CITIES, JOB_POSITIONS, type City, type JobPosition, generateRoleId, getRoleDescription } from "@/utils/constants";

export default function Home() {
    const router = useRouter();
    const { address, isConnected } = useAccount();

    const [city, setCity] = useState<City>("Bangalore");
    const [position, setPosition] = useState<JobPosition>("Software Engineer");
    const [salary, setSalary] = useState(2400000); // ₹24L in paisa
    const [peerCount, setPeerCount] = useState(0);

    const formatSalary = (amount: number) => {
        return `₹${(amount / 100000).toFixed(1)}L`;
    };

    const handleSubmit = async () => {
        if (!isConnected) {
            alert("Please connect your wallet first");
            return;
        }

        const roleId = generateRoleId(city, position);

        // For now, navigate to results page with params
        // In production, this would submit the encrypted salary
        router.push(`/percentile?city=${city}&position=${position}&salary=${salary}`);
    };

    return (
        <>
            <Header />
            <main className="min-h-screen flex items-center justify-center px-4 pt-24">
                <div className="max-w-2xl w-full">
                    <div className="bg-linkedin-card rounded-lg p-8 border border-linkedin-border">
                        {/* Title */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">
                                Discover Your Market Worth
                            </h2>
                            <p className="text-linkedin-text-secondary text-sm">
                                Be the first to submit for this role
                            </p>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-6">
                            {/* City and Position Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-linkedin-text-secondary text-sm mb-2">
                                        City
                                    </label>
                                    <select
                                        value={city}
                                        onChange={(e) => setCity(e.target.value as City)}
                                        className="w-full bg-linkedin-dark border border-linkedin-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-linkedin-blue"
                                    >
                                        {CITIES.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-linkedin-text-secondary text-sm mb-2">
                                        Job Position
                                    </label>
                                    <select
                                        value={position}
                                        onChange={(e) => setPosition(e.target.value as JobPosition)}
                                        className="w-full bg-linkedin-dark border border-linkedin-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-linkedin-blue"
                                    >
                                        {JOB_POSITIONS.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Selected Role Display */}
                            <div className="bg-linkedin-dark/50 rounded-lg p-4 border border-linkedin-border">
                                <p className="text-sm text-linkedin-text-secondary mb-1">Selected Role</p>
                                <p className="text-linkedin-blue font-medium">{getRoleDescription(city, position)}</p>
                            </div>

                            {/* Salary Slider */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-linkedin-text-secondary text-sm">
                                        Annual Salary:
                                    </label>
                                    <span className="text-2xl font-bold text-linkedin-blue">
                                        {formatSalary(salary)}
                                    </span>
                                </div>

                                <input
                                    type="range"
                                    min="100000"
                                    max="10000000"
                                    step="100000"
                                    value={salary}
                                    onChange={(e) => setSalary(parseInt(e.target.value))}
                                    className="w-full"
                                />

                                <div className="flex justify-between text-xs text-linkedin-text-secondary mt-2">
                                    <span>₹1L</span>
                                    <span>PKt</span>
                                    <span>₹1Cr</span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={!isConnected}
                                className={`w-full py-3 rounded-md font-medium transition-colors ${isConnected
                                        ? "bg-linkedin-blue text-white hover:bg-linkedin-blue-hover"
                                        : "bg-linkedin-dark text-linkedin-text-secondary border border-linkedin-border cursor-not-allowed"
                                    }`}
                            >
                                {isConnected ? "Submit Encrypted Salary" : "Connect Wallet to Continue"}
                            </button>

                            {/* Privacy Guarantee */}
                            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-6">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <div>
                                        <h4 className="text-white font-semibold mb-1 text-sm">Privacy Guaranteed</h4>
                                        <p className="text-linkedin-text-secondary text-xs leading-relaxed">
                                            Your salary is encrypted with FHE. Fully Homomorphic Encryption.
                                            Nobody—not even us—can view your initial amount. Only aggregate statistics
                                            are computed on encrypted data.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
