# Orvex Operators — Project Context

## What This Is

A full-stack Web3 rewards platform for the **Orvex testnet campaign** (8 weeks). Users connect crypto wallets, complete tasks across five categories, and earn **Community Points (CP)**. Operators review submissions manually; admins manage the campaign lifecycle.

Despite the repo name "backend," this is a complete Next.js application — frontend pages, API routes, and database logic all in one.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript 5, React 19 |
| Database | Supabase (PostgreSQL) — service-role client, no RLS |
| Styling | Tailwind CSS 4 |
| Web3 | Wagmi 2 + RainbowKit 2 + viem 2 |
| AI | Anthropic Claude SDK (`@anthropic-ai/sdk`) — screenshot verification |
| Deployment | Vercel (no Docker) |
| Package manager | npm |

## Directory Structure

```
app/
├── api/                        # API routes (serverless functions)
│   ├── admin/                  # ban, campaign, check, points, users
│   ├── operator/               # approve, reject, submissions
│   ├── tasks/                  # list all tasks, [id] detail
│   ├── user/                   # user profile lookup
│   ├── campaign-status/        # is campaign live?
│   ├── leaderboard/            # ranked user list
│   ├── referral/               # referral stats
│   ├── submit-task/            # task submission (FormData)
│   ├── verify-tweet/           # tweet verification
│   └── verify-follow/          # follow verification (Claude AI vision)
├── admin/                      # Admin dashboard page
├── dashboard/                  # User dashboard
├── register/                   # Wallet registration + Twitter verification
├── submit/                     # Task submission UI
├── task/                       # Task detail pages
├── layout.tsx                  # Root layout
├── page.tsx                    # Landing / hero page
├── providers.tsx               # Wagmi + RainbowKit + QueryClient providers
└── globals.css

components/
├── AnimatedBackground.tsx
├── CursorGlow.tsx
└── Navigation.tsx

lib/
├── supabase.ts                 # Supabase admin client (service role)
├── tasks-config.ts             # All task/category/rank definitions
├── types.ts                    # Shared TypeScript types
├── wagmi.ts                    # Wagmi + chain config
└── whitelist.ts                # Whitelisted wallets (testing bypass)

supabase/                       # SQL migration scripts (run manually)
├── setup.sql                   # profiles, task_submissions, cp_ledger
├── frontend-setup.sql          # users, settings, tasks tables
├── referrals-setup.sql         # referrals table + referral code trigger
└── add-x-handle.sql            # adds x_handle column to users
```

## Database Schema

Run SQL scripts in order: `setup.sql` → `frontend-setup.sql` → `referrals-setup.sql` → `add-x-handle.sql`

### Tables

**profiles** — Role-based access (user / operator / admin)
- `id` UUID PK, `role` text, `created_at`, `updated_at`

**users** — Registered users (one per wallet)
- `id` UUID PK, `wallet_address` unique, `points` integer
- Twitter verification: `tweet_url`, `verification_code`, `tweet_verified`, `follow_verified`, `follow_screenshot_url`
- Registration: `registration_complete`, `registration_completed_at`
- Admin: `is_banned`, `ip_address`
- Referrals: `referral_code` unique (auto-generated `ORVEX-XXXXXX`), `referred_by`
- `x_handle` — user's X/Twitter handle

**task_submissions** — User-submitted task proofs
- `id` UUID PK, `user_id`, `task_id`, `task_category`, `task_type`
- `proof` (screenshot URL or text), `link_url`
- `status` (pending / approved / rejected), `cp_reward`
- `rejection_reason`, `reviewed_by` → profiles, `reviewed_at`

**cp_ledger** — Immutable log of all point changes
- `id`, `user_id`, `amount`, `reason`, `submission_id` → task_submissions

**tasks** — Available tasks (DB-stored, but most task logic lives in `lib/tasks-config.ts`)

**settings** — Key-value config (currently just `campaign_live: true/false`)

**referrals** — Tracks who referred whom + CP awarded

## API Endpoints

All routes return `{ ok: true, data: T }` or `{ ok: false, error: string }`.

### Public
- `GET /api/campaign-status` — campaign live status
- `GET /api/leaderboard?limit=&offset=` — ranked leaderboard

### User
- `GET /api/user?wallet=` — profile, points, task count, referral count
- `GET /api/tasks?wallet=` — all tasks with user's submission status
- `GET /api/tasks/[id]` — single task detail
- `POST /api/submit-task` — submit task (FormData: wallet, task_id, proof_url/screenshot)
- `GET /api/referral/stats?wallet=` — referral code + stats

### Verification
- `POST /api/verify-tweet` — verify a tweet (auto-pass in test mode)
- `POST /api/verify-follow` — verify X follow via Claude AI vision on screenshot

### Operator
- `GET /api/operator/submissions?operator_id=&status=&limit=&offset=` — list submissions
- `POST /api/operator/approve` — approve + award CP
- `POST /api/operator/reject` — reject with reason

### Admin
- `GET /api/admin/check?wallet=` — check if wallet is admin/operator
- `GET /api/admin/users` — list all registered users
- `POST /api/admin/campaign` — toggle campaign live/off
- `POST /api/admin/ban` — ban/unban user
- `POST /api/admin/points` — manually adjust user points

## Task System

Tasks are defined in `lib/tasks-config.ts` (source of truth) across 5 categories:

| Category | Max CP | Status |
|----------|--------|--------|
| Social Operations | 2,400 | Active |
| Trading Operations | 12,000 | Coming Soon |
| Liquidity Operations | 25,000 | Coming Soon |
| Advanced Operations | 18,500 | Partially Active |
| Consistency Bonus | 16,000 | Partially Active |

**Verification types:** `auto`, `manual` (operator review), `screenshot`, `link`, `onchain`

**Rank progression** (based on total CP):
- Operator (1,000 CP) → Controller (5,000) → Commander (15,000) → Marshal (35,000) → Architect (75,000)

## Auth Model

No traditional auth — identity is wallet address. The `profiles` table maps UUIDs to roles. Admin/operator checks query the profile role before allowing privileged operations. A whitelist in `lib/whitelist.ts` allows certain wallets to bypass verification (for testing).

## Environment Variables

```
SUPABASE_URL=               # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=  # Service role key (server-side only)
NEXT_PUBLIC_APP_URL=        # Base URL for referral links
ANTHROPIC_API_KEY=          # Claude AI for verification
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=  # WalletConnect
ENABLE_AI_VERIFICATION=    # true/false — toggle Claude verification
```

## Scripts

```bash
npm run dev     # Start dev server (localhost:3000)
npm run build   # Production build
npm run start   # Start production server
npm run lint    # ESLint
```

## Current Gaps

- **No tests** — no test framework, no test files
- **No Docker** — Vercel-only deployment
- **No CI/CD** — no GitHub Actions or similar
- **No RLS** — Supabase tables use service-role key, no row-level security
- **Trading/Liquidity/Consistency tasks** — defined but marked `coming_soon` (no on-chain verification yet)
