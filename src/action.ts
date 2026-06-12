import { z } from "zod";
import type { PublicClient } from "viem";
import { analyzeContract } from "./analyze.js";
import { makePharosClient } from "./chain.js";

/**
 * GuardSkill exposed as a pharos-agent-kit `Action`. Shape matches
 * pharos-agent-kit/src/types/action.ts so it can be registered in that kit's
 * action registry (and therefore auto-exposed over its MCP server / Vercel AI
 * adapters). The handler receives the PharosAgentKit `agent`; it uses
 * agent.publicClient when present, otherwise a standalone read-only client.
 */
const checkContractRiskAction = {
  name: "GUARD_SKILL_CHECK_CONTRACT_RISK",
  similes: [
    "check if this contract is safe before I send a transaction",
    "is this token a honeypot",
    "security check this contract address",
    "scan this contract for owner / mint / blacklist / upgradeable risks",
    "should I approve this contract",
  ],
  description:
    "Pre-transaction security gate. Given a target contract address, returns a structured risk report (proxy/upgradeable, owner/admin, mint, pause/blacklist/freeze, self-destruct, fee/honeypot, privileged fund movement) with a 0-100 score and an ok/caution/block level. Call BEFORE sending value to or approving an unknown contract. Read-only; never signs.",
  examples: [
    [
      {
        input: { address: "0x0000000000000000000000000000000000000000" },
        explanation: "Check a target contract before transacting.",
        output: {
          status: "success",
          level: "block",
          score: 80,
          summary: "eip1967-proxy ERC20; 3 flag(s); risk 80/100 -> BLOCK.",
        },
      },
    ],
  ],
  schema: z.object({
    address: z.string().describe("Target contract address to screen."),
  }),
  handler: async (agent: { publicClient?: PublicClient }, input: Record<string, any>) => {
    try {
      const client: PublicClient = agent?.publicClient ?? makePharosClient();
      const report = await analyzeContract(client, input.address);
      return { status: "success", ...report };
    } catch (e: any) {
      return { status: "error", message: e?.message ?? String(e) };
    }
  },
};

export default checkContractRiskAction;
