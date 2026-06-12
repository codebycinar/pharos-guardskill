#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { analyzeContract } from "./analyze.js";
import { makePharosClient } from "./chain.js";

/**
 * GuardSkill as a Model Context Protocol server (stdio). Any MCP-capable agent
 * (Claude, the pharos-agent-kit MCP host, etc.) can mount this and call the
 * `check_contract_risk` tool before transacting on Pharos.
 *
 * Run: tsx src/mcp.ts   (or `npm run mcp`)
 */
const client = makePharosClient();

const server = new McpServer({ name: "pharos-guardskill", version: "0.1.0" });

server.tool(
  "check_contract_risk",
  "Security gate: screen a Pharos contract address for transaction-time risk (proxy/upgradeable, owner/admin, mint, pause/blacklist/freeze, self-destruct, fee/honeypot, privileged fund movement). Returns a 0-100 risk score and an ok/caution/block level. Call BEFORE sending value to or approving an unknown contract.",
  { address: z.string().describe("Target contract address to screen.") },
  async ({ address }) => {
    try {
      const report = await analyzeContract(client, address);
      return { content: [{ type: "text", text: JSON.stringify(report, null, 2) }] };
    } catch (e: any) {
      return {
        content: [{ type: "text", text: JSON.stringify({ status: "error", message: e?.message ?? String(e) }) }],
        isError: true,
      };
    }
  },
);

async function main() {
  await server.connect(new StdioServerTransport());
  // stderr so it doesn't corrupt the stdio JSON-RPC channel
  console.error("pharos-guardskill MCP server running on stdio");
}

main().catch((e) => {
  console.error("fatal:", e);
  process.exit(1);
});
