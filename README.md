# Dynamics Champions Bingo

An interactive bingo game for tracking goals throughout the year.

**Live App**: https://black-coast-0f5b5a60f.4.azurestaticapps.net

## Features

- Interactive 5x5 bingo board with goals
- Player name and company input
- Progress auto-saves to browser localStorage
- Multiple bingo detection for rows, columns, and diagonals
- PNG export for sharing progress on Microsoft Teams
- Beautiful animations and confetti celebrations
- Mobile-responsive design

## Getting Started (For Collaborators)

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [VS Code](https://code.visualstudio.com/) (recommended)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) (for deployment)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/RagnarPitla/bingo-app.git
   cd bingo-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install recommended VS Code extensions**
   - Open the project in VS Code
   - You'll be prompted to install recommended extensions
   - Or run: `Ctrl+Shift+P` → "Extensions: Show Recommended Extensions"

4. **Run locally**
   ```bash
   npm start
   ```
   Then open http://localhost:3000

### Making Changes

1. Edit files (mainly `index.html`)
2. Test locally with `npm start`
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your change description"
   git push
   ```
4. GitHub Actions will automatically deploy to Azure

### Manual Deployment (CLI)

If you need to deploy directly:

```bash
# Login to Azure
az login

# Build and deploy
npm run deploy
```

## Customizing Bingo Items

Edit the `bingoItems` array in `index.html`:

```javascript
const bingoItems = [
    { text: "Your goal here", color: "yellow", category: "work" },
    // ... more items
];
```

Available colors: `yellow`, `red`, `blue`, `green`, `purple`, `orange`, `pink`, `teal`

## Project Structure

```
bingo-app/
├── index.html              # Main app (HTML, CSS, JS all-in-one)
├── staticwebapp.config.json # Azure SWA configuration
├── swa-cli.config.json     # SWA CLI configuration
├── package.json            # Node.js dependencies
├── .vscode/
│   └── extensions.json     # Recommended VS Code extensions
└── .github/
    └── workflows/
        └── azure-static-web-apps.yml  # Auto-deployment workflow
```

## License

MIT License
