# DoraHacks BUIDL form — field-by-field (copy/paste)

Paste each value into the matching field on the "Create a new BUIDL" form.

---

### BUIDL (project) name
```
GuardSkill
```

### BUIDL logo
Use `assets/logo.png` (export it from `assets/logo.svg` at 480×480 — see note at bottom).
JPEG/PNG, < 2 MB, 480×480 recommended.

### Vision  (Describe the problem which this project solves)
```
Autonomous on-chain agents sign transactions, pay, and grant token approvals with no safety check before the signature. An agent has no built-in way to notice that a target contract is an upgradeable proxy whose logic can be swapped out, a token whose owner can mint supply or freeze/blacklist balances, a honeypot that blocks sells, or a contract carrying selfdestruct / privileged withdrawAll. A single bad approval can drain an agent's wallet.

GuardSkill is the missing pre-transaction safety primitive for Pharos agents. Before any value-moving step, an agent calls GuardSkill, which screens the target address from bytecode + on-chain state (no source code needed, read-only, never touches a private key) and returns a contract kind (EOA / EIP-1967 / UUPS / beacon / minimal proxy), risk flags across upgradeability, owner-mint, pause/blacklist freeze, honeypot fees and selfdestruct/withdraw, a 0–100 risk score, and an ok / caution / block decision the agent can act on. It ships as three drop-in surfaces — a LangChain tool, an MCP server, and a pharos-agent-kit Action — so any agent can adopt it in one line.
```

### Category
- Category dropdown: pick the closest available → **Security** (or *Infrastructure* / *Developer Tooling* if Security isn't listed).
- **Is this BUIDL an AI Agent?** → **No.**
  (GuardSkill is a *Skill / tool that agents call*, not an autonomous agent itself — this matches the "Skill-to-Agent" track. Only flip to *Yes* if the form blocks submission to the Skill track otherwise.)

### GitHub/Gitlab/Bitbucket  *(required)*
```
https://github.com/codebycinar/pharos-guardskill
```

### Project website (optional)
Leave blank, or reuse the repo URL above.

### Demo video (optional — YouTube recommended)
```
<paste your YouTube (unlisted) link after recording — see DEMO_SCRIPT.md>
```

### Social links (at least one required)
Use ONE of your own (X/Twitter is most expected). Examples:
```
https://x.com/<your-handle>
```
Fallback if you have no X: your GitHub profile →
```
https://github.com/codebycinar
```

---

## Logo export (svg → png 480×480)
Pick any one:
- **Easiest:** open `assets/logo.svg` in a browser, screenshot the square, done.
- **CLI:** `npx --yes svgexport assets/logo.svg assets/logo.png 480:480`
- **Online:** any "SVG to PNG" converter, set 480×480.

## Before you hit Submit
- Confirm the **exact deadline** on the hackathon page (Jun 15 vs extended Jun 17) and submit BEFORE it.
- Confirm the **track** is the Skill / Skill-to-Agent one.
- Double-check the repo link opens and the README renders.
