"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { type City, type JobPosition, getRoleDescription } from "@/utils/constants";

function PercentileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const city = (searchParams.get("city") || "Bangalore") as City;
    const position = (searchParams.get("position") || "Software Engineer") as JobPosition;
    const salary = parseInt(searchParams.get("salary") || "2400000");

    // Simulated data (in production, this would come from smart contract)
    const [percentile] = useState(23); // You earn more than 23% of peers
    const topPercentile = 100 - percentile;  // TOP 77% means bottom 23%
    const marketRate = 1500000; // ₹15.0L
    const peerCount = 0; // Based on 0 encrypted contributions

    const formatSalary = (amount: number) => {
        return `₹${(amount / 100000).toFixed(1)}L`;
    };

    const isUnderpaid = topPercentile < 40;
    const isCompetitive = topPercentile >= 40 && topPercentile < 70;
    const isWellPaid = topPercentile >= 70;

    const statusConfig = isUnderpaid
        ? { text: "BELOW MARKET", color: "text-red-500", bgColor: "bg-red-500/10", borderColor: "border-red-500/30" }
        : isCompetitive
            ? { text: "COMPETITIVE", color: "text-yellow-500", bgColor: "bg-yellow-500/10", borderColor: "border-yellow-500/30" }
            : { text: "ABOVE MARKET", color: "text-green-500", bgColor: "bg-green-500/10", borderColor: "border-green-500/30" };

    return (
        <>
            <Header />
            <main className="min-h-screen flex items-center justify-center px-4 pt-24">
                <div className="max-w-2xl w-full space-y-5">
                    {/* Main Result Card */}
                    <div className="bg-linkedin-card rounded-lg p-8 border border-linkedin-border">
                        <div className="text-center mb-8">
                            <div className="mb-4">
                                <svg className="w-16 h-16 mx-auto text-linkedin-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h1 className={`text-4xl font-bold ${statusConfig.color} mb-2`}>
                                TOP {topPercentile}%
                            </h1>
                            <p className="text-linkedin-text-secondary text-base">
                                You earn more than {percentile}% of peers
                            </p>
                            <div className={`mt-4 inline-block px-4 py-1.5 ${statusConfig.bgColor} border ${statusConfig.borderColor} rounded-md text-sm`}>
                                <span className={`font-semibold ${statusConfig.color}`}>{statusConfig.text}</span>
                            </div>
                        </div>

                        {/* Percentile Visualization */}
                        <div className="mb-8">
                            <div className="bg-linkedin-dark rounded-lg p-1 relative overflow-hidden">
                                <div
                                    className="h-6 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded transition-all duration-1000"
                                    style={{ width: `${topPercentile}%` }}
                                >
                                    <div className="h-full flex items-center justify-end pr-2">
                                        <span className="text-[10px] font-bold text-white">YOU</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-linkedin-text-secondary mt-2">
                                <span>Bottom</span>
                                <span>Top</span>
                            </div>
                        </div>

                        {/* Market Rate */}
                        <div className="bg-linkedin-dark/50 rounded-lg p-6 border border-linkedin-border mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-linkedin-text-secondary text-sm">Market Rate</span>
                                <span className="text-2xl font-bold text-linkedin-blue">
                                    {formatSalary(marketRate)}
                                </span>
                            </div>

                            <div className="text-sm text-linkedin-text-secondary mb-3">
                                Based on <span className="text-white font-medium">{peerCount}</span> encrypted contributions
                            </div>

                            <div className="h-px bg-linkedin-border my-3"></div>

                            <div className="text-xs text-linkedin-text-secondary">
                                {getRoleDescription(city, position)}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                className="bg-linkedin-card border border-linkedin-border text-white py-3 rounded-md hover:bg-linkedin-dark transition-colors font-medium text-sm"
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: "PayPool",
                                            text: `I just discovered I'm in the top ${topPercentile}% of ${getRoleDescription(city, position)}s!`,
                                            url: window.location.origin,
                                        });
                                    }
                                }}
                            >
                                Share Results
                            </button>
                            <button
                                className="bg-linkedin-blue text-white font-medium py-3 rounded-md hover:bg-linkedin-blue-hover transition-colors shadow-sm text-sm"
                                onClick={() => window.open("https://www.levels.fyi/negotiate", "_blank")}
                            >
                                Negotiate Salary
                            </button>
                        </div>
                    </div>

                    {/* Underpayment Warning */}
                    {isUnderpaid && (
                        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <h3 className="text-red-400 font-semibold mb-2 text-sm">Potential Underpayment Detected</h3>
                                    <p className="text-linkedin-text-secondary text-sm leading-relaxed">
                                        Based on encrypted salary data from {peerCount} peers, you may be earning below market rate.
                                        The confidential market average is <span className="font-semibold text-white">{formatSalary(marketRate)}</span>.
                                    </p>
                                    <p className="text-linkedin-text-secondary text-xs mt-3">
                                        Consider using this data point during your next performance review or job search.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Back Button */}
                    <button
                        onClick={() => router.push("/")}
                        className="w-full bg-linkedin-card border border-linkedin-border text-linkedin-text-secondary py-3 rounded-md hover:bg-linkedin-dark transition-colors text-sm"
                    >
                        ← Back to Home
                    </button>
                </div>
            </main>
        </>
    );
}

export default function Percentile() {
    return (
        <Suspense fallback={
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-3 border-linkedin-blue border-t-transparent mb-4 mx-auto"></div>
                        <p className="text-linkedin-text-secondary">Loading...</p>
                    </div>
                </div>
            </>
        }>
            <PercentileContent />
        </Suspense>
    );
}
