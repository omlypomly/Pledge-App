# StakeUp — Accountability Challenges with Real Stakes

A full-stack social accountability platform where friend groups put money into a shared prize pool. Hit milestones, eliminate losers, winners split the pool.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Auth | Clerk |
| Database | PostgreSQL + Prisma 7 |
| Payments | Stripe Connect |
| File Upload | UploadThing |
| Real-time Chat | Pusher |
| AI Verification | OpenAI GPT-4o Vision |
| Deployment | Vercel |

## Features

- **Challenge Creation** — Multi-step wizard with AI milestone generation
- **Escrow Payments** — Stake deposits held via Stripe Connect
- **3-Layer Verification** — AI → Community Vote → Dispute Resolution
- **Elimination System** — Miss a milestone = eliminated, stake stays in pool
- **Real-time Chat** — Per-challenge group chat via Pusher
- **Gamification** — XP, levels, streaks, badges
- **Admin Dashboard** — Users, challenges, disputes, revenue
- **Global Leaderboard** — Rankings by XP, wins, earnings

## Getting Started

### 1. Clone & Install

```bash
git clone <repo>
cd stakeup
npm install
```

### 2. Set Environment Variables

```bash
cp .env.example .env.local
```

Fill in all variables in `.env.local`:
- `DATABASE_URL` — PostgreSQL connection string (Neon/Supabase recommended)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` — from clerk.com
- `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — from stripe.com
- `UPLOADTHING_SECRET` + `UPLOADTHING_APP_ID` — from uploadthing.com
- `OPENAI_API_KEY` — from platform.openai.com
- `PUSHER_*` variables — from pusher.com

### 3. Database Setup

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Project Structure

```
/app                    # Next.js App Router pages
  /(auth)               # Sign-in / Sign-up pages
  /api                  # API routes (webhooks, chat, AI, upload)
  /challenges           # Challenge pages (create, detail, submit, join)
  /dashboard            # User dashboard
  /leaderboard          # Global rankings
  /profile/[id]         # User profiles
  /admin                # Admin dashboard
  /disputes             # Dispute resolution
  /settings             # Account settings
/components
  /ui                   # shadcn/ui components
  /challenges           # Challenge-specific components
  /dashboard            # Dashboard components
  /chat                 # Real-time chat
  /gamification         # Badges, XP display
  /layout               # Navbar, Sidebar
  /notifications        # Notification bell
/lib
  /actions              # Server Actions (challenges, submissions, payments, users)
  /ai                   # OpenAI verification helpers
  /stripe               # Stripe client helpers
  prisma.ts             # Prisma client singleton
  utils.ts              # Utilities
/prisma
  schema.prisma         # Full database schema
/types
  index.ts              # TypeScript types
```

## Key Flows

### Challenge Creation
1. User creates challenge (name, goal type, stake amount, milestones)
2. System generates invite code + link
3. Friends join via invite link
4. All participants deposit stake via Stripe
5. Creator starts the challenge

### Milestone Verification (3-Layer)
1. **AI (GPT-4o Vision)**: Confidence >= 80% = auto-approved, else community vote
2. **Community Vote**: 60%+ approve = approved, else dispute
3. **Admin Review**: Manual resolution for split votes

### Payout Formula
```
Winners = Active participants at challenge end
Net Pool = Total Pool * 90% (10% platform fee)
Per Winner = Net Pool / Winners
```

## Deployment (Vercel)

1. Push to GitHub
2. Import in Vercel
3. Set all env variables
4. Deploy

Database: Neon PostgreSQL recommended (serverless-friendly)
Run `npx prisma migrate deploy` before first deploy.

## Legal Notes

StakeUp is a **skill-based accountability platform**, not gambling:
- Stakes returned only to participants completing verified milestones
- No house edge; 10% is an administrative fee
- Age verification (18+) required
- PIPEDA compliant for Canadian users
