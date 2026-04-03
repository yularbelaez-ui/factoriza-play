# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### FactorIzA-Play (Mobile App)
- **Type**: Expo (React Native)
- **Path**: `artifacts/factoriza-play/`
- **Stack**: Expo Router, React Native, AsyncStorage
- **Purpose**: Intelligent tutoring system for 8th grade factorization

#### Features
- 5 factorization modules (Factor Común, Diferencia de Cuadrados, Suma/Diferencia de Cubos, Trinomio Cuadrado Perfecto, Trinomio x²+bx+c)
- Gamified exercise system with XP, streaks, rankings
- Step-by-step hints and explanations
- Teacher dashboard: unlock modules, create evaluation codes, analyze student errors
- Community ranking board for 8th grade class
- Code-locked evaluation mode per module
- Real-world applications in each module
- 5 error categories tracked: arithmetic, variables, equality, operations, powers

#### Key Data
- Module data: `data/modules.ts`
- App context/state: `context/AppContext.tsx` (AsyncStorage persistence)
- Screens: `app/(tabs)/` (home, modulos, comunidad, evaluacion, docente)
- Detail screens: `app/modulo/[id].tsx`, `app/ejercicio/[id].tsx`, `app/evaluacion-modulo/[id].tsx`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
