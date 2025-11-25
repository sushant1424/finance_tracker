# Finance Tracker

Finance Tracker is a full‑stack personal finance app built with Next.js (App Router). It helps you track income and expenses, manage budgets, set goals, and view rich statistics. An admin panel lets you manage users, view app‑wide analytics, and configure the public landing page content via site settings.

## Features

- **Dashboard & Accounts**
  - Overview of balances, recent transactions, and key metrics.
  - Manage accounts and recurring transactions.

- **Transactions & Budgeting**
  - Create, edit, and categorize transactions.
  - Budgets, recurring items, and goals.

- **Statistics & Reports**
  - Balance, cash‑flow, and spending statistics under `/statistics/*`.
  - Reports section with charts and insights.

- **Admin Panel**
  - `/admin` dashboard with global stats.
  - **Users**: list users and inspect individual user details.
  - **Admin analytics**: charts for user growth, activity, and usage.
  - **Site settings**: configure landing page content (hero, features, pricing, footer) with live previews. Each subsection has its own page under `/admin/settings/*`.

## Tech Stack

- **Framework**: Next.js (App Router, React server components)
- **Language**: TypeScript, React 18
- **Auth**: Clerk
- **Database**: PostgreSQL via Prisma
- **Styling & UI**: Tailwind CSS, custom UI components, motion/animation

---

## Local Development

### 1. Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm (preferred) or npm/yarn
- PostgreSQL database

### 2. Install dependencies

```bash
pnpm install
# or
npm install
```

### 3. Environment variables

Create a `.env` file in the project root. At minimum you’ll need:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/finance_tracker"

CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Optional: other Clerk/Next URLs depending on your setup
# NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
# NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
```

Adjust values to match your local database and Clerk project.

### 4. Database setup

Run Prisma migrations to create the schema (including `SiteSettings`, transactions, goals, etc.):

```bash
pnpm prisma migrate dev
```

Optionally seed demo data:

```bash
pnpm dev
# then in another terminal you can hit the seed route if implemented, e.g.
# curl http://localhost:3000/api/seed
```

### 5. Run the development server

```bash
pnpm dev
```

Open `http://localhost:3000` in your browser.

- Main app pages: `/dashboard`, `/transaction`, `/accounts`, `/goals`, `/statistics/*`, etc.
- Admin panel: `/admin` (requires an admin Clerk user – see your Clerk dashboard for role setup).
- Site settings: `/admin/settings/general`, `/admin/settings/hero`, `/admin/settings/features`, `/admin/settings/pricing`, `/admin/settings/footer`.

### 6. Build for production

```bash
pnpm build
pnpm start
```

This runs `next build` with Turbopack and starts the optimized production server.

---

## Notes

- The project was originally bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
- For general Next.js docs, see:
  - [Next.js Documentation](https://nextjs.org/docs)
  - [Learn Next.js](https://nextjs.org/learn)

