# Carveout Router

A lightweight SaaS tool that helps small M&A advisors and business brokers automatically route deal carveout documents (financials, schedules, exhibits) to the right buyer contacts based on configurable rules.

**Core value:** Eliminate the manual "who gets which exhibit?" step in a deal data room.

---

## Features

- **Deal management** — Create and organize deals; add buyer contacts and documents.
- **Routing rules engine** — Map contact roles (Buyer, Advisor, Lender…) to document tag sets (financials, legal, operations…).
- **One-click routing** — Preview the full routing matrix, then apply it with one click.
- **Audit trail** — Every routing event is logged (contact, document, rule matched, timestamp).
- **Magic-link auth** — Passwordless email sign-in via NextAuth.js.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js v4 (email magic link) |
| Styling | Tailwind CSS |
| Deploy target | Vercel + managed Postgres (pending provisioning) |

---

## Local development setup

### 1. Prerequisites

- Node.js ≥ 20
- A running PostgreSQL instance (local or via Docker)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env — set DATABASE_URL and NEXTAUTH_SECRET at minimum
```

Generate a secret:

```bash
openssl rand -base64 32
```

### 4. Set up the database

```bash
# Push the schema (creates tables without a migration file — good for initial dev)
npm run db:push

# Or run migrations (recommended for teams)
npm run db:migrate
```

### 5. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). You'll be redirected to the sign-in page. Enter your email — with no SMTP configured the magic link is printed to your **server console**.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript type check |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:push` | Push schema without migrations (dev only) |
| `npm run db:studio` | Open Prisma Studio |

---

## Project structure

```
src/
├── app/                    # Next.js App Router pages + API routes
│   ├── api/
│   │   ├── auth/           # NextAuth handler
│   │   └── deals/          # REST API for deals, contacts, documents, rules, routing
│   ├── auth/signin/        # Magic-link sign-in page
│   └── deals/              # Deal list, detail, contacts, documents, rules, log
├── components/
│   ├── forms/              # ContactForm, DocumentForm, RuleForm
│   ├── nav/                # DealNav tab bar
│   └── routing/            # RoutingPreview (dry-run + apply)
└── lib/
    ├── auth.ts             # NextAuth config
    ├── prisma.ts           # Prisma client singleton
    ├── routing-engine.ts   # Pure routing logic (unit-testable)
    └── utils.ts            # cn(), formatDate()

prisma/
└── schema.prisma           # DB schema: Deal, Contact, Document, RoutingRule, RoutingLog

test/
├── routing-engine.test.ts  # Routing logic unit tests
└── index.test.ts           # Utility function tests
```

---

## Routing rules model

A **RoutingRule** maps a contact `role` to a set of document `tags`:

```
role: "Buyer"   → tags: ["financials", "legal"]
role: "Advisor" → tags: ["financials", "legal", "operations"]
```

When you click **Apply & log routes**, the engine:
1. Iterates over every contact in the deal.
2. Finds the rule whose `role` matches the contact's role.
3. Finds every document whose `tag` is in the rule's `tags` list.
4. Writes one `RoutingLog` row per (contact × document) pair.

The **Audit Log** page shows the full history with rule-matched details.

---

## Infrastructure note

Cloud provisioning (AWS ECS, RDS, Vercel deploy) is **pending operator setup**. The application is fully functional locally with a Postgres instance and the env vars above. Deployment hooks are pre-wired in `.github/workflows/deploy-hooks.yml` — set `VERCEL_DEPLOY_HOOK_URL` and `SUPABASE_DEPLOY_HOOK_URL` as repository secrets when infra is ready.

---

## CI

Pull requests targeting `main` run:

- `npm run typecheck`
- `npm run lint`
- `npm test`

## Deploy Hooks

Pushes to `main` trigger `.github/workflows/deploy-hooks.yml`.
Set these repository secrets:

- `VERCEL_DEPLOY_HOOK_URL`
- `SUPABASE_DEPLOY_HOOK_URL`
