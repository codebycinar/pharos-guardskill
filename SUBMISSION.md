# DoraHacks submission — GuardSkill

**Hackathon:** Pharos "Create Like a PRO" Agent Carnival — Skill-to-Agent (Phase 1).
**Track fit:** Skill Hackathon (a reusable Skill module invokable by any Agent); infrastructure / security.
**Repo:** (push this folder to a public GitHub/GitLab/Bitbucket repo and paste the link in the DoraHacks form)

## One-liner

A read-only pre-transaction security gate Skill: an agent calls GuardSkill before signing a transaction to (or approving) a contract on Pharos and gets a structured risk verdict + an ok/caution/block decision.

## Problem

The Carnival's premise is agents that transact, pay, and approve autonomously as on-chain economic actors. The missing primitive is a safety check before the signature. An autonomous agent has no built-in way to notice that a target is an upgradeable proxy whose logic can be swapped, a token whose owner can mint or blacklist, a honeypot that blocks sells, or a contract with `selfdestruct` / privileged `withdrawAll`.

## Solution

GuardSkill screens any target address from bytecode + on-chain state (no source required, read-only, no private key) and returns:
- contract kind (EOA / contract / EIP-1967 / UUPS / beacon / minimal proxy),
- flags across upgradeability, ownership/admin, supply (mint), freeze (pause/blacklist), honeypot fees, and fund-movement/self-destruct,
- a 0-100 risk score and an **ok / caution / block** level with a recommendation an agent can act on.

## What's built (all working)

- Core engine `analyzeContract()` — opcode walker that skips PUSH data and strips the Solidity metadata trailer (no naive-scan false positives); load-time-computed dangerous selectors; EIP-1967/1822/1167 proxy detection; read-only ERC20 probes.
- Three integration surfaces: **LangChain `StructuredTool`**, **MCP server** (`check_contract_risk`), and a **pharos-agent-kit `Action`** object.
- Network-free unit tests (7/7) for the walker, plus two live demos (contract screening + an agent safety-gate policy).

## Demo commands

```bash
npm install
npm test
GUARD_RPC_URL=https://ethereum-rpc.publicnode.com npm run demo        # USDC -> BLOCK, WETH -> OK, EOA -> OK
GUARD_RPC_URL=https://ethereum-rpc.publicnode.com npm run demo:agent  # agent REFUSEs USDC, PROCEEDs on WETH
PHAROS_RPC_URL=<pharos-rpc> npm run demo -- 0xYourPharosContract      # on Pharos
npm run mcp                                                           # MCP server
```

(The demo uses a public Ethereum RPC for reproducible evidence because the analysis is identical on any EVM; point `PHAROS_RPC_URL` at Pharos for the real run.)

## Why it fits the security-first framing

The Carnival uses CertiK's Skill Scanner as its security standard and lists GoPlus as a partner. GuardSkill is squarely on that theme: it is a secure-by-default (read-only, keyless) Skill whose entire purpose is making other agents' on-chain actions safer. It is the dependency a payments/trading agent should call before every value-moving step.

## Tech

TypeScript, viem, zod, @langchain/core, @modelcontextprotocol/sdk. Defaults to Pharos Devnet (chainId 50002) to match pharos-agent-kit; configurable via env.
