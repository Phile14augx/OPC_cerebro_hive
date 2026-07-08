# OPC_cerebro_hive

Business and product repository for **CerebroHive** — an AI consulting, automation, and education company (operated as a One Person Company, hence "OPC"). This repo holds the company's business planning documents, brand assets, pitch materials, and the source code for the CerebroHive marketing/product website.

## What's in here

CerebroHive positions itself as an AI Automation / AI Consulting / AI Education business operating four divisions — **Consulting**, **Automation**, **Academy**, and **Labs** — plus a planned SaaS product line (CerebroFlow, CerebroAgent, CerebroLearn, CerebroERP). This repository is not a single application; it's the company's working repo, containing:

- **`OPC/`** — Business planning documents: business model, branding plan, marketing plan, sales plan, products/services catalog, UI/UX design philosophy, website master plan, and a financial model spreadsheet.
- **`OPC/Decks/`** — Pitch decks and slide exports (investor pitch, company overview, sales deck, academy pitch) in PPTX/PDF/JPG form.
- **`OPC/cerebro-hive-website/`** — The actual product: a Next.js web application for the CerebroHive marketing site and product experience (see below).
- **`ENTERPRISE_POST/`** — Social/marketing post assets (images, a Word doc) used for enterprise-facing content.
- Top-level image files (`1.png`–`4.png`, `lgo.png`/`lgo.jpg`, brand animation/assets) — logo and brand asset files.

## Tech stack (website)

The website at `OPC/cerebro-hive-website` is built with:

- **Next.js 16** (App Router) with **React 19** and **TypeScript**
- **Tailwind CSS 4**
- **Framer Motion** for animation and **Three.js** (`@types/three`) for 3D/visual effects
- **lucide-react** for icons, **jsPDF** for client-side PDF generation
- **ESLint** (flat config) for linting

## Project structure (website)

```
OPC/cerebro-hive-website/
├── app/                  Next.js App Router pages/routes
│   ├── about, careers, community, contact, dashboard, learn
│   ├── academy/          Courses, learning paths, corporate programs, referrals
│   ├── products/         CerebroAgent, CerebroERP, CerebroFlow, CerebroLearn, CerebroOS
│   ├── services/         AI consulting, automation, development, data engineering, training
│   ├── solutions/        Industry/function solutions (CRM, ERP, HR, finance, marketing, sales, support)
│   ├── case-studies/     Published client case studies
│   ├── resources/        Blog, whitepapers, templates, AI tools directory
│   ├── tools/             AI readiness assessment, solution finder
│   └── api/               Route handlers for contact, leads, tickets, dashboard, academy, enterprise
├── components/           Home, layout (navbar, footer, chat widget), dashboard, resources components
├── data/db.json           Local JSON data store used by lib/db.ts
├── lib/                   db.ts (data access), pdfReport.ts (PDF generation), translations.ts (i18n)
├── docs/                  Copies of the products/services/solutions planning docs
└── public/                Static assets
```

## Setup & run (website)

From `OPC/cerebro-hive-website/`, using the scripts defined in `package.json`:

```bash
npm install       # install dependencies
npm run dev       # start the Next.js dev server (http://localhost:3000)
npm run build     # production build
npm run start     # run the production build
npm run lint      # run ESLint
```

## Notes

- The business documents in `OPC/*.md` describe CerebroHive's target divisions, pricing, and product roadmap (CerebroFlow, CerebroAgent, CerebroLearn, CerebroERP) — several of these products are marked as planned/in-development rather than shipped.
- No build tooling exists at the repository root; only the `OPC/cerebro-hive-website` subproject is a runnable application.
