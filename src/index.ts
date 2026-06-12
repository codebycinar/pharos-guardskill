/**
 * GuardSkill — a read-only pre-transaction smart-contract risk skill for Pharos AI agents.
 *
 * Three ways to consume it:
 *   - LangChain / LangGraph: `new GuardSkillTool()` or `createGuardSkillTools()`
 *   - Model Context Protocol: run `src/mcp.ts` (exposes `check_contract_risk`)
 *   - pharos-agent-kit Action registry: import the default Action from `./action`
 *
 * Core engine: `analyzeContract(publicClient, address)` -> RiskReport.
 */
export { analyzeContract, scanBytecode } from "./analyze.js";
export type { RiskReport, Flag, GuardSkillInput } from "./analyze.js";
export { GuardSkillInputSchema, RiskReportSchema, FlagSchema } from "./analyze.js";
export { pharosChain, makePharosClient } from "./chain.js";
export { GuardSkillTool, createGuardSkillTools } from "./langchain.js";
export { DANGER_SIGNATURES, DANGER_SELECTORS } from "./selectors.js";
export { default as checkContractRiskAction } from "./action.js";
