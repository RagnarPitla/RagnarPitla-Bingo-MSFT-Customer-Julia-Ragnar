# Collaborator Setup Instructions

Welcome! Follow these steps to set up your local development environment for the Dynamics Champions Bingo app.

## Prerequisites

Before you begin, install the following:

1. **Node.js** (v18 or later)
   - Download: https://nodejs.org/
   - Verify installation: `node --version`

2. **Git**
   - Download: https://git-scm.com/
   - Verify installation: `git --version`

3. **VS Code** (recommended)
   - Download: https://code.visualstudio.com/

4. **Azure CLI** (for deployment)
   - Download: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
   - Verify installation: `az --version`

## Step 1: Clone the Repository

```bash
git clone https://github.com/RagnarPitla/RagnarPitla-Bingo-MSFT-Customer-Julia-Ragnar.git
cd RagnarPitla-Bingo-MSFT-Customer-Julia-Ragnar
```

## Step 2: Install Dependencies

```bash
npm install
```

This installs:
- `@azure/static-web-apps-cli` - For deploying to Azure
- `serve` - For running the app locally

## Step 3: Install VS Code Extensions

When you open the project in VS Code, you'll be prompted to install recommended extensions. Click "Install All" to get:

- **Azure Static Web Apps** - Manage deployments from VS Code
- **Live Server** - Quick local preview with auto-reload
- **ESLint** - Code quality

If you don't see the prompt, press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac), type "Extensions: Show Recommended Extensions", and install them manually.

## Step 4: Run Locally

```bash
npm start
```

Then open http://localhost:3000 in your browser.

**Alternative:** Use the Live Server extension in VS Code - right-click `index.html` and select "Open with Live Server".

## Making Changes

1. Edit `index.html` (the main app file)
2. Save and refresh your browser to see changes
3. When ready, commit and push:

```bash
git add .
git commit -m "Your change description"
git push
```

GitHub Actions will automatically deploy your changes to Azure.

## Manual Deployment (Optional)

If you need to deploy directly without pushing to GitHub:

```bash
# Login to Azure (first time only)
az login

# Build and deploy
npm run deploy
```

## Project Structure

```
├── index.html              # Main app (HTML + CSS + JavaScript)
├── staticwebapp.config.json # Azure configuration
├── swa-cli.config.json     # SWA CLI configuration
├── package.json            # Dependencies and scripts
├── .vscode/
│   └── extensions.json     # Recommended VS Code extensions
└── .github/
    └── workflows/
        └── azure-static-web-apps.yml  # Auto-deployment workflow
```

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm start` | Run local development server |
| `npm run build` | Build for production |
| `npm run deploy` | Deploy to Azure |

## Troubleshooting

**"npm: command not found"**
- Install Node.js from https://nodejs.org/

**"Permission denied" errors**
- On Mac/Linux, you may need: `sudo npm install -g @azure/static-web-apps-cli`

**Port 3000 already in use**
- Kill the process using the port or use a different port: `npx serve . -l 8080`

**Deployment fails**
- Ensure you have the Azure CLI installed and are logged in: `az login`
- Check that you have contributor access to the Azure resource

## Live App

The app is deployed at: https://black-coast-0f5b5a60f.4.azurestaticapps.net

## Need Help?

Contact the repository owner or open an issue on GitHub.
