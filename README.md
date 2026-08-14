# منصة مساري الرقمية (Msari Web Platform)

منصة مساري لحجز الفنادق والخدمات السياحية في اليمن المبنية باستخدام Next.js (App Router)، Next-Intl، Firebase Firestore، و TailwindCSS.

---

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/[locale]/page.tsx`. The page auto-updates as you edit the file.

---

## 🏗️ Architecture & Documentation Governance

The active documentation and architectural guidelines for this project are maintained under `docs/`:

- 🤖 **AI Agent & Developer Guide**: [`docs/architecture/AI_AGENT_GUIDE.md`](docs/architecture/AI_AGENT_GUIDE.md) — Mandatory governance rules for human developers and AI coding agents.
- 🚀 **Production Deployment Guide**: [`docs/deployment/PRODUCTION_DEPLOYMENT_GUIDE.md`](docs/deployment/PRODUCTION_DEPLOYMENT_GUIDE.md) — Production PM2, Nginx, and host deployment instructions.
- ⚙️ **Hostinger Environment**: [`docs/deployment/HOSTINGER_ENVIRONMENT.md`](docs/deployment/HOSTINGER_ENVIRONMENT.md) — Server environment configuration.
- 🗺️ **SEO Migration Guide**: [`SEO_MIGRATION_AR.md`](SEO_MIGRATION_AR.md) — SEO redirects and migration mapping.

> ℹ️ **Historical Documents**: Legacy blueprints and superseded proposals are archived under [`docs/archive/`](docs/archive/) for historical reference only and do not represent the current architecture.

---

## 🛡️ Protected Operational Data & Architecture

- **Primary Database**: Firebase Firestore (operational collections: `hotels`, `destinations`, `discounts`, `bookings`, `users`, `bank_accounts`).
- **Clean Slate**: The legacy Website CMS has been removed; public website routes operate autonomously from baseline data and active Firestore collections.
- **Strict Data Protection**: Operational collections and user booking data are strictly protected and must never be altered or deleted during development or cleanup tasks.
