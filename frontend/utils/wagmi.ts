import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "wagmi/chains";

export const config = getDefaultConfig({
    appName: "PayPool",
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "paypool-app",
    chains: [baseSepolia],
    ssr: false,
});
