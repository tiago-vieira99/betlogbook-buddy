# BetLogger

A React frontend app for tracking sports bets and bankrolls. Built with Vite, TypeScript, Tailwind CSS, and shadcn/ui.

## Architecture

- **Frontend only**: Pure React SPA (no backend in this repo)
- **API**: Connects to an external REST API via `/api` base URL (configured in `src/services/api.ts`)
- **Routing**: React Router v6 with pages for bankrolls, teams, matches, and streaks

## Key Files

- `src/App.tsx` — Root component with routing setup
- `src/pages/` — Page components (Index, BankrollPage, TeamsPage, MatchesPage, StreaksPage)
- `src/components/` — Shared UI components (AddBetForm, BankrollChart, BetList, etc.)
- `src/services/api.ts` — API client for bankrolls and bets
- `src/services/teamApi.ts` — API client for team data
- `src/services/streakApi.ts` — API client for streak data
- `src/types/` — TypeScript type definitions
- `vite.config.ts` — Vite config (port 5000, host 0.0.0.0 for Replit)

## Development

```bash
npm run dev      # Start dev server on port 5000
npm run build    # Production build
npm run preview  # Preview production build
```

## External API

The app expects a backend API running separately. The base URL is `/api` (see `src/services/api.ts`). In the original Lovable setup this was proxied to `host.docker.internal:8880`. To connect your API on Replit, update the proxy or point `API_BASE_URL` to your backend URL.

## Dependencies

- React 18 + React Router 6
- Vite 5 + TypeScript
- Tailwind CSS + shadcn/ui (Radix UI primitives)
- TanStack Query for data fetching
- Recharts for charts
- Zod + React Hook Form for forms
