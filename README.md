# 2025 Goals Bingo

An interactive bingo game for tracking personal and work goals throughout the year.

## Features

- 🎯 Interactive 5x5 bingo board with goals
- 👤 Personalized player names
- 💾 Progress auto-saves to browser localStorage
- 🎉 Bingo detection for rows, columns, and diagonals
- 📊 Progress tracking bar
- 📱 Mobile-responsive design
- 🔗 Share your progress with friends

## Deployment to Azure Static Web Apps

### Prerequisites

1. An Azure account
2. A GitHub account
3. Azure CLI (optional, for command-line deployment)

### Setup Steps

1. **Create a GitHub Repository**
   ```bash
   cd bingo-app
   git init
   git add .
   git commit -m "Initial commit - Bingo app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/bingo-app.git
   git push -u origin main
   ```

2. **Create Azure Static Web App**
   - Go to [Azure Portal](https://portal.azure.com)
   - Click "Create a resource" → Search "Static Web App"
   - Fill in the details:
     - **Subscription**: Your subscription
     - **Resource Group**: Create new or use existing
     - **Name**: bingo-app (or your preferred name)
     - **Region**: Choose closest to your users
     - **SKU**: Free
   - Under "Deployment details":
     - **Source**: GitHub
     - **Organization**: Your GitHub username
     - **Repository**: bingo-app
     - **Branch**: main
   - Under "Build Details":
     - **Build Presets**: Custom
     - **App location**: /
     - **Api location**: (leave empty)
     - **Output location**: (leave empty)
   - Click "Review + create" → "Create"

3. **GitHub Actions Workflow**
   - Azure will automatically create a GitHub Actions workflow
   - A deployment token will be added as a secret `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - The included `.github/workflows/azure-static-web-apps.yml` will handle deployments

4. **Access Your App**
   - After deployment, find your URL in Azure Portal under your Static Web App resource
   - URL format: `https://<random-name>.azurestaticapps.net`

### Updating the App

Simply push changes to the `main` branch:
```bash
git add .
git commit -m "Your update message"
git push
```

The GitHub Actions workflow will automatically deploy your changes.

## Customizing the Bingo Items

Edit the `bingoItems` array in `index.html` to customize the goals:

```javascript
const bingoItems = [
    { text: "Your goal here", color: "yellow", category: "work" },
    // ... more items
];
```

Available colors: `yellow`, `red`, `blue`, `green`, `purple`, `orange`, `pink`, `teal`

## Local Development

Simply open `index.html` in a web browser - no build step required!

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Then open http://localhost:8000
```

## License

MIT License - Feel free to use and modify!
