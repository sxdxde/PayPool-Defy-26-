"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 bg-linkedin-card border-b border-linkedin-border z-50">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-linkedin-blue p-2 rounded">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.18-.78-6-4.34-6-8V8.3l6-3.11 6 3.11V12c0 3.66-2.82 7.22-6 8z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg">PayPool</h1>
                        <p className="text-linkedin-text-secondary text-xs">Encrypted Salary Benchmarking</p>
                    </div>
                </Link>

                <ConnectButton />
            </div>
        </header>
    );
}
