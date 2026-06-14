# Demo video script — ~90 seconds (YouTube, unlisted)

Goal: show, in one take, that GuardSkill is a read-only pre-transaction security gate an
agent calls before signing. Record your screen (OBS / `Win+G` Game Bar / Loom).

## Setup (do once before recording)
```powershell
cd "C:\Users\husey\OneDrive\Desktop\Projects\Arge\pharos-guardskill"
npm install
$env:GUARD_RPC_URL="https://ethereum-rpc.publicnode.com"
```

## On-camera flow

**0:00–0:12 — Hook (say while showing the repo/README):**
> "This is GuardSkill — a read-only safety check that a Pharos agent runs *before* it signs
> a transaction or approves a contract. No private key, no source code needed — just bytecode
> and on-chain state."

**0:12–0:25 — Tests (run + show 7/7):**
```powershell
npm test
```
> "Seven unit tests on the bytecode walker — including that a 0xff inside PUSH data is not
> mistaken for a SELFDESTRUCT."

**0:25–0:55 — Contract screening (run + read the verdicts):**
```powershell
npm run demo
```
> "It screens real contracts. USDC comes back **BLOCK**, 100 out of 100 — it's an upgradeable
> proxy whose owner can mint and the admin can swap the logic. WETH comes back **OK**, zero —
> immutable, no owner, no mint. An EOA is OK."

**0:55–1:20 — The agent gate (run + show the decision):**
```powershell
npm run demo:agent
```
> "And here's the point: an agent wired to GuardSkill **refuses** to approve USDC and
> **proceeds** on WETH — automatically, before any signature. That's the missing primitive
> for agents that pay and transact on their own."

**1:20–1:30 — Close:**
> "Three drop-in surfaces — a LangChain tool, an MCP server, and a pharos-agent-kit action.
> Read-only, keyless, secure by default. That's GuardSkill."

## Optional (if you have Pharos RPC access — nicer, not required)
```powershell
$env:PHAROS_RPC_URL="<pharos-rpc-url>"; npm run demo -- 0x<a-pharos-contract>
```
> "Same analysis on Pharos itself."

## After recording
1. Upload to YouTube as **Unlisted**.
2. Copy the link into `BUIDL_FORM.md` → "Demo video" and into the DoraHacks form.

Tip: keep it under ~2 minutes; judges skim. One clean take with the verdicts visible beats a long walkthrough.
