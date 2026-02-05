# Collaborator Setup Instructions

Welcome! Follow these steps to set up your local development environment for the Dynamics Champions Bingo app.

## Quick Start (TL;DR)

```bash
git clone https://github.com/RagnarPitla/RagnarPitla-Bingo-MSFT-Customer-Julia-Ragnar.git
cd RagnarPitla-Bingo-MSFT-Customer-Julia-Ragnar
npm install
npm start
```

## Publishing Changes

**Just commit and push - that's it!** No secrets or Azure setup needed.

```bash
git add .
git commit -m "Your change description"
git push
```

The app will automatically deploy to Azure within 1-2 minutes.

**Live App:** https://lemon-ground-0fecfc40f.1.azurestaticapps.net

---

## Detailed Setup

### Prerequisites

1. **Node.js** (v18 or later)
   - Download: https://nodejs.org/

2. **Git**
   - Download: https://git-scm.com/

3. **VS Code** (recommended)
   - Download: https://code.visualstudio.com/

### Step 1: Clone the Repository

```bash
git clone https://github.com/RagnarPitla/RagnarPitla-Bingo-MSFT-Customer-Julia-Ragnar.git
cd RagnarPitla-Bingo-MSFT-Customer-Julia-Ragnar
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Run Locally

```bash
npm start
```

Then open http://localhost:3000 in your browser.

**Alternative:** Use the Live Server extension in VS Code - right-click `index.html` and select "Open with Live Server".

### Step 4: Make Changes

1. Edit `index.html` (the main app file)
2. Save and refresh your browser to see changes

### Step 5: Publish

Copy and paste this in your terminal (replace the message with your own):

```bash
git add . && git commit -m "Updated bingo content" && git push
```

Or use this one-liner prompt:

```bash
git add . && git commit -m "My changes: [describe what you changed]" && git push
```

**That's it!** GitHub Actions will automatically deploy to Azure in 1-2 minutes. No secrets or configuration needed - it's already set up.

### Quick Copy-Paste Commands

| What you want to do | Command |
|---------------------|---------|
| Publish all changes | `git add . && git commit -m "Updated content" && git push` |
| Check what changed | `git status` |
| Undo uncommitted changes | `git checkout .` |

---

## Project Structure

```
├── index.html              # Main app (HTML + CSS + JavaScript)
├── staticwebapp.config.json # Azure configuration
├── package.json            # Dependencies and scripts
└── .github/
    └── workflows/
        └── azure-static-web-apps.yml  # Auto-deployment (pre-configured)
```

## Troubleshooting

**"npm: command not found"**
- Install Node.js from https://nodejs.org/

**Port 3000 already in use**
- Use a different port: `npx serve . -l 8080`

**VS Code asks about secrets/tokens**
- Ignore it! The deployment is already configured. Just push your changes.

## Need Help?

Contact Ragnar or open an issue on GitHub.
