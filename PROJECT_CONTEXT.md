# Orvex Operators Backend - Project Context & Setup Guide

**Last Updated:** 2026-02-05
**Status:** ✅ PRODUCTION READY & LIVE ON VERCEL
**User:** jaywheel1 (non-technical, trusts AI judgment)

---

## 🎯 Project Overview

**Orvex Operators Backend** is a Web3-enabled operator management system for the Orvex ecosystem. It's a Next.js 16 full-stack application that manages user registration, task submissions, operator approvals, referral rewards, and a competitive leaderboard.

**Key Purpose:**
- Allow users to register with crypto wallets
- Submit tasks (screenshot verification via AI)
- Earn console points (CP) for completed tasks
- Referral system for community growth
- Operator roles for task approval and reward distribution

---

## 🏗️ Architecture & Tech Stack

### Core Technologies
- **Framework:** Next.js 16 (React 19, TypeScript 5)
- **Styling:** TailwindCSS
- **Backend:** Next.js API Routes (serverless functions)
- **Database:** Supabase (PostgreSQL)
- **Web3:** Wagmi + Rainbow Kit (wallet connection)
- **AI:** Anthropic Claude API (tweet/image verification)
- **Testing:** Jest + React Testing Library
- **Deployment:** Vercel (auto-deploy from `main` branch)
- **CI/CD:** GitHub Actions

### Key Dependencies
```json
{
  "next": "16.0.0",
  "react": "19.0.0",
  "typescript": "5.x",
  "@tanstack/react-query": "latest",
  "wagmi": "latest",
  "@rainbow-me/rainbowkit": "latest",
  "tailwindcss": "latest",
  "@supabase/supabase-js": "latest",
  "jest": "latest",
  "@testing-library/react": "latest"
}
```

---

## 📁 Project Structure

```
/home/user/orvex-operators-backend/
├── app/
│   ├── layout.tsx                    # Root layout with providers
│   ├── providers.tsx                 # Wagmi + React Query setup
│   ├── page.tsx                      # Home/landing page
│   ├── register/page.tsx             # User registration flow
│   ├── dashboard/page.tsx            # User dashboard
│   ├── admin/page.tsx                # Admin panel
│   ├── submit/page.tsx               # Task submission
│   ├── task/[id]/page.tsx            # Task details
│   ├── api/
│   │   ├── auth/                     # Authentication endpoints
│   │   ├── register/route.ts         # User registration
│   │   ├── verify-tweet/route.ts     # Tweet verification (AI)
│   │   ├── verify-follow/route.ts    # Follow verification
│   │   ├── submit-task/route.ts      # Task submission
│   │   ├── operator/
│   │   │   ├── approve/route.ts      # Approve task submission
│   │   │   ├── submissions/route.ts  # Get operator submissions
│   │   ├── admin/
│   │   │   ├── users/route.ts        # Admin: manage users
│   │   │   ├── settings/route.ts     # Admin: update settings
│   │   ├── leaderboard/route.ts      # Public leaderboard
│   │   ├── referral/route.ts         # Referral system
│   │   ├── cp-ledger/route.ts        # CP transaction history
│
├── lib/
│   ├── supabase.ts                   # Supabase client setup
│   ├── auth.ts                       # Authentication utilities
│   ├── logger.ts                     # Structured JSON logging
│   ├── retry.ts                      # Exponential backoff retry
│   ├── sanitize.ts                   # Input validation
│   ├── whitelist.ts                  # Admin wallet allowlist
│
├── components/
│   ├── ErrorBoundary.tsx             # Error boundary wrapper
│   ├── Navigation.tsx                # Header navigation
│   ├── WalletConnect.tsx             # Wallet connection UI
│   ├── TaskCard.tsx                  # Task display component
│
├── __tests__/
│   ├── api/
│   │   ├── verify-tweet.test.ts      # Tweet verification tests
│   │   ├── operator-approve.test.ts  # Approval flow tests
│   │   ├── leaderboard.test.ts       # Leaderboard pagination tests
│
├── .github/workflows/
│   ├── test.yml                      # CI/CD pipeline
│   ├── sync-to-main.yml              # Auto-sync vercel-main to main
│
├── supabase/
│   ├── migrations/
│   │   ├── add-performance-indexes.sql  # Database indexes
│
├── jest.config.ts                    # Jest configuration
├── jest.setup.ts                     # Jest environment setup
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # TailwindCSS configuration
├── tsconfig.json                     # TypeScript configuration
├── .env.example                      # Environment variables template
└── PROJECT_CONTEXT.md                # This file
```

---

## 🔑 Git & Deployment Workflow

### Branch Strategy
- **Production Branch:** `main` - Vercel auto-deploys from this
- **Live Development:** `claude/vercel-main-BkzVK` - All changes go here
- **Local Working:** `vercel-main` - Local branch (tracks remote vercel-main-BkzVK)

### How Deployments Work
1. Make changes on local `vercel-main` branch
2. Commit: `git commit -m "your message"`
3. Push: `git push origin vercel-main:claude/vercel-main-BkzVK`
4. GitHub Actions workflow `sync-to-main.yml` automatically runs:
   - Syncs `claude/vercel-main-BkzVK` → `main`
5. Vercel watches `main` and auto-deploys
6. Site updates live (5-10 minutes typically)

### Important Git Notes
- **Local proxy** blocks direct pushes to `main` (security feature)
- Use branch naming: `claude/*-BkzVK` for any new feature branches
- The sync workflow handles main branch updates automatically

---

## 📋 Environment Variables

Create `.env.local` in project root with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Web3 / Wagmi
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# AI Verification (Anthropic)
ANTHROPIC_API_KEY=sk-ant-...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000 (production: your-domain.com)
```

**Note:** These are only needed for local development. Vercel environment variables are configured separately in Vercel dashboard.

---

## 🗄️ Database Schema (Supabase)

### Main Tables

**users**
```sql
- id: uuid (PK)
- wallet_address: varchar (unique, lowercase)
- username: varchar
- points: integer (default: 0)
- rank: integer (calculated)
- role: enum ('user', 'operator', 'admin')
- created_at: timestamp
- metadata: jsonb (profile data)
```

**task_submissions**
```sql
- id: uuid (PK)
- user_id: uuid (FK → users)
- task_type: varchar
- status: enum ('pending', 'approved', 'rejected')
- proof_url: text (screenshot URL or reference)
- created_at: timestamp
- approved_by: uuid (FK → users) [operator who approved]
```

**cp_ledger**
```sql
- id: uuid (PK)
- user_id: uuid (FK → users)
- amount: integer (positive/negative)
- reason: varchar
- created_at: timestamp
- metadata: jsonb (transaction details)
```

**referrals**
```sql
- id: uuid (PK)
- referrer_id: uuid (FK → users)
- referee_id: uuid (FK → users)
- reward_given: boolean
- created_at: timestamp
```

### Database Indexes
Located in: `supabase/migrations/add-performance-indexes.sql`
- `users.points DESC` - Leaderboard sorting
- `users.wallet_address` - User lookups
- `task_submissions(status, created_at)` - Query filtering
- `referrals(referrer_id)` - Referral lookups
- `cp_ledger(user_id)` - Transaction history

---

## 🔐 Security & Admin Setup

### Admin Wallet
```typescript
// File: lib/whitelist.ts
const ADMIN_WALLETS = ['0xc4a00be797e0acfe8518f795359898b01a038dc8'];
```

**Admin Privileges:**
- Verify tweets without AI (auto-approve)
- View all users and submissions
- Approve/reject tasks
- Distribute CP rewards
- View system analytics

### Authentication Flow
1. User connects wallet via Rainbow Kit
2. Wallet address becomes user ID
3. Requests include `X-Wallet-Address` header
4. Server verifies wallet via Supabase
5. Authorization middleware checks user role

---

## 🧪 Testing & Quality

### Run Tests
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Linting
```bash
npm run lint               # ESLint check
npm run lint:fix          # Auto-fix issues
```

### Build
```bash
npm run build              # Production build (Next.js)
npm run dev                # Local dev server (http://localhost:3000)
```

### Test Files
- `__tests__/api/verify-tweet.test.ts` - Tweet verification tests
- `__tests__/api/operator-approve.test.ts` - Approval flow tests
- `__tests__/api/leaderboard.test.ts` - Pagination & caching tests

---

## 📊 Week 1 & 2 Completed Work

### Week 1 - Security & Integrity ✅
1. **Tweet Verification:** Admin wallet auto-approve, others require AI Claude verification
2. **Screenshot Storage:** Removed base64 from DB, process through AI only
3. **Input Validation:** File size (10MB), image types (JPEG/PNG/GIF/WebP), URL format
4. **Auth Checks:** Centralized authorization on all admin endpoints
5. **Transaction Integrity:** CP ledger created before submission approval
6. **localStorage SSR:** Fixed hydration mismatch with `typeof window` checks
7. **Wallet Capture:** Added wallet_address to all task submissions

### Week 2 - Quality & Stability ✅
1. **ESLint Warnings:** Fixed all 10 warnings (unused vars, missing dependencies, font location)
2. **Error Boundaries:** Created ErrorBoundary component, wrapped all key pages (dashboard, register, admin, submit, task)
3. **Performance:** Pagination limits (max 1000 rows), cache headers (5-min), database indexes
4. **Testing:** Jest + React Testing Library setup with 3 critical test suites
5. **CI/CD:** GitHub Actions pipeline (lint, test, build, security scan)
6. **Code Quality:** Added logging service, retry mechanism, input sanitization
7. **Consolidation:** Removed duplicate wagmi config

---

## 🚀 Deployment Status

**Current Status:** ✅ LIVE ON VERCEL

**Live URL:** Check Vercel dashboard for current deployment
**Deployment Branch:** `main` (auto-deployed by Vercel)
**Source Branch:** `claude/vercel-main-BkzVK` (where changes go)

**Auto-Sync Workflow:** GitHub Actions automatically syncs changes:
```
Push to claude/vercel-main-BkzVK
  → GitHub Actions runs sync-to-main.yml
    → Pushes to main
      → Vercel detects main update
        → Auto-deploys in 5-10 minutes
```

---

## 📝 Common Tasks

### Making Changes
```bash
# Pull latest
git fetch origin

# Check status
git status

# Make your changes, then:
git add .
git commit -m "Fix: description of change"
git push origin vercel-main:claude/vercel-main-BkzVK
```

### Checking Deployment
1. Check GitHub Actions: https://github.com/jaywheel1/orvex-operators-backend/actions
2. Watch for `sync-to-main.yml` workflow to complete
3. Check Vercel dashboard for deployment status
4. Test on live site (5-10 min after push)

### Debugging
- **Build Issues:** Run `npm run build` locally
- **Lint Issues:** Run `npm run lint:fix`
- **Test Failures:** Run `npm test -- path/to/test.ts`
- **Vercel Issues:** Check Build Logs in Vercel dashboard
- **Database Issues:** Check Supabase dashboard query editor

---

## ⚠️ Known Constraints

1. **Git Proxy:** Local proxy blocks pushes to `main` branch directly (use `claude/vercel-main-BkzVK`)
2. **GitHub PAT Token:** User's token has limited scope (can't create PRs via API)
3. **Vercel API:** Can't change production branch via API (one-time setup)
4. **Environment Variables:** Only needed locally - Vercel has its own config

---

## 💾 Backup & Important Files

**Never Delete:**
- `app/providers.tsx` - Wagmi configuration
- `lib/supabase.ts` - Database client
- `next.config.ts` - Build configuration
- `.github/workflows/sync-to-main.yml` - Deployment automation
- `jest.config.ts` - Test setup

**Safe to Modify:**
- Any page in `app/` directory
- Any API route in `app/api/`
- Components in `components/`
- Tests in `__tests__/`

---

## 🎯 Next Steps for New Sessions

When starting a new session:

1. **Read this file** (PROJECT_CONTEXT.md) to understand setup
2. **Ask the user** what they want to build/fix
3. **Check git status:** `git status` and `git log --oneline -5`
4. **Run tests:** `npm test` to verify system health
5. **Make changes** and follow the deployment workflow above
6. **Update PROJECT_CONTEXT.md** if setup changes

---

## 📞 Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start local dev server |
| `npm run build` | Build for production |
| `npm test` | Run test suite |
| `npm run lint` | Check code style |
| `git status` | Check git status |
| `git log --oneline -5` | Last 5 commits |
| `git push origin vercel-main:claude/vercel-main-BkzVK` | Deploy changes |

---

## 📚 Important Files to Review

- `PROJECT_CONTEXT.md` (this file) - Project overview
- `lib/auth.ts` - Authorization logic
- `app/api/verify-tweet/route.ts` - Tweet verification with AI
- `components/ErrorBoundary.tsx` - Error handling
- `lib/logger.ts` - Logging patterns
- `.github/workflows/sync-to-main.yml` - Deployment automation

---

**Last Updated:** 2026-02-05
**All systems operational.** Ready for new features and improvements!
