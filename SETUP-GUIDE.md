# Loom Design System — GitHub Setup Guide

## Step-by-step: Creating the repository

### Step 1: Create the GitHub repo

Go to GitHub and create a new repository:
- **Organization:** Your Zoho GitHub org (or personal account to start)
- **Name:** `loom-ds`
- **Visibility:** Private (internal team access)
- **Initialize:** with README (we'll replace it)

### Step 2: Clone and set up the structure

```bash
git clone https://github.com/YOUR-ORG/loom-ds.git
cd loom-ds
```

Copy the files from this starter package into the repo:

```
loom-ds/
├── README.md                          ← Replace with provided README
├── tokens/
│   └── primitive/
│       └── colors.json                ← The 616-token file (loom-primitive-tokens.json)
├── docs/
│   └── project-knowledge.md           ← The Loom project knowledge doc
└── figma/
    └── FIGMA-SETUP.md                 ← Figma integration guide (to create)
```

### Step 3: Initial commit

```bash
git add .
git commit -m "feat: initialize Loom DS with DSG primitive color tokens (616 tokens, 28 families)"
git push origin main
```

### Step 4: Set up branch protection

In GitHub repo Settings → Branches → Branch protection rules:
- **Branch:** `main`
- **Require pull request reviews:** 1 approval minimum
- **Require status checks:** (add after CI is set up)
- **Restrict who can push:** Only design system maintainers

### Step 5: Set up team access

In Settings → Collaborators and teams:
- **Maintainers** (you + permissioned designers): Write access
- **Designers** (broader team): Read access
- **HTML developers:** Read access

This maps directly to your requirement #2 — permissioned designers can update, others can only view.

---

## Step 6: Connect to Claude Project

1. Go to claude.ai → Projects → Create new project
2. **Name:** Loom Design System
3. **Description:** Unified design system for Zoho Office Suite (Writer, PDF Editor, RFP, Kanaa)
4. Add project knowledge:
   - Upload `LOOM-PROJECT-KNOWLEDGE.md` as the primary knowledge file
   - Upload `loom-primitive-tokens.json` as reference data
5. Set custom instructions (paste this):

```
You are a design system assistant for Loom, the Zoho Office Suite unified design system.

When generating UI screens:
- Always ask which product (Writer/PDF Editor/RFP/Kanaa) and theme (Light/Dark/Grey) if not specified
- Use Loom semantic tokens as CSS custom properties (--loom-*), never raw hex values
- Follow the component specs in the project knowledge exactly
- Include all ARIA attributes and keyboard accessibility
- Output clean, production-ready HTML + CSS
- Support all three themes via data-theme attribute

When adding or modifying tokens:
- Follow the three-tier architecture (primitive → semantic → component)
- Validate color contrast against WCAG AA (mandatory target) and AAA (wherever possible)
- Use DSG naming conventions

When reviewing designs:
- Check accessibility: contrast ratios, focus order, touch targets
- Verify token usage consistency
- Flag any DSG violations
```

6. **Invite team members** to the project — they'll all share the same context

---

## Step 7: Figma integration (future)

Install Tokens Studio for Figma plugin, then connect to the GitHub repo:

```json
{
  "provider": "github",
  "repo": "YOUR-ORG/loom-ds",
  "branch": "main",
  "filePath": "tokens",
  "tokenFormat": "dtcg"
}
```

This creates a two-way sync: designers update tokens in Figma → creates a PR in GitHub, or devs update tokens in GitHub → designers pull latest into Figma.

---

## What to build next (priority order)

### Phase 1 — Foundation (current)
- [x] Extract DSG primitive color tokens (616 tokens)
- [x] Create project knowledge document
- [x] Set up GitHub repository structure
- [ ] Create semantic token files (light.json, dark.json, grey.json)
- [ ] Build CSS generation script (tokens → CSS custom properties)
- [ ] Create contrast validation script

### Phase 2 — Core components
- [ ] Button (all variants, sizes, states)
- [ ] Input / Text field
- [ ] Select / Dropdown
- [ ] Checkbox & Radio
- [ ] Toggle / Switch
- [ ] Modal / Dialog
- [ ] Card
- [ ] Tabs
- [ ] Table

### Phase 3 — Product patterns
- [ ] Sidebar navigation (Writer/PDF Editor pattern)
- [ ] Toolbar (Writer toolbar, PDF annotation bar)
- [ ] Document canvas area
- [ ] Settings panel layout
- [ ] Onboarding flows

### Phase 4 — AI workflow
- [ ] Fine-tune Claude Project with real screen examples
- [ ] Create sketch-to-screen prompt templates
- [ ] Set up Figma Desktop Bridge workflows
- [ ] VSCode integration guide for HTML developers
