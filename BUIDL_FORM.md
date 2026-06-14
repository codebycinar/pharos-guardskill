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

### Vision  (Describe the problem which this project solves — **256-char limit**)
Use this (~250 chars):
```
Autonomous agents sign txs and approve contracts with no safety check first — blind to upgradeable proxies, owner-mint/blacklist tokens, honeypots, or selfdestruct. GuardSkill is the read-only pre-transaction risk gate an agent calls before it signs.
```
Shorter fallback (~233 chars) if needed:
```
Autonomous agents sign txs and approve contracts with no safety check first — blind to upgradeable proxies, owner-mint/blacklist tokens, honeypots, selfdestruct. GuardSkill is the read-only pre-tx risk gate an agent calls before signing.
```
(Full long version, for the README / video narration — NOT the 256-char field:
Autonomous on-chain agents sign transactions, pay, and grant token approvals with no
safety check before the signature; one bad approval can drain the wallet. GuardSkill
screens the target from bytecode + on-chain state — read-only, keyless — and returns a
contract kind, risk flags, a 0–100 score, and an ok/caution/block decision, shipped as a
LangChain tool, an MCP server, and a pharos-agent-kit Action.)

### Category
Options on the form: Crypto / Web3 · Quantum Computing · Space · AI/Robotics · Other.
→ **Crypto / Web3**  (core function = smart-contract / on-chain risk analysis; "AI/Robotics"
  is defensible since it's an agent Skill, but Crypto/Web3 most accurately describes what it does.)

### Is this BUIDL an AI Agent?
→ **No.**  (GuardSkill is a *Skill / tool that agents call*, not an autonomous agent itself —
  matches the "Skill-to-Agent" track. Only flip to *Yes* if the form blocks the Skill track otherwise.)

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
