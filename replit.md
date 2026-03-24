# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains a Discord bot that manages a TP points leaderboard and HNP box shop system.

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
- **Discord**: discord.js v14

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── discord-bot/        # Discord bot (main project)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Discord Bot Features

### TP Points System
- Users earn 1–5 TP per valid message (minimum 10 characters)
- Maximum 100 TP per day per user
- Points are only awarded on/after the configured event start date

### HNP Box Shop
Three box types purchasable with TP points:
- **Fun Box** (100 TP): 50% Common, 30% Uncommon, 12% Rare, 6% Epic, 2% Legendary
- **Calev Box** (200 TP): 30% Common, 40% Uncommon, 15% Rare, 12% Epic, 3% Legendary
- **Chate Box** (300 TP): 20% Common, 50% Uncommon, 10% Rare, 15% Epic, 5% Legendary

HNP Rewards by Rarity:
- Common: 0.002–0.018 HNP
- Uncommon: 0.02–0.1 HNP
- Rare: 0.12–0.2 HNP
- Epic: 0.2–1.0 HNP
- Legendary: 1.0–2.0 HNP

### Commands
- `/leaderboard` — Top 10 TP earners
- `/balance` — Personal TP and HNP balance
- `/shop` — View box types and prices
- `/buy <box>` — Purchase a box
- `/withdraw <amount> <wallet>` — Request HNP withdrawal (deducts balance, posts to withdrawal channel)
- `/info` — Full guide on how the system works
- `/admin resettp` — Reset all users' TP to 0 (Admin only)
- `/admin adjusttp <user> <amount>` — Add/reduce TP for a user (Admin only)
- `/admin seteventstart <date>` — Set event start date YYYY-MM-DD (Admin only)
- `/admin setwithdrawalchannel <channel>` — Set withdrawal notification channel (Admin only)
- `/admin status` — View bot configuration (Admin only)

## Database Tables

- `discord_users` — User TP points and HNP balances
- `discord_daily_activity` — Daily TP tracking per user
- `discord_opened_boxes` — History of all opened boxes
- `discord_withdrawals` — Withdrawal requests log
- `discord_bot_config` — Bot configuration (event start date, withdrawal channel)

## Environment Variables / Secrets

- `DISCORD_BOT_TOKEN` — Discord bot token (required)
- `DATABASE_URL` — PostgreSQL connection string (auto-provisioned by Replit)

## Packages

### `artifacts/discord-bot` (`@workspace/discord-bot`)

Main Discord bot. Uses discord.js v14 with slash commands.
- Entry: `src/index.ts` — creates Discord client, sets up schema, registers commands
- Commands: `src/commands/` — one file per command
- DB helpers: `src/db.ts` — all database operations
- Config: `src/config.ts` — box types, rarities, HNP rewards
- Utils: `src/utils.ts` — rarity rolling, HNP calculation

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server (base scaffold, can be extended).

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.
Schema in `src/schema/discord.ts` — all Discord bot tables.
