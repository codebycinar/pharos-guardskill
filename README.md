# GuardSkill — a pre-transaction security gate for Pharos AI agents

GuardSkill is a **read-only** skill that an autonomous agent calls **before it signs a transaction to (or approves) a contract** on Pharos. It returns a structured risk verdict — is the target upgradeable, who can mint, can it pause/blacklist/freeze, does it self-destruct, are there honeypot-style fee/trading controls, can a privileged role pull funds — and a clear **ok / caution / block** recommendation.

The Pharos Agent Carnival's premise is agents that are **native on-chain economic actors**: they transfer, pay, swap, and approve autonomously. The missing primitive in that vision is a **safety gate before the signature**. GuardSkill is that gate, and it is the kind of secure-by-default building block the hackathon's CertiK Skill Scanner standard is asking for.

## Why this matters

An agent that can move funds without a human in the loop will, sooner or later, be pointed at a malicious or mutable contract: an upgradeable proxy whose logic is swapped after the agent "trusted" it, a token with an owner that can mint or blacklist, a honeypot that accepts buys and blocks sells, a contract with `selfdestruct` or a privileged `withdrawAll`. A trading/payments agent has no built-in way to notice. GuardSkill gives every other agent a single tool to ask **"is it safe to transact with this address?"** and a policy to act on the answer.

## What it checks (from bytecode + on-chain state, no source required)

- **Upgradeability** — EIP-1967 (transparent/UUPS), beacon proxies, EIP-1167 minimal proxies, and `upgradeTo` / `upgradeToAndCall` / `changeAdmin` in the dispatch table. Upgradeable logic is the single biggest "trusted it yesterday, rugged today" risk for an agent.
- **Ownership / admin powers** — `transferOwnership`, `setOwner`, a live `owner()` account.
- **Supply control** — `mint(...)`, mutable max supply.
- **Freeze / censorship** — `pause`, `blacklist` / `addBlackList` / `setBlocked` / `freeze`.
- **Honeypot / fee skim** — adjustable `setFee` / `setTaxFee` / `setMaxTxAmount` / trading toggles on a token.
- **Fund movement / rug** — `withdrawAll`, `emergencyWithdraw`, `sweep`, `rescueTokens`, and the raw `SELFDESTRUCT` opcode.

Detection is done with a proper **opcode walker** that skips `PUSH` immediates (so data bytes are never mistaken for opcodes) and **strips the Solidity metadata trailer** (so the CBOR tail is never scanned as code). Dangerous function **selectors are computed at load time** from their signatures, so the curated list can't drift out of sync with reality. The result: it works on **unverified** contracts, and it does not raise the kind of false positives a naive byte-search would.

It is **read-only by design** — only `eth_getCode`, `eth_getStorageAt`, and `view` calls. It never sends a transaction and **never needs a private key**, which is exactly the trust profile a security tool should have.

## Three ways to consume it

1. **LangChain / LangGraph tool** (drop into any pharos-agent-kit agent's tool array):
   ```ts
   import { GuardSkillTool } from "pharos-guardskill";
   const tools = [ new GuardSkillTool(), /* ...your other Pharos tools */ ];
   // system prompt: "Before any transfer/approve, call guard_skill_check_contract_risk;
   //                 if level == 'block', refuse and escalate."
   ```
2. **Model Context Protocol server** (mount in Claude / any MCP host / the kit's MCP host):
   ```bash
   npm run mcp           # exposes the `check_contract_risk` tool over stdio
   ```
3. **pharos-agent-kit `Action`** (register in the kit's action registry; auto-exposed to its MCP + Vercel AI adapters):
   ```ts
   import { checkContractRiskAction } from "pharos-guardskill";
   ```

Core engine, if you just want the function:
```ts
import { analyzeContract, makePharosClient } from "pharos-guardskill";
const report = await analyzeContract(makePharosClient(), "0xTarget");
```

## Live evidence

Run against any EVM RPC where the bytecode is real (Pharos is EVM, so the analysis is identical):

```
$ GUARD_RPC_URL=https://ethereum-rpc.publicnode.com npm run demo

[BLOCK]  USDC (upgradeable proxy + admin powers)   risk 100/100
   - [high] upgradeTo(address) / upgradeToAndCall(...) / changeAdmin(address) — logic is upgradeable
   - [low]  live owner() = 0xFcb1…AE3a
   => BLOCK: do not transact autonomously; require human review / allowlist.

[OK]     WETH (immutable, no owner/mint)            risk 0/100
   => OK: no high-risk controls in bytecode (still cap approvals).

[OK]     EOA (no code at address)
   => externally-owned account; native transfer carries no contract-logic risk.
```

The agent-side gate:
```
$ GUARD_RPC_URL=https://ethereum-rpc.publicnode.com npm run demo:agent

Agent wants to: approve + swap on USDC  -> GuardSkill level=block -> DECISION: REFUSE, escalate to human.
Agent wants to: wrap ETH via WETH       -> GuardSkill level=ok    -> DECISION: PROCEED (bounded approval).
```

## Run it

```bash
npm install
npm test          # network-free unit tests for the bytecode walker
npm run demo      # screen addresses; pass your own:  npm run demo -- 0xYourContract
npm run mcp       # start the MCP server
```

Point it at Pharos with `PHAROS_RPC_URL` (and `PHAROS_CHAIN_ID` / `PHAROS_NETWORK_NAME` if needed); it defaults to Pharos Devnet (chainId 50002) to match pharos-agent-kit.

## Scope and honest limitations

- It is a **heuristic bytecode + state scan, not a full audit.** It surfaces *capabilities and control surfaces*, not proof of intent. A flagged contract may be perfectly safe (e.g. an upgradeable protocol governed by a timelock+multisig); an unflagged one can still have logic bugs.
- Source-verification status and off-chain reputation are out of scope here; they slot in as additional flags if an explorer/reputation API is available on the target network.
- The dangerous-signature list is curated and extensible (`src/selectors.ts`). It favors recall (better to flag for human review than to miss a control).

## Roadmap (if it advances)

- Pull source-verification + creation-tx age from the Pharos explorer API as extra flags.
- Integrate GoPlus-style token-security signals where available on Pharos.
- An on-chain allowlist/denylist registry so agents can share verdicts and a curator can vouch for known-good contracts.

## License

MIT.
