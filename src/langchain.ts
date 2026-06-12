import { StructuredTool } from "@langchain/core/tools";
import type { PublicClient } from "viem";
import { z } from "zod";
import { analyzeContract, GuardSkillInputSchema } from "./analyze.js";
import { makePharosClient } from "./chain.js";

/**
 * GuardSkill as a LangChain StructuredTool. Drop it into any LangChain / LangGraph
 * Pharos agent's tool array; the agent should call it before sending a transaction
 * to (or approving) an unknown contract.
 *
 * Read-only: constructs (or reuses) a read-only Pharos client; never signs.
 */
export class GuardSkillTool extends StructuredTool<typeof GuardSkillInputSchema> {
  name = "guard_skill_check_contract_risk";
  description =
    "Security gate for autonomous agents. BEFORE sending a transaction to, or approving, a contract on Pharos, call this with the target contract address. " +
    "Returns a structured risk report (proxy/upgradeable logic, owner/admin powers, mint, pause/blacklist/freeze, self-destruct, fee/honeypot signals, privileged fund movement) " +
    "with a score (0-100) and a level of ok / caution / block. If level is 'block', do NOT transact autonomously.";
  schema = GuardSkillInputSchema;

  constructor(private readonly client: PublicClient = makePharosClient()) {
    super();
  }

  protected async _call(input: z.infer<typeof GuardSkillInputSchema>): Promise<string> {
    try {
      const report = await analyzeContract(this.client, input.address);
      return JSON.stringify({ status: "success", ...report });
    } catch (error: any) {
      return JSON.stringify({ status: "error", message: error?.message ?? String(error) });
    }
  }
}

/** Convenience factory matching pharos-agent-kit's createXxxTools(agent) style. */
export function createGuardSkillTools(client?: PublicClient) {
  return [new GuardSkillTool(client)];
}
