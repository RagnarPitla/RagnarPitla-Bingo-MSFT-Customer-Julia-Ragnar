# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repo contains two web apps deployed together to Azure Static Web Apps:

1. **Bingo App** (`index.html`) — A single-file vanilla JS/HTML/CSS interactive bingo board for tracking yearly goals
2. **Matching Game** (`Matching Game Code/project/`) — A React/TypeScript multiplayer card-matching game where a dealer reveals AI agent cards and participants make selections, backed by Supabase realtime

## Commands

### Root level

```bash
npm start              # Serve root on port 3000 (for Bingo app)
npm run install:all    # Install deps for root + Matching Game
npm run build          # Assemble dist/ (copy index.html + SWA config, then build matching-game)
npm run build:win      # Same, Windows batch version
npm run deploy         # build + swa deploy ./dist --env production
```

### Matching Game (run from `Matching Game Code/project/`)

```bash
npm run dev            # Vite dev server on port 8080 (base path: /matching-game/)
npm run build          # Production build
npm run lint           # ESLint
npm run test           # Vitest (single run)
npm run test:watch     # Vitest watch mode
```

## Architecture

### Bingo App
Fully self-contained in `index.html`. Customize the bingo board items in the `bingoItems` array in the script section. State persists to `localStorage`. No build step needed.

### Matching Game
React 18 + Vite + TypeScript + Tailwind + shadcn/ui. Key files:

- `src/App.tsx` — React Router setup; routes: `/` (Index) and `*` (NotFound)
- `src/pages/Index.tsx` — Entry point; manages participant state and test mode
- `src/components/PokerTable.tsx` — Core game controller; subscribes to Supabase realtime on `participants`, `selections`, and `game_state` tables
- `src/components/CardDeck.tsx` — Displays agent cards in rotation
- `src/data/agents.ts` — Defines the 4 AI agent cards (Payment Reconciliation, Store Monitoring, Adaptive Skills Policy, Personalization UI)
- `src/integrations/supabase/client.ts` — Supabase client with in-memory mock fallback when env vars are missing
- `src/utils/exportSelections.ts` — XLSX export of participant selections
- `src/components/ui/` — shadcn/ui component library (~50 components)

**Supabase tables:** `participants` (id, name, company, role: "dealer"|"player"), `selections` (participant_id, agent_key), `game_state` (id, current_card_index)

**Vite base path:** `/matching-game/` — all asset URLs are relative to this prefix.

### Build Assembly

The `dist/` folder is assembled by the root-level build script:
- `dist/index.html` — Bingo app
- `dist/matching-game/` — Vite build output from Matching Game
- `dist/staticwebapp.config.json` — Azure SWA routing + CSP headers

### Deployment

Push to `main` triggers `.github/workflows/azure-static-web-apps.yml`, which builds and deploys automatically to Azure Static Web Apps. The live URL is https://lemon-ground-0fecfc40f.1.azurestaticapps.net.

## Environment Variables (Matching Game)

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Create `.env.local` in `Matching Game Code/project/` for local dev. Without these, the app uses an in-memory mock client (no persistence, no realtime).

## Path Aliases

In the Matching Game, `@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json`).
