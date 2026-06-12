import { createPublicClient, http, type Chain, type PublicClient } from "viem";

/**
 * Pharos chain config. Defaults to Pharos Devnet (chainId 50002), matching
 * pharos-agent-kit. Override with PHAROS_RPC_URL / PHAROS_CHAIN_ID / PHAROS_EXPLORER
 * env vars to point at testnet or another Pharos network.
 */
export const pharosChain: Chain = {
  id: Number(process.env.PHAROS_CHAIN_ID ?? 50002),
  name: process.env.PHAROS_NETWORK_NAME ?? "Pharos Devnet",
  nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.PHAROS_RPC_URL ?? "https://devnet.dplabs-internal.com"] },
    public: { http: [process.env.PHAROS_RPC_URL ?? "https://devnet.dplabs-internal.com"] },
  },
  blockExplorers: {
    default: {
      name: "PharosExplorer",
      url: process.env.PHAROS_EXPLORER ?? "https://pharosscan.xyz",
    },
  },
};

/**
 * A ready-to-use read-only viem client for the configured Pharos network.
 * GuardSkill is read-only by design: it never needs a private key.
 */
export function makePharosClient(): PublicClient {
  return createPublicClient({ chain: pharosChain, transport: http() }) as PublicClient;
}
