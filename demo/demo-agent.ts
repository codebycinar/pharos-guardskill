import { createPublicClient, http, type Chain, type PublicClient } from "viem";
import { GuardSkillTool } from "../src/langchain.js";

/**
 * Demo: how an autonomous Pharos agent uses GuardSkill as a hard safety gate
 * BEFORE acting. This is a deterministic policy harness (no LLM key required) so
 * the gating logic is visible and reproducible. In a real LangChain/LangGraph
 * agent, GuardSkillTool is just one of the agent's tools and the same policy is
 * expressed in the system prompt: "call guard_skill_check_contract_risk before
 * any transfer/approve; if level == block, refuse."
 *
 *   GUARD_RPC_URL=https://ethereum-rpc.publicnode.com npm run demo:agent
 */

const rpc = process.env.GUARD_RPC_URL ?? process.env.PHAROS_RPC_URL ?? "https://devnet.dplabs-internal.com";

// An "agent" intends to send funds / approve these targets.
const INTENTS = [
  { action: "approve + swap on", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", note: "USDC proxy" },
  { action: "wrap ETH via", address: "0xC02aaa39b223FE8D0A0e5C4F27eAD9083C756Cc2", note: "WETH" },
];

async function main() {
  const boot = createPublicClient({ transport: http(rpc) });
  const chainId = await boot.getChainId();
  const chain: Chain = {
    id: chainId, name: `chain-${chainId}`,
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [rpc] }, public: { http: [rpc] } },
  };
  const client = createPublicClient({ chain, transport: http(rpc) }) as PublicClient;
  const guard = new GuardSkillTool(client);

  const intents = process.argv.length > 2
    ? process.argv.slice(2).map((a) => ({ action: "transact with", address: a, note: "" }))
    : (chainId === 1 ? INTENTS : []);

  if (intents.length === 0) {
    console.log(`Connected chainId ${chainId}. Pass target addresses: npm run demo:agent -- 0x...`);
    return;
  }

  console.log(`Agent safety-gate demo — chainId ${chainId}\n`);
  for (const it of intents) {
    console.log(`Agent wants to: ${it.action} ${it.address} ${it.note ? "(" + it.note + ")" : ""}`);
    const raw = await guard.invoke({ address: it.address });
    const report = JSON.parse(raw);
    console.log(`  GuardSkill -> level=${report.level} score=${report.score}`);
    if (report.level === "block") {
      console.log("  DECISION: REFUSE. Agent halts and escalates to human review.\n");
    } else if (report.level === "caution") {
      console.log("  DECISION: PROCEED WITH LIMITS. Cap approval to exact amount, no infinite approve, single bounded tx.\n");
    } else {
      console.log("  DECISION: PROCEED. Still uses a bounded approval.\n");
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
