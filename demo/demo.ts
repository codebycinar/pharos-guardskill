import { createPublicClient, http, type Chain, type PublicClient } from "viem";
import { analyzeContract, type RiskReport } from "../src/analyze.js";

/**
 * GuardSkill live demo.
 *
 * Default: screens the addresses passed on the command line against the Pharos
 * network (PHAROS_RPC_URL, default Pharos Devnet).
 *
 *   npm run demo -- 0xTargetAddress [0xAnother ...]
 *
 * For an evidence run on any EVM where the bytecode is real, set GUARD_RPC_URL:
 *
 *   GUARD_RPC_URL=https://ethereum-rpc.publicnode.com npm run demo
 *
 * (with no address args it screens a built-in mainnet sample set: an upgradeable
 *  proxy token with admin powers, a clean immutable token, and an EOA.)
 */

const rpc = process.env.GUARD_RPC_URL ?? process.env.PHAROS_RPC_URL ?? "https://devnet.dplabs-internal.com";

// built-in sample set used only when no addresses are passed AND we're on an
// Ethereum-mainnet RPC (for the evidence run). On Pharos, pass your own targets.
const MAINNET_SAMPLES: { label: string; address: string }[] = [
  { label: "USDC (upgradeable proxy + blacklist + mint)", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
  { label: "WETH (immutable, no owner/mint)", address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" },
  { label: "EOA (no code at address)", address: "0x000000000000000000000000000000000000dEaD" },
];

function bar(level: RiskReport["level"]): string {
  return level === "block" ? "[BLOCK]" : level === "caution" ? "[CAUTION]" : "[OK]";
}

async function main() {
  const boot = createPublicClient({ transport: http(rpc) });
  const chainId = await boot.getChainId();
  const chain: Chain = {
    id: chainId,
    name: process.env.PHAROS_NETWORK_NAME ?? `chain-${chainId}`,
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [rpc] }, public: { http: [rpc] } },
  };
  const client = createPublicClient({ chain, transport: http(rpc) }) as PublicClient;

  const argAddrs = process.argv.slice(2);
  const targets =
    argAddrs.length > 0
      ? argAddrs.map((a) => ({ label: a, address: a }))
      : chainId === 1
        ? MAINNET_SAMPLES
        : [];

  if (targets.length === 0) {
    console.log(`Connected to chainId ${chainId} via ${rpc}.`);
    console.log("Pass one or more target addresses to screen, e.g.:");
    console.log("  npm run demo -- 0xYourContract");
    return;
  }

  console.log(`GuardSkill demo — chainId ${chainId} via ${rpc}\n`);
  for (const t of targets) {
    try {
      const r = await analyzeContract(client, t.address);
      console.log(`${bar(r.level)}  ${t.label}`);
      console.log(`        ${r.address}`);
      console.log(`        ${r.summary}`);
      for (const f of r.flags) {
        console.log(`          - [${f.severity}] ${f.title} — ${f.detail}`);
      }
      console.log(`        => ${r.recommendation}\n`);
    } catch (e: any) {
      console.log(`[ERROR] ${t.label} (${t.address}): ${e?.message ?? e}\n`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
