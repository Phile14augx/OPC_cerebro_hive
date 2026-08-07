# CerebroHive Website — Codebase Documentation

> Last updated: July 2026  
> Tech stack: Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS v4 · Framer Motion · Three.js

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Repository Structure](#3-repository-structure)
4. [Architecture](#4-architecture)
5. [Design System](#5-design-system)
6. [Routing & Pages](#6-routing--pages)
7. [Component Library](#7-component-library)
8. [Data Layer](#8-data-layer)
9. [Content System (MDX)](#9-content-system-mdx)
10. [API Routes](#10-api-routes)
11. [Motion System](#11-motion-system)
12. [Providers & Global Context](#12-providers--global-context)
13. [Analytics](#13-analytics)
14. [Internationalization](#14-internationalization)
15. [PDF Report Generation](#15-pdf-report-generation)
16. [SEO & Metadata](#16-seo--metadata)
17. [Deployment](#17-deployment)
18. [Developer Scripts & Tooling](#18-developer-scripts--tooling)
19. [Testing](#19-testing)
20. [Audit System](#20-audit-system)
21. [Environment Variables](#21-environment-variables)
22. [Naming Conventions & Patterns](#22-naming-conventions--patterns)

---

## 1. Project Overview

CerebroHive is an enterprise AI consulting company. This repository is the public-facing marketing and platform website (`cerebro-hive.com`). It covers:

- Service and solution marketing pages
- Industry-specific AI use-case content
- 16 software products / proprietary frameworks
- An AI Academy with courses, learning paths, and corporate programs
- Research publications and thought-leadership insights
- An enterprise client dashboard (gated, demo-seeded)
- An AI readiness assessment tool and solution finder
- A built-in AI chat assistant (CerebroChat)

The site is a **fully static export** — no server runtime is required in production. API routes use `force-static` and write to a local JSON file (`data/db.json`) during build/dev, not in production hosting.

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.9 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS v4 | 4.x |
| Animation | Framer Motion | 12.x |
| Animation | GSAP | 3.15 |
| Smooth Scroll | Lenis | 1.3 |
| 3D Graphics | Three.js + @react-three/fiber | 0.184 / 9.6 |
| 3D Post-processing | @react-three/postprocessing | 3.0 |
| Flow Diagrams | @xyflow/react | 12.11 |
| Graph Layout | dagre / elkjs | — |
| MDX | next-mdx-remote + gray-matter | 6.0 / 4.0 |
| Theming | next-themes | 0.4 |
| Icons | lucide-react | 1.24 |
| CSS utility | clsx + tailwind-merge | — |
| PDF | jsPDF | 4.2 |
| Image export | html-to-image | 1.11 |
| Testing | Playwright | 1.61 |
| Bundler analysis | @next/bundle-analyzer | — |
| Code transforms | ts-morph | 28.0 |

**Fonts (Google Fonts via next/font):**
- `Space Grotesk` — headings, brand labels (`--font-space`)
- `Inter` — body copy (`--font-inter`)
- `IBM Plex Mono` — code, data displays (`--font-plex`)
- `JetBrains Mono` — technical / terminal contexts (`--font-jetbrains`)

---

## 3. Repository Structure

```
cerebro-hive-website/
├── app/                        # Next.js App Router (pages + API routes)
│   ├── layout.tsx              # Root layout — fonts, providers, Navbar, Footer, CerebroChat
│   ├── page.tsx                # Homepage (v3)
│   ├── globals.css             # Base reset + CSS class utilities + animations
│   ├── theme/                  # CSS custom property design tokens
│   │   ├── colors.css          # Palette + light/dark theme tokens
│   │   ├── typography.css      # Type scale, weight, spacing tokens
│   │   ├── elevation.css       # Shadows, blur, radius tokens
│   │   ├── motion.css          # Duration, easing, transition tokens
│   │   ├── charts.css          # Chart-specific tokens
│   │   └── icons.css           # Icon sizing tokens
│   └── [routes]/               # All pages (see §6)
│
├── components/                 # UI components, organized by domain
│   ├── layout/                 # Navbar, Footer, CerebroChat, LanguageContext
│   ├── ui/                     # Primitive/shared UI components
│   ├── motion/                 # Motion system (MotionProvider + primitives)
│   ├── providers/              # ThemeProvider
│   ├── home/                   # Homepage sections (v1 legacy, v2 legacy, v3 current)
│   ├── company/                # Company page sections (v3 current)
│   ├── services/               # Services page sections
│   ├── solutions/              # Solutions page sections
│   ├── industries/             # Industries page sections + engine
│   ├── products/               # Products page sections (v2 current)
│   ├── research/               # Research page sections (v2 current)
│   ├── insights/               # Insights page sections (v2 current)
│   ├── resources/              # Resources page sections
│   ├── architecture/           # Architecture diagram canvas components
│   └── dashboard/              # Dashboard sections
│
├── lib/                        # Shared utilities and data
│   ├── utils.ts                # cn() helper, withBasePath()
│   ├── db.ts                   # JSON file-based database (CRUD API)
│   ├── mdx.ts                  # MDX file reader + frontmatter parser
│   ├── motion.ts               # Shared Framer Motion variant presets
│   ├── translations.ts         # i18n strings (en / es / de)
│   ├── pdfReport.ts            # jsPDF report generation utilities
│   ├── analytics/              # AnalyticsAdapter (pluggable)
│   ├── content/company/        # Company static data (careers, leadership, values, etc.)
│   ├── content/research/       # Research publication data + types
│   ├── data/industries/        # 15 industry data objects + types
│   ├── data/products/          # 16 product/framework data objects + types
│   ├── data/solutions/         # 12 solution data objects + types
│   └── services/               # organizationService.ts
│
├── content/                    # MDX/Markdown content files
│   ├── research/               # Research papers
│   ├── insights/               # Blog/insight articles
│   ├── case-studies/           # Case study documents
│   ├── tutorials/              # Tutorial articles
│   ├── whitepapers/            # Whitepapers
│   ├── architecture/           # Architecture write-ups
│   └── engineering/            # Engineering articles
│
├── data/
│   └── db.json                 # Runtime JSON database (seeded on first run)
│
├── public/                     # Static assets
│   ├── images/                 # All image assets
│   ├── downloads/              # Downloadable PDFs/assets
│   └── .htaccess               # Apache rewrite rules for static hosting
│
├── scripts/                    # Developer tooling
│   ├── audit/                  # 8-script enterprise audit suite
│   ├── scaffold/               # Page scaffolding scripts
│   ├── generate-handbook-pdf.js
│   ├── generate_company_data.js
│   ├── cleanup-theme.js
│   ├── codemod-theme.ts
│   ├── start-dev.ps1/.bat
│   ├── start-prod.ps1/.bat
│   └── stop-server.ps1/.bat
│
├── tests/
│   ├── visual/                 # Playwright visual regression test snapshots
│   └── visual.spec.ts          # E2E visual test suite
│
├── audit/                      # Audit output files (generated by scripts/audit/)
│   ├── executive-dashboard.md
│   ├── accessibility-audit.csv
│   ├── seo-audit.csv
│   ├── analytics-audit.csv
│   ├── route-coverage-matrix.csv
│   ├── interaction-inventory.csv
│   ├── download-assets-audit.csv
│   └── scores.json
│
├── docs/                       # Business/strategy documentation
│   └── [12 domain folders]     # Company playbook, services, frameworks, etc.
│
├── next.config.ts              # Next.js config (static export, basePath, bundle analyzer)
├── tsconfig.json               # TypeScript config (strict, @/* path alias)
├── eslint.config.mjs           # ESLint config
├── postcss.config.mjs          # PostCSS (Tailwind v4)
├── playwright.config.ts        # Playwright E2E config
└── .env.example                # Environment variable template
```

---

## 4. Architecture

### Static Export Model

The entire site builds to a static HTML/CSS/JS output via `next build` with `output: "export"`. This means:

- No Node.js server runs in production
- API routes are `force-static` — they execute at build time and write static JSON responses
- The runtime "database" (`data/db.json`) is only used in development (`next dev`)
- Deployed to either FTP hosting or GitHub Pages

### App Router

All pages use the Next.js App Router (`app/` directory). Server Components are the default; components that need browser APIs or interactivity are marked `"use client"`.

### Path Alias

`@/*` maps to the project root. Example: `@/components/ui/AnimatedButton` → `./components/ui/AnimatedButton.tsx`.

### Data Flow

```
lib/data/[domain]/    ← typed static data objects (products, solutions, industries)
lib/content/[domain]/ ← typed static data objects (company content, research)
content/[domain]/     ← MDX files (articles, research papers, case studies)
data/db.json          ← JSON "database" for leads, contacts, enrollments (dev only)

app/[route]/page.tsx  ← page imports from lib/data or reads MDX via lib/mdx.ts
components/[domain]/  ← purely presentational, receive data as props
```

---

## 5. Design System

### Two Themes

| Theme | Class | Target Audience |
|---|---|---|
| Executive Blueprint | `:root` (default / light) | Enterprise executives, formal contexts |
| Mission Control | `.dark` | Technical users, night environments |

Themes switch via `next-themes`. The `<ThemeProvider>` wraps the entire app. A `<ThemeToggle>` component appears in the Navbar.

### Token Architecture (3-Layer)

**Layer 1 — Base Palette** (`app/theme/colors.css`)
Raw color values: `--color-slate-50` through `--color-obsidian-950`, brand emerald/blue/neon.

**Layer 2 — Theme Semantic Tokens** (also in `colors.css`)
Map semantics to palette: `--bg-page`, `--text-primary`, `--border-default`, `--btn-primary-bg`, etc. Defined for `:root` (light) and `.dark`.

**Layer 3 — Tailwind v4 `@theme` bridge** (bottom of `colors.css`)
Exposes CSS variables as Tailwind utility classes: `bg-background`, `text-text-primary`, `border-border`, `text-primary-accent`, etc.

### Theme Files

| File | Contents |
|---|---|
| `colors.css` | Full palette + light/dark semantic tokens + Tailwind bridge |
| `typography.css` | Font size scale, weights, line heights, letter spacing |
| `elevation.css` | Box shadows, blur values, border radii |
| `motion.css` | Duration, easing, transition timing tokens |
| `charts.css` | Data visualization color tokens |
| `icons.css` | Icon size tokens |

### Reusable CSS Classes (defined in `globals.css`)

| Class | Usage |
|---|---|
| `.theme-card` | Standard content card with hover lift + glow |
| `.theme-panel` | Elevated surface (modals, sidebars) |
| `.theme-glass` | Frosted glass / backdrop blur surface |
| `.theme-button-primary` | Primary CTA button base styles |
| `.font-space` / `.font-inter` / `.font-plex` / `.font-jetbrains` | Font family helpers |
| `.container-wide` | Standard max-width layout container |

### Keyframe Animations (defined in `globals.css`)

- `scrollLeft` / `scrollRight` — infinite marquee ticker
- `shimmer` — loading skeleton shimmer
- `dash` — animated SVG stroke dash
- `glowDim` — pulsing glow effect
- `dataFlow` — horizontal data packet animation
- `floatIcon` — gentle vertical float

---

## 6. Routing & Pages

All routes live under `app/`. Dynamic segments use `[slug]` or `[category]/[slug]` patterns and resolve via `lib/data/` lookup functions.

### Static Pages

| Route | Description |
|---|---|
| `/` | Homepage (v3) — 11 sections |
| `/about` | About CerebroHive |
| `/contact` | Contact form + HQ details |
| `/careers` | Open roles |
| `/community` | Community hub |
| `/handbook` | Internal/public company handbook |
| `/learn` | Learning overview |
| `/dashboard` | Enterprise client dashboard (auth-gated) |
| `/enterprise/dashboard` | Enterprise-tier dashboard view |

### Services (5 sub-pages)

| Route | Service |
|---|---|
| `/services` | Services overview |
| `/services/ai-consulting` | AI strategy & consulting |
| `/services/ai-automation` | Workflow automation |
| `/services/ai-development` | Custom AI development |
| `/services/data-engineering` | Data pipelines & infrastructure |
| `/services/corporate-training` | Enterprise AI training |

### Solutions (dynamic)

| Route | Description |
|---|---|
| `/solutions` | Solutions marketplace overview |
| `/solutions/[slug]` | Individual solution pages (12 solutions) |

Solutions registry (`lib/data/solutions/index.ts`): Enterprise AI, AI Agents, RAG, Document AI, Knowledge Management, Hyperautomation, Decision Intelligence, Predictive Analytics, Customer Experience, ERP Modernization, Cloud Modernization, AI Governance.

### Industries (dynamic)

| Route | Description |
|---|---|
| `/industries` | Interactive industry explorer |
| `/industries/[slug]` | Individual industry pages (15 industries) |

Industries: Finance, Manufacturing, Healthcare, Retail, Government, Insurance, Energy, Construction, Real Estate, Logistics, Education, Telecom, Technology, Media, Services.

### Products/Platform (dynamic)

| Route | Description |
|---|---|
| `/products` | Product ecosystem overview |
| `/products/[slug]` | Individual product pages (16 products) |

**Software Platforms (6):** Quantiva ERP, Cerebro AI Enterprise, AgentOS, Automation Studio, Knowledge Hub, Cerebro Analytics.

**Proprietary Frameworks (10):** CerebroSphere, HiveMatrix, NeuroFlow, SynapseX, AgentForge, Quantiva Integration Framework, CortexOps, HiveScore, DecisionDNA, AI Value Canvas.

### Research

| Route | Description |
|---|---|
| `/research` | Research hub |
| `/research/[category]/[slug]` | Individual research papers |

### Academy

| Route | Description |
|---|---|
| `/academy` | Academy homepage |
| `/academy/courses` | Course catalog |
| `/academy/learning-paths` | Learning path explorer |
| `/academy/corporate-programs` | Enterprise training programs |
| `/academy/referral` | Referral program |

### Insights

| Route | Description |
|---|---|
| `/insights` | Intelligence hub (market watch, trends, analysis) |

### Resources

| Route | Description |
|---|---|
| `/resources` | Resources hub |
| `/resources/blog` | Blog articles |
| `/resources/whitepapers` | Whitepaper downloads |
| `/resources/templates` | Template library |
| `/resources/ai-tools-directory` | AI tools directory |

### Case Studies

| Route | Description |
|---|---|
| `/case-studies` | Case study index |
| `/case-studies/sales-pipeline-automation` | Sales pipeline automation |
| `/case-studies/logistics-support-automation` | Logistics support automation |
| `/case-studies/corporate-ai-training` | Corporate AI training |

### Tools

| Route | Description |
|---|---|
| `/tools/ai-readiness` | AI Readiness Assessment tool (generates PDF report) |
| `/tools/solution-finder` | Interactive solution recommender |

### Legal

| Route |
|---|
| `/legal/privacy` |
| `/legal/terms` |
| `/legal/security` |
| `/legal/ai-ethics` |

---

## 7. Component Library

Components are organized into domain folders matching the page they primarily serve. Each domain has evolved through versions — only the latest version is used in production routes.

### Layout Components (`components/layout/`)

| Component | Role |
|---|---|
| `Navbar.tsx` | Fixed top nav with scroll-hide behavior, mobile drawer, ThemeToggle, "Book Strategy Session" CTA |
| `Footer.tsx` | Full-width footer with newsletter signup, site map links |
| `CerebroChat.tsx` | Global AI chat assistant widget (floating button + drawer) |
| `LanguageContext.tsx` | React context providing locale state and translation access |

**Navbar behavior:** Hides on scroll down (past 80px), reappears on scroll up — implemented with Framer Motion `useScroll` + `useMotionValueEvent`.

### UI Primitives (`components/ui/`)

| Component | Description |
|---|---|
| `AnimatedButton.tsx` | Primary/secondary/ghost button variants with motion |
| `GlassCard.tsx` | Frosted glass card primitive |
| `Logo.tsx` | CerebroHive SVG logo |
| `ThemeToggle.tsx` | Light/dark mode toggle |
| `SectionHeading.tsx` | Standardized section title + subtitle |
| `SectionMetadata.tsx` | Eyebrow label + metadata chip row |
| `MetricChip.tsx` | KPI display chip |
| `PrincipleBadge.tsx` | Labeled badge with icon |
| `NeuralOrb/` | Animated neural orb visual |
| `BackgroundEngine.tsx` | Generative background renderer |
| `TrackedButton.tsx` | AnimatedButton + analytics tracking |
| `TrackedLink.tsx` | Next/Link + analytics tracking |
| `backgrounds/ExecutiveBlueprint.tsx` | Light-mode background pattern |
| `backgrounds/MissionControl.tsx` | Dark-mode background pattern |

### Motion System (`components/motion/`)

See [§11 Motion System](#11-motion-system) for details.

| Component | Description |
|---|---|
| `foundation/MotionProvider.tsx` | Context provider for motion level + theme-aware variants |
| `primitives/AnimatedConnector.tsx` | SVG animated connection line |
| `primitives/DataPacket.tsx` | Animated data flow particle |
| `primitives/HoverCard.tsx` | Card with hover motion preset |
| `primitives/IntelligentOrb.tsx` | Pulsing intelligence orb |
| `primitives/PulseRing.tsx` | Expanding pulse ring |

### Homepage Components (`components/home/v3/`) — Current

| Component | Description |
|---|---|
| `HomeHero.tsx` | Hero section with headline, CTA, animated background |
| `EnterpriseDashboard.tsx` | Live-looking dashboard preview |
| `BusinessChallenges.tsx` | Pain point carousel |
| `EnterpriseSimulator.tsx` | Interactive AI workflow simulator |
| `LivingDigitalTwin.tsx` | Animated digital twin visualization |
| `LivingArchitecture.tsx` | Architecture diagram animation |
| `IntegratedPlatform.tsx` | Platform integration ecosystem view |
| `ResearchHighlights.tsx` | Research publication preview |
| `HumanProof.tsx` | Social proof / testimonials |
| `EnterpriseReadiness.tsx` | Readiness checklist / trust signals |
| `TransformationRoadmap.tsx` | Transformation journey visualization |

> `components/home/v1/` and `components/home/v2/` are legacy and not used in current routes.

### Company Components (`components/company/v3/`) — Current

| Component | Description |
|---|---|
| `CompanyHero.tsx` | Company page hero |
| `OriginStory.tsx` | Founding narrative |
| `LivingTimeline.tsx` | Animated company timeline |
| `WhyCerebroHive.tsx` | Value proposition |
| `HowWeThink.tsx` | Philosophy section |
| `OperatingPhilosophy.tsx` | Operating principles |
| `EngineeringPrinciples.tsx` | Engineering culture values |
| `EngineeringCulture.tsx` | Engineering team culture section |
| `TeamExpertise.tsx` | Expertise domains |
| `GlobalOperatingModel.tsx` | Global delivery model |
| `InnovationFlywheel.tsx` | Innovation loop visualization |
| `EnterpriseManifesto.tsx` | Company manifesto |
| `EnterpriseProof.tsx` | Client proof points |
| `FounderPerspective.tsx` | Founder message / perspective |
| `ResponsibleAI.tsx` | AI ethics and governance stance |
| `CompanyRoadmap.tsx` | Forward-looking product roadmap |
| `CompanyCTA.tsx` | Company page call to action |
| `CompanySidebarV3.tsx` | In-page navigation sidebar |

### Industries Engine (`components/industries/engine/`)

The industries system uses a renderer pattern — all 15 industry pages are served by a single dynamic route with a shared renderer.

| Component | Description |
|---|---|
| `IndustryRenderer.tsx` | Top-level renderer dispatching to sub-components |
| `IndustryHero.tsx` | Industry-specific hero |
| `ChallengeExplorer.tsx` | Industry pain point explorer |
| `AIOpportunityMap.tsx` | AI use case opportunity map |
| `AgentEcosystem.tsx` | AI agent deployment ecosystem |
| `ArchitectureViewer.tsx` | Reference architecture diagram |
| `SolutionExplorer.tsx` | Relevant solutions for this industry |
| `IndustryMaturity.tsx` | AI maturity assessment |
| `ComplianceEngine.tsx` / `ComplianceCenter.tsx` | Compliance and regulatory view |
| `TransformationJourney.tsx` | Step-by-step transformation path |
| `IndustryERPIntegration.tsx` | ERP integration visualization |
| `EnterpriseDigitalTwin.tsx` | Digital twin for the industry |
| `IndustryTopology.tsx` | Network topology visualization |
| `Metrics.tsx` | Industry-specific KPIs |

### Architecture Canvas (`components/architecture/`)

| Component | Description |
|---|---|
| `ArchitectureCanvas.tsx` | Main @xyflow/react canvas for architecture diagrams |
| `ArchitectureNode.tsx` | Custom node renderer |
| `AnimatedEdge.tsx` | Animated edge with data flow effect |

### Dashboard Components (`components/dashboard/`)

| Component | Description |
|---|---|
| `AuthGate.tsx` | Authentication gate wrapper |
| `FreeTierDashboard.tsx` | Demo client dashboard with projects, invoices, documents, team |

---

## 8. Data Layer

### Static Data (TypeScript modules in `lib/data/`)

All data objects are pure TypeScript — no database or API calls at runtime. They are imported directly by page components and route handlers.

**Products** (`lib/data/products/`): 16 entries. Each product file exports a typed object with `slug`, `name`, `tagline`, `description`, `features`, `category`, and metadata. The index re-exports two arrays: `softwarePlatformsData` (6) and `proprietaryFrameworksData` (10), plus `getProductBySlug(slug)`.

**Solutions** (`lib/data/solutions/`): 12 entries. Each solution has `slug`, `name`, `description`, `outcomes`, `industries`, `products`, and related metadata. Exported via `solutionsData` array and `getSolutionBySlug(slug)`.

**Industries** (`lib/data/industries/`): 15 entries. Each industry has `slug`, `name`, `tier`, `challenges`, `aiOpportunities`, `complianceRequirements`, and solution mappings. Exported via `industriesData` array and `getIndustryBySlug(slug)` and `getIndustriesByTier(tier)`.

**Company content** (`lib/content/company/`): Static data for careers listings, leadership team, company values, timeline milestones, metrics, news, offices, partners, trust center credentials, engineering culture.

### JSON File Database (`lib/db.ts`)

A lightweight file-based CRUD store used during `next dev`. At build time (`next build`), API routes with `force-static` execute once to pre-render their JSON response.

**Collections:**

| Collection | Schema Summary |
|---|---|
| `projects` | id, name, progress, status, lastUpdate, milestones[] |
| `invoices` | id, description, amount, status, date |
| `documents` | id, name, type, size, date |
| `employees` | id, name, email, course, progress, score, certified, lastActive |
| `tickets` | id, subject, message, status, date |
| `leads` | id, name, email, company, type, target, score, inputs, createdAt |
| `enrollments` | id, email, courseSlug, createdAt |
| `contacts` | id, name, email, subject, message, createdAt |

**Public API:**

```typescript
getDb(): Promise<DatabaseSchema>
saveDb(data: DatabaseSchema): Promise<void>
getCollection(collectionName): Promise<Collection>
insertItem(collectionName, item): Promise<NewItem>
updateItem(collectionName, id, updates): Promise<UpdatedItem | null>
deleteItem(collectionName, id): Promise<boolean>
```

Concurrency is handled by a simple async write lock (`isWriting` flag + polling loop). The database is seeded on first access with demo data (projects, invoices, documents, employees).

---

## 9. Content System (MDX)

Long-form content lives in the `content/` directory as `.mdx` or `.md` files with YAML frontmatter. Rendered via `next-mdx-remote`.

### Content Directories

| Directory | Content Type |
|---|---|
| `content/research/` | AI research papers |
| `content/insights/` | Blog posts, market intelligence |
| `content/case-studies/` | Client case study narratives |
| `content/tutorials/` | How-to guides and tutorials |
| `content/whitepapers/` | In-depth whitepapers |
| `content/architecture/` | Architecture reference documents |
| `content/engineering/` | Engineering articles |

### Frontmatter Schema (`lib/mdx.ts` — `MDXMetadata`)

```typescript
type MDXMetadata = {
  title: string;
  description: string;
  publishedAt: string;   // ISO date string
  author: string;
  tags?: string[];
  slug: string;          // auto-derived from file path
};
```

### MDX Utilities

```typescript
getFiles(dir: string): Promise<string[]>           // recursively find .md/.mdx files
getPostBySlug(dir, slug): Promise<{metadata, content}> // fetch single post
getAllPosts(dir): Promise<MDXMetadata[]>            // fetch all, sorted by publishedAt desc
```

---

## 10. API Routes

All API routes are under `app/api/` and use `export const dynamic = "force-static"`, which means they execute at build time and their output is embedded as static JSON.

| Route | Method | Description |
|---|---|---|
| `/api/contact` | POST | Records contact form submissions to `contacts` collection |
| `/api/dashboard` | GET | Returns projects, invoices, documents for client dashboard |
| `/api/leads` | POST/GET | Stores lead captures (AI readiness, solution finder) |
| `/api/tickets` | POST | Creates support tickets |
| `/api/academy/enroll` | POST | Enrolls a user in a course |
| `/api/enterprise/employees` | GET/POST | Employee training records for enterprise dashboard |

**Note on static export:** In production, form submissions (contact, leads, enrollments) do not persist to a live database. For production lead capture, integrate a backend service or form endpoint (e.g., Formspree, a serverless function, or the planned `NEXT_PUBLIC_API_URL` backend).

---

## 11. Motion System

The motion system provides a unified, theme-aware, accessibility-respecting animation layer.

### MotionProvider

`components/motion/foundation/MotionProvider.tsx` wraps the app and exposes:

```typescript
interface MotionContextValue {
  level: MotionLevel;          // "reduced" | "balanced" | "immersive"
  setLevel: (level) => void;
  getVariant: (component, intent) => Variants;  // theme-aware Framer Motion variants
}
```

**Behavior:**
- Defaults to `"immersive"` level
- Automatically drops to `"reduced"` if `prefers-reduced-motion: reduce` is detected
- `"reduced"` level strips all transforms, leaving only opacity transitions with zero duration
- `getVariant()` reads from `motionRegistry` and branches by `resolvedTheme` ("dark" | "light")

### Shared Motion Presets (`lib/motion.ts`)

Ready-to-use Framer Motion `Variants` objects:

| Preset | Effect |
|---|---|
| `stagger` | Container that stagger-animates children with 0.1s delay |
| `fadeUp` | Fade in + translate Y from 20px, 0.6s |
| `reveal` | Fade in + scale from 0.96, 0.7s |
| `hoverLift` | Hover: translate Y −4px |
| `cardGlow` | Hover: opacity 0→1 + scale 0.9→1 for glow overlay |

### Motion Primitives (`components/motion/primitives/`)

Reusable animated elements: `AnimatedConnector`, `DataPacket`, `HoverCard`, `IntelligentOrb`, `PulseRing`.

---

## 12. Providers & Global Context

The root layout (`app/layout.tsx`) composes providers in this order:

```
MotionProvider
  └── ThemeProvider (next-themes, attribute="class", defaultTheme="system")
        └── LanguageProvider
              ├── Navbar
              ├── main (page content)
              ├── Footer
              └── CerebroChat
```

### ThemeProvider

Thin wrapper around `next-themes` `ThemeProvider`. Suppresses a known React 19 console warning about script tags injected by next-themes.

### LanguageProvider

Provides locale state (`en` | `es` | `de`) and a `t()` translation function to any child. Components access it via `useLanguage()` hook. Strings are defined in `lib/translations.ts`.

### CerebroChat

Globally mounted AI chat assistant widget. Features:
- Floating toggle button (bottom-right)
- Slide-in drawer with message history
- Pre-built suggested prompts: AI Roadmap, Modernize ERP, Build AI Agents, Generate Proposal, ROI Estimator
- Navigator tabs: AI Strategy, AI Agents, Enterprise Platforms, Cloud, Data Engineering
- Command mode (prefix with `/`)
- Simulated AI response generation with streaming-style animation
- Tab panel rendering for Architecture, Workflow, Security, Deployment views

---

## 13. Analytics

`lib/analytics/AnalyticsAdapter.ts` provides a generic analytics interface designed for easy swapping of analytics providers.

```typescript
class AnalyticsAdapter {
  init(): void           // call once at app startup
  track(event): void     // fire named event with metadata
  pageView(url): void    // fire page view
}

export const analytics = new AnalyticsAdapter();
```

In development, events are logged to the console. In production, uncomment the relevant lines to wire to PostHog, Google Analytics, or Segment.

**TrackedButton / TrackedLink** (`components/ui/`) wrap standard UI components and automatically call `analytics.track()` on interaction.

**Environment variable:** `NEXT_PUBLIC_POSTHOG_KEY` — set to enable PostHog.

---

## 14. Internationalization

`lib/translations.ts` exports a `translations` object with three locales: `en`, `es`, `de`.

**Covered namespaces:**
- `nav` — navigation labels and dropdown items
- `footer` — footer labels, newsletter text, legal links
- `chat` — CerebroChat strings

Usage:
```typescript
const { locale } = useLanguage();
const t = translations[locale];
t.nav.services  // → "Services" (en) | "Servicios" (es) | "Dienstleistungen" (de)
```

The `<LanguageProvider>` exposes a language switcher. Adding a new locale requires adding entries to `translations.ts` and the `Locale` type.

---

## 15. PDF Report Generation

`lib/pdfReport.ts` uses `jsPDF` to generate branded PDF reports from the AI Readiness Assessment tool (`/tools/ai-readiness`).

The report renders:
- Branded header banner with CerebroHive logo and accent bar
- Personalized lead information (name, email, company)
- Dimension scores (radar chart-style data)
- Recommendations and next steps

Helper functions: `drawPageHeader()`, `hexToRgb()`. The report is generated client-side and downloaded directly to the user's browser without server involvement.

---

## 16. SEO & Metadata

### Global Metadata (`app/layout.tsx`)

Set via Next.js `Metadata` API:
- `title.template`: `"%s | CerebroHive"` — all pages inherit this suffix
- `description`, `keywords`, `authors`
- `openGraph`: type, locale, url, siteName
- `twitter`: card type, title, description
- `robots`: `index: true, follow: true`

### Per-Page Metadata

Each `page.tsx` exports its own `metadata` object or `generateMetadata` function that overrides the global title and description.

### Sitemap

`app/sitemap.ts` — exports a `sitemap()` function returning all 25 priority URLs with `lastModified`, `changeFrequency`, and `priority` values. Resolves to `/sitemap.xml` at build time.

### Robots

`app/robots.ts` — allows all routes, disallows `/private/`, `/api/`, `/_next/`. References the sitemap URL.

---

## 17. Deployment

### Build

```bash
npm run build        # Produces static output in /out
npm run analyze      # Build with bundle analyzer (ANALYZE=true)
```

### Deployment Targets

The site supports two deployment targets, controlled by environment variables at build time:

**FTP Hosting (default / production)**
```bash
# No special env vars needed
npm run build
# Upload /out to web host root
```

**GitHub Pages**
```bash
GITHUB_ACTIONS=true npm run build
# basePath becomes /OPC_cerebro_hive
# assetPrefix becomes /OPC_cerebro_hive/
```

The `next.config.ts` logic:
```typescript
const isGithubPages = process.env.GITHUB_ACTIONS === "true" 
  && process.env.IS_FTP_DEPLOY !== "true";
const basePath = isGithubPages ? `/OPC_cerebro_hive` : "";
```

`NEXT_PUBLIC_BASE_PATH` is injected so client code can prepend it to CSS `url()` asset references using `withBasePath()` from `lib/utils.ts`.

### Static Assets

The `/out` directory also includes:
- `.htaccess` — Apache rewrite rules for clean URLs on shared hosting
- `sitemap.xml`, `robots.txt` — generated at build time

### Dev Server

```bash
npm run dev            # Standard Next.js dev server on :3000
# OR via PowerShell scripts:
.\scripts\start-dev.ps1
.\scripts\start-prod.ps1
.\scripts\stop-server.ps1
```

Equivalent `.bat` files are provided for Windows Command Prompt.

---

## 18. Developer Scripts & Tooling

### NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Static build to `/out` |
| `npm run start` | Start production server (requires build) |
| `npm run lint` | Run ESLint |
| `npm run analyze` | Build + open bundle analyzer |
| `npm run test:e2e` | Run Playwright tests |
| `npm run audit:enterprise` | Run all 8 audit scripts + generate dashboard |

### Scaffold Scripts (`scripts/scaffold/`)

Scripts for quickly generating new page/component boilerplate:
- `scaffold.js` — Generic page scaffold
- `scaffold_products.js` — Product page scaffold
- `scaffold_research.js` — Research page scaffold
- `scaffold_solutions.js` — Solution page scaffold

Root-level PowerShell scaffolds for specific sections:
- `scaffold_company_v3.ps1`
- `scaffold_home_v3.ps1`
- `scaffold_insights.ps1`
- `scaffold_research.ps1`

### Theme Migration Scripts

| Script | Description |
|---|---|
| `scripts/cleanup-theme.js` | Removes legacy/deprecated CSS class usage |
| `scripts/codemod-theme.ts` | ts-morph AST codemod for bulk token migration |
| `refactor_theme.ts` | Root-level theme refactor runner |

### Other Scripts

| Script | Description |
|---|---|
| `scripts/generate-handbook-pdf.js` | Generates company handbook as downloadable PDF |
| `scripts/generate_company_data.js` | Generates/refreshes company data files |
| `scripts/fix_padding.ps1` | Bulk fix for padding class naming |

---

## 19. Testing

### Playwright E2E + Visual Regression

Configuration: `playwright.config.ts`

**Test matrix (5 browser/device configs):**
- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

**Settings:**
- Base URL: `http://localhost:3000`
- Screenshot on failure only
- Trace on first retry
- Max pixel diff for visual snapshots: 100px

**Run:**
```bash
npm run test:e2e
# or directly:
npx playwright test
```

Test files live in `tests/visual/`. Snapshot baselines are stored alongside tests. The `webServer` config auto-starts `next dev` if not already running.

---

## 20. Audit System

`npm run audit:enterprise` runs 8 TypeScript audit scripts via `tsx` that analyze the built output and source files, then generate a consolidated dashboard.

### Audit Scripts (`scripts/audit/`)

| Script | What It Checks |
|---|---|
| `audit-routes.ts` | All page routes exist and return 200, no broken internal links |
| `audit-interactions.ts` | CTAs, buttons, and links inventoried with analytics tracking status |
| `audit-assets.ts` | Downloads and public assets accessible and valid |
| `audit-accessibility.ts` | WCAG 2.1 AA compliance (alt text, aria-labels, color contrast) |
| `audit-seo.ts` | Per-page metadata coverage (title, description, OG tags) |
| `audit-analytics.ts` | Analytics event coverage on interactive elements |
| `audit-design-system.ts` | CSS token parity — legacy tokens vs. design system tokens |
| `generate-dashboard.ts` | Aggregates all audit outputs into `audit/executive-dashboard.md` |

### Audit Output (`audit/`)

- `executive-dashboard.md` — Overall scores + prioritized remediation roadmap
- `scores.json` — Machine-readable score data for CI integration
- `*.csv` files — Per-category audit details

**Current scores (as of last run):**

| Category | Score |
|---|---|
| Navigation Coverage | 100% ✅ |
| Route Integrity | 100% ✅ |
| Accessibility | 92% ✅ |
| SEO Readiness | 22% ❌ |
| Analytics Coverage | 0% ❌ |
| Design System Token Parity | 0% ⚠️ |
| Downloads/Assets | 100% ✅ |

**Overall Enterprise Score: 64.3/100**

Priority remediations: implement `<TrackedButton>`/`<TrackedLink>` site-wide, add `generateMetadata` to ~78% of pages missing it.

---

## 21. Environment Variables

Defined in `.env.example`:

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_POSTHOG_KEY` | (empty) | PostHog analytics project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://app.posthog.com` | PostHog host URL |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api/v1` | Future backend API base URL |
| `NODE_ENV` | `development` | Node environment |
| `GITHUB_ACTIONS` | (CI-set) | Enables GitHub Pages build mode |
| `IS_FTP_DEPLOY` | (manually set) | Forces FTP mode even in GitHub Actions |
| `ANALYZE` | (manually set) | Enables bundle analyzer on build |
| `NEXT_PUBLIC_BASE_PATH` | (auto-set by next.config.ts) | BasePath for asset URLs |

---

## 22. Naming Conventions & Patterns

### File Naming
- Components: `PascalCase.tsx` (e.g., `HomeHero.tsx`)
- Utilities/libs: `camelCase.ts` (e.g., `utils.ts`, `pdfReport.ts`)
- Data files: `kebab-case.ts` (e.g., `quantiva-erp.ts`, `enterprise-ai.ts`)
- CSS files: `kebab-case.css`

### Component Versioning
Historical component generations are preserved in subdirectories:
- `components/home/v1/` — original implementation (unused)
- `components/home/v2/` — second iteration (unused)
- `components/home/v3/` — current production version
- Same pattern for `company/v3/`, `products/v2/`, `research/v2/`, `insights/v2/`

Do not delete old versions without confirming they are not imported anywhere.

### Data Object Pattern
Every data object in `lib/data/` exports a `const` with a `slug` field. The index file for each domain exports:
1. A typed array of all objects
2. A `getBySlug(slug)` lookup function

### Client Components
Any component using browser APIs, React hooks with side effects, or Framer Motion animations must have `"use client"` as the first line.

### CSS Utility Pattern
Use the `cn()` helper from `lib/utils.ts` (wraps `clsx` + `tailwind-merge`) for all conditional class name construction. Never use string concatenation for Tailwind classes.

```typescript
import { cn } from "@/lib/utils";
className={cn("base-class", condition && "conditional-class", props.className)}
```

### Asset URL Pattern
For assets referenced in CSS `url()` or JS string paths (not in `<Image src>`), use `withBasePath()`:

```typescript
import { withBasePath } from "@/lib/utils";
const bgUrl = withBasePath("/images/hero-bg.svg");
```

This ensures the correct path prefix is applied for both FTP and GitHub Pages deployments.
