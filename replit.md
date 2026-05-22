# Dbrutals

Route planning, team scheduling, and delivery management app for vending machine operations.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/dbrutals/src/` — React + Vite frontend
- `artifacts/dbrutals/src/App.tsx` — main app with all page routing and sidebar
- `artifacts/dbrutals/src/index.css` — theme (dark/light CSS vars, fonts, animations)
- `artifacts/api-server/src/routes/` — Express route handlers (routes, calendar, notes, plano, rooster, route-notes, deliveries, proxy-image)
- `artifacts/dbrutals/public/` — static assets (PWA icons, manifest, service worker)
- `artifacts/dbrutals/icon/` — internal image assets (noimage.jpeg, fmlogo.png, etc.)

## Architecture decisions

- API originally used Neon serverless SQL; migrated to Replit PostgreSQL via `@workspace/db` pool
- Tables are created on first request (CREATE TABLE IF NOT EXISTS pattern) — no separate migration step needed
- Frontend is a fully client-rendered SPA with localStorage for persisted state (routes, pinned, quick access)
- Dark/light mode applied before React mounts via inline script to prevent flash
- App zoom is responsive: 100% mobile, 120% desktop, configurable per user

## Product

Route & Calendar Management for delivery/vending operations: manage delivery routes with GPS-enabled maps, track team rosters and shift schedules, view planogram (Plano VM) data, browse photo albums, monitor delivery locations, and manage calendar events — all with light/dark theme and PWA support.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
