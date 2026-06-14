## GuardSkill — a pre-transaction security gate Skill for Pharos agents

**A read-only, keyless safety check that an autonomous agent runs *before* it signs a transaction or approves a contract.** Drop it into any Pharos agent and it screens the target address, then returns an **ok / caution / block** decision the agent can act on — no source code, no private key, one line to adopt.

### The problem
The Agent Carnival is about agents that pay, trade, and approve on their own. The missing primitive is a safety check *before the signature*. An autonomous agent has no built-in way to notice that a target is:
- an **upgradeable proxy** whose logic can be swapped out from under it,
- a token whose **owner can mint** supply or **freeze / blacklist** balances,
- a **honeypot** that lets you buy but blocks sells,
- or a contract carrying **`selfdestruct` / privileged `withdrawAll`**.

One bad approval can drain an agent's wallet. GuardSkill is the dependency an agent should call before every value-moving step.

### How it works
GuardSkill analyzes a target purely from **bytecode + on-chain state** (read-only RPC: `eth_getCode`, `getStorageAt`, `view` calls — it never holds a key):
- an **opcode walker** that skips PUSH immediates and strips the Solidity metadata trailer, so it doesn't raise naive false positives (e.g. a `0xff` byte inside PUSH data is *not* a `SELFDESTRUCT`),
- **proxy detection** for EIP-1967 / EIP-1822 (UUPS) / EIP-1167 (minimal) / beacon,
- **read-only ERC-20 probes** for owner/mint/pause/blacklist surfaces,
- a **0–100 risk score** mapped to **ok / caution / block** with a recommendation.

### Three drop-in surfaces
| Surface | Use it as |
|---|---|
| **LangChain tool** | a `StructuredTool` any LangChain agent can call |
| **MCP server** | `check_contract_risk` over Model Context Protocol |
| **pharos-agent-kit Action** | a native Skill/Action for Pharos agents |

### Live evidence
- **USDC → BLOCK** (100/100): upgradeable proxy + owner-mint + delegatecall admin.
- **WETH → OK** (0/100): immutable, no owner, no mint.
- **Agent gate:** an agent wired to GuardSkill **refuses** to approve USDC and **proceeds** on WETH — automatically.
- Tests: **7/7** on the bytecode walker (network-free).

### Why it fits
The Carnival uses **CertiK's Skill Scanner** as its security standard and lists **GoPlus** as a partner. GuardSkill is squarely on that theme: a **secure-by-default** (read-only, keyless) Skill whose entire purpose is making other agents' on-chain actions safer.

### Tech
TypeScript · viem · zod · @langchain/core · @modelcontextprotocol/sdk. Defaults to **Pharos Devnet (chainId 50002)** to match pharos-agent-kit; works on any EVM.

### Run it
```bash
npm install && npm test
npm run demo        # USDC -> BLOCK, WETH -> OK
npm run demo:agent  # agent refuses USDC, proceeds on WETH
npm run mcp         # MCP server
```

**Repo:** https://github.com/codebycinar/pharos-guardskill
