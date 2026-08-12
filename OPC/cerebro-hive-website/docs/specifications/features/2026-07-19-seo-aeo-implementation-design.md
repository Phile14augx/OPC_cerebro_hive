# CerebroHive Discovery Architecture — SEO + AEO Platform-Wide Design
**Date:** 2026-07-19  
**Revised:** 2026-07-19 (v4 — naming consistency; /products vs /platform distinction; AI Context Layer added)  
**Status:** Approved  
**Canonical domain:** `https://cerebropchive.org`  
**Scope:** Full-stack discoverability architecture across the CerebroHive ecosystem — search engines, AI answer engines, internal search, platform navigation, and AI assistant context

---

## Goals

1. Achieve technical SEO parity across all existing pages (structured data, canonical URLs, OG images, sitemap, robots)
2. Maximize discoverability in AI answer engines (ChatGPT, Gemini, Claude, Perplexity, Google AI Overview) via FAQPage, Speakable, and entity-rich schema
3. Establish topical authority across Enterprise AI, AI Agents, Data Engineering, AI Governance, and 16 industry verticals
4. Treat HivePulse, Cerebro X, HiveMarketplace, HiveAcademy, and Developer Portal as first-class entities in the discovery model — architecture defined now, implementation phased
5. Generate all copy (FAQs, descriptions, use cases, AEO answer blocks) targeting real keyword clusters and citation-ready formats
6. Build the `lib/discovery` subsystem as the single source of truth for how the platform presents itself to search engines, AI assistants, and users

---

## Platform Architecture (Discovery Scope)

```
CerebroHive Ecosystem
│
├── /                    Website (consulting, marketing)
├── /services            Enterprise Services (10)
├── /industries          Industry Verticals (16)
│
├── /platform            Platform capabilities (AI Runtime, Knowledge, Infrastructure, Developer)
│                        ← What the platform CAN DO — capabilities, architecture, runtime
│
├── /products            Commercial software products (packaged tools)
│                        ← What you BUY / USE — discrete software offerings
│   ├── /products/hivepulse       ← HivePulse (Enterprise AI OS) — first-class entity
│   ├── /products/cerebro-x       ← Cerebro X (Enterprise AI Intelligence Platform) — first-class
│   └── /products/[existing 10]   ← Cerebro Archive, Studio, Flow, Insight, etc.
│
├── /academy             Learning & Certification (10 courses, 4 paths)
├── /research            AI Research & Briefings
├── /resources           Guides, Whitepapers, Templates
├── /developers          API, SDK, CLI, MCP, Changelog, OpenAPI
├── /marketplace         Agent & App Marketplace (architecture locked, impl deferred)
├── /case-studies        Project Case Studies
├── /about               Company, Team, EEAT
├── /contact             Contact & Assessment
└── /community           Developer Community
```

**`/platform` vs `/products` — Explicit Distinction**

| Section | Answers the question | Examples |
|---------|----------------------|---------|
| `/platform` | What does CerebroHive's platform DO? | AI Runtime, Knowledge Layer, Developer Tools, Infrastructure |
| `/products` | What can I buy or use? | HivePulse, Cerebro X, Cerebro Flow, Hive Shield |

Metadata, schemas, and internal linking must maintain this distinction. Platform capability pages get `WebApplication` schema; product pages get `SoftwareApplication` + `Product` + `Offer`.

---

## Naming: `lib/discovery`

The library is named **`lib/discovery`** — not `lib/seo`. SEO is one mechanism; the goal is platform discoverability across search engines, AI answer engines, internal search, and agent/LLM tool use. The name reflects that broader mandate.

```
lib/discovery/
  config.ts                  ← SITE_URL, buildUrl(), canonical helpers
  metadata/
    defaults.ts              ← Default title template, description, OG defaults
    builders.ts              ← generateMetadata() helpers per page type
  schemas/
    organization.ts          ← Organization + WebSite JSON-LD builders
    service.ts               ← Service schema builder
    software.ts              ← SoftwareApplication / WebApplication builder
    product.ts               ← Product + Offer + OfferCatalog builder
    article.ts               ← Article / TechArticle / BlogPosting builder
    course.ts                ← Course + CourseInstance + LearningResource builder
    credential.ts            ← EducationalOccupationalCredential builder
    faq.ts                   ← FAQPage schema builder
    breadcrumb.ts            ← BreadcrumbList schema builder
    person.ts                ← Person schema builder
    howto.ts                 ← HowTo schema builder
    dataset.ts               ← Dataset schema (research)
    collection.ts            ← CollectionPage schema (hubs)
    marketplace.ts           ← SoftwareApplication + Review + AggregateRating (marketplace-ready)
  entities/
    ai-core.ts               ← Enterprise AI, LLM, Generative AI, Foundation Models
    agents.ts                ← AI Agents, Autonomous Agents, Multi-Agent Systems, MCP
    rag.ts                   ← RAG, Vector Database, Embedding, Semantic Search
    governance.ts            ← AI Governance, AI Ethics, Responsible AI, Compliance
    engineering.ts           ← MLOps, DataOps, Data Engineering, Feature Store
    platform.ts              ← Enterprise AI Platform, AI OS, HivePulse, Cerebro X
    marketplace.ts           ← AI App Marketplace, Agent Marketplace, MCP Registry
  knowledge-graph/
    index.ts                 ← Entity relationship map
    types.ts                 ← Entity, EntityRef, KnowledgeGraphNode types
  sitemap/
    config.ts                ← Route registry, priority overrides, excluded paths
  robots/
    config.ts                ← User-agent rules, disallow patterns
  opengraph/
    variants.ts              ← OG image variant registry (1 per major route group)
  search/
    index.ts                 ← SearchAction config, universal search route map
  context/
    organization.ts          ← CerebroHive identity, mission, specializations
    products.ts              ← All products: HivePulse, Cerebro X, Cerebro *, Hive *
    services.ts              ← All 10 services with descriptions and deliverables
    industries.ts            ← All 16 industries with use cases
    technologies.ts          ← AI stack, integrations, supported models
    academy.ts               ← Courses, paths, certs
    capabilities.ts          ← Platform capability map
    glossary.ts              ← 50+ AI/ML terms in CerebroHive's language
    index.ts                 ← CEREBRO_CONTEXT unified export (AI memory)

components/discovery/
  JsonLd.tsx                 ← <script type="application/ld+json"> renderer
  Breadcrumbs.tsx            ← Visual nav + BreadcrumbList JSON-LD
  ArticleSchema.tsx          ← Article/TechArticle schema injector
  FaqSection.tsx             ← Reusable FAQ accordion + FAQPage schema
  AeoAnswerBlock.tsx         ← Structured answer block (TL;DR, Definition, Benefits, Steps)
  CourseSchema.tsx           ← Course + EducationalOccupationalCredential schema
  ProductSchema.tsx          ← SoftwareApplication + Offer schema

app/
  opengraph-image.tsx              ← Default OG image (1200×630)
  services/opengraph-image.tsx
  industries/opengraph-image.tsx
  products/opengraph-image.tsx
  academy/opengraph-image.tsx
  research/opengraph-image.tsx
  developers/opengraph-image.tsx
  marketplace/opengraph-image.tsx  ← Ready for marketplace launch
  layout.tsx                 ← metadataBase + Organization + WebSite schemas
  sitemap.ts                 ← Imports lib/discovery/sitemap/config.ts
  robots.ts                  ← Imports lib/discovery/robots/config.ts
```

---

## First-Class Entities: HivePulse & Cerebro X

These are not deferred. Defined in `lib/discovery/entities/platform.ts` from Wave 1; their product pages get full schema treatment in Wave 5 regardless of product launch status.

**Naming model (internally consistent across all schemas, titles, and messaging):**
- **HivePulse** = Enterprise AI Operating System — the operational layer. Deploys, manages, and orchestrates AI agents, workflows, and the enterprise knowledge graph.
- **Cerebro X** = Enterprise AI Intelligence Platform — the intelligence layer. Powers intelligent search, reasoning, knowledge graph management, and contextual AI across the enterprise.

These are complementary, not competing. HivePulse *runs* on Cerebro X's intelligence layer.

### HivePulse — Enterprise AI Operating System

```ts
// lib/discovery/entities/platform.ts
export const ENTITY_HIVEPULSE = {
  name: 'HivePulse',
  alternateName: 'Enterprise AI Operating System',
  description: 'HivePulse is CerebroHive\'s Enterprise AI Operating System — deploy, manage, and orchestrate AI agents, intelligent workflows, and enterprise knowledge systems from a unified control plane.',
  url: 'https://cerebropchive.org/products/hivepulse',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Cloud, On-Premise, Hybrid',
};
```

**Schema:** `SoftwareApplication` + `WebApplication` + `Product` + `Offer` + `FAQPage`  
**SEO H1:** `HivePulse — Enterprise AI Operating System`  
**Meta (155 chars):** `HivePulse is CerebroHive's Enterprise AI OS. Deploy, manage, and orchestrate AI agents, workflows, and knowledge systems across your organization.`

---

### Cerebro X — Enterprise AI Intelligence Platform

```ts
export const ENTITY_CEREBRO_X = {
  name: 'Cerebro X',
  alternateName: 'Enterprise AI Intelligence Platform',
  description: 'Cerebro X is CerebroHive\'s intelligence layer — powering enterprise search, knowledge graph management, reasoning, and contextual AI across every product and workflow.',
  url: 'https://cerebropchive.org/products/cerebro-x',
  applicationCategory: 'BusinessApplication',
};
```

**Schema:** `SoftwareApplication` + `WebApplication` + `FAQPage` + `BreadcrumbList`  
**SEO H1:** `Cerebro X — Enterprise AI Intelligence Platform`  
**Meta:** `Cerebro X powers intelligent search, knowledge graph management, and contextual AI reasoning across the CerebroHive platform and your enterprise systems.`

---

## Marketplace Architecture (Implementation Deferred, Architecture Locked)

The schema architecture for the marketplace is defined now in `lib/discovery/schemas/marketplace.ts` and `lib/discovery/entities/marketplace.ts`. When the Marketplace launches, no structural refactoring is needed — only page components.

### Marketplace Schema Structure

```ts
// lib/discovery/schemas/marketplace.ts
export function buildMarketplaceItemSchema(item: MarketplaceItem) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: item.name,
    description: item.description,
    url: `https://cerebropchive.org/marketplace/${item.slug}`,
    applicationCategory: item.category,
    publisher: { '@type': 'Organization', name: item.publisher },
    offers: {
      '@type': 'Offer',
      price: item.price ?? '0',
      priceCurrency: item.currency ?? 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: item.rating ? {
      '@type': 'AggregateRating',
      ratingValue: item.rating,
      reviewCount: item.reviewCount,
    } : undefined,
    screenshot: item.screenshots,
    featureList: item.features,
    softwareVersion: item.version,
  };
}

// Categories ready for marketplace
export const MARKETPLACE_CATEGORIES = [
  'AI Agents', 'Workflow Templates', 'Data Connectors',
  'Knowledge Bases', 'Analytics Plugins', 'Security & Compliance',
  'Industry Solutions', 'Developer Tools', 'MCP Servers',
];
```

### Marketplace Entity

```ts
// lib/discovery/entities/marketplace.ts
export const ENTITY_HIVE_MARKETPLACE = {
  name: 'HiveMarketplace',
  description: 'The CerebroHive Marketplace for enterprise AI agents, workflow templates, MCP servers, and platform extensions.',
  url: 'https://cerebropchive.org/marketplace',
};
```

### Marketplace SEO Targets (when launched)

| Page | Schema | Title |
|------|--------|-------|
| /marketplace | ItemList + CollectionPage | Enterprise AI Agent & App Marketplace |
| /marketplace/[category] | ItemList | AI {Category} — CerebroHive Marketplace |
| /marketplace/[slug] | SoftwareApplication + Review | {App Name} — CerebroHive Marketplace |
| /marketplace/publishers | ItemList | Marketplace Publisher Directory |

---

## AI Context Layer (`lib/discovery/context/`)

The AI Context Layer is the "AI memory of CerebroHive" — a structured, machine-readable knowledge source that can be consumed by HiveAssistant, MCP tool servers, Claude, ChatGPT, Gemini, and any future AI integration without re-deriving facts from page content.

This is the missing link between the discovery system and AI-native interactions. It is defined as part of Wave 1 infrastructure.

```
lib/discovery/context/
  organization.ts    ← Who CerebroHive is (name, mission, capabilities, team, contact)
  products.ts        ← All products with structured descriptions, features, pricing model
  services.ts        ← All services with descriptions, deliverables, engagement models
  industries.ts      ← All 16 industries with use cases and CerebroHive's approach
  technologies.ts    ← Tech stack, frameworks, AI models supported, integrations
  academy.ts         ← All courses, paths, certifications, pricing
  research.ts        ← Research areas, published briefings, AI radar topics
  capabilities.ts    ← Platform capability map (AI Runtime, Knowledge, Infra, Developer)
  glossary.ts        ← Key AI/ML/platform terms defined in CerebroHive's own words
  index.ts           ← Unified context export: CEREBRO_CONTEXT (consumed by AI systems)
```

### How It Is Used

```ts
// Consumed by HiveAssistant (Cerebro Chat)
import { CEREBRO_CONTEXT } from '@/lib/discovery/context';

// Consumed by MCP tool server (future)
// GET /api/discovery/context → returns CEREBRO_CONTEXT as JSON

// Consumed by OG/metadata builders
import { CEREBRO_CONTEXT } from '@/lib/discovery/context';
const orgDescription = CEREBRO_CONTEXT.organization.description;

// Consumed by schema builders
import { CEREBRO_CONTEXT } from '@/lib/discovery/context';
const knowsAbout = CEREBRO_CONTEXT.capabilities.map(c => c.name);
```

### Context Structure (excerpt)

```ts
// lib/discovery/context/index.ts
export const CEREBRO_CONTEXT = {
  organization: {
    name: 'CerebroHive',
    legalName: 'CerebroHive OPC Pvt. Ltd.',
    mission: 'Architect, build, and deploy production-grade enterprise AI systems.',
    founded: 2023,
    headquarters: 'India',
    areaServed: 'Worldwide',
    specializations: ['Enterprise AI', 'AI Agents', 'RAG', 'Data Engineering', 'AI Governance'],
  },
  products: [...],       // All products including HivePulse, Cerebro X
  services: [...],       // All 10 services
  industries: [...],     // All 16 industries
  academy: {...},        // Courses, paths, certs
  technologies: [...],   // OpenAI, Claude, LangChain, pgvector, etc.
  glossary: {...},       // 50+ AI terms defined in CerebroHive's language
};
```

This single export is the source of truth that schemas, metadata builders, the chat assistant, and future MCP integrations all share. It eliminates the risk of AI systems giving inconsistent answers about what CerebroHive does.

---

## Wave 1 — Discovery Infrastructure (no new content required)

### 1.1 Canonical Domain Fix

**File:** `lib/discovery/config.ts`

```ts
export const SITE_URL = 'https://cerebropchive.org';
export const buildUrl = (path: string) => `${SITE_URL}${path}`;
```

Updates:
- `app/sitemap.ts` — replace `https://cerebro-hive.com` with `SITE_URL`
- `app/robots.ts` — update sitemap URL
- `app/products/[slug]/page.tsx` — fix `https://cerebrohive.com` in inline JSON-LD
- `app/layout.tsx` — add `metadataBase: new URL(SITE_URL)`

### 1.2 JsonLd Component

`components/discovery/JsonLd.tsx` — server component, renders `<script type="application/ld+json">`. Replaces all inline `dangerouslySetInnerHTML` JSON-LD blocks.

### 1.3 Root Schemas (every page)

**Organization:**
- name, url, logo, description, foundingDate, areaServed
- knowsAbout: [Enterprise AI, Generative AI, AI Agents, RAG, LLMs, Data Engineering, MLOps, AIOps, AI Governance, Knowledge Graphs, Vector Databases, MCP, HivePulse, Cerebro X]
- sameAs: social profile URLs (resolved from company data)
- contactPoint, hasCredential
- subOrganization: CerebroHive Academy (EducationalOrganization)

**WebSite:** potentialAction: SearchAction → `/search?q={search_term_string}`

### 1.4 OG Image System (8 variants)

Next.js `ImageResponse` (Edge runtime), 1200×630, dark brand background:
- Root: "Intelligence. Connection. Impact."
- Services: "Enterprise AI Services"
- Industries: "AI for Your Industry"
- Products: "Enterprise AI Software"
- Academy: "AI Education & Certification"
- Research: "AI Research & Intelligence"
- Developers: "Developer Platform & API"
- Marketplace: "AI Agent & App Marketplace" _(ready, renders on launch)_

### 1.5 Breadcrumb Component

`components/discovery/Breadcrumbs.tsx` — visual nav + `BreadcrumbList` JSON-LD.

### 1.6 AEO Answer Block Component

`components/discovery/AeoAnswerBlock.tsx`:

```tsx
interface AeoAnswerBlockProps {
  tldr: string;          // 40 words, citation-ready
  definition: string;    // 50 words — "What is X?"
  benefits: string[];    // 4-6 items
  steps?: string[];      // triggers HowTo schema injection
}
```

Applied to: homepage, all service, industry, product, guide, academy, and developer pages.

### 1.7 Entity Library (`lib/discovery/entities/`)

~55 semantic entities across 7 files. Includes HivePulse, Cerebro X, and HiveMarketplace as first-class entities from day one. Referenced in `about`, `mentions`, `knowsAbout` schema fields on all relevant pages.

### 1.8 AI Context Layer (`lib/discovery/context/`)

Populated in Wave 1 alongside the entity library. Exports `CEREBRO_CONTEXT` — the unified machine-readable knowledge source consumed by schema builders, metadata helpers, Cerebro Chat (HiveAssistant), and future MCP tool servers. See the AI Context Layer section above for full structure.

---

## Wave 2 — Homepage, About, Contact

### Homepage

- **Title:** `Enterprise AI Consulting & AI Agents | CerebroHive`
- **Description:** `CerebroHive architects enterprise AI systems, deploys intelligent agents, and transforms businesses through AI-native engineering. Trusted by global enterprises.`
- **New component:** `HomeFaq` (12 FAQs, 40–80 words each, AEO-optimized)
- **Schemas:** `FAQPage`, `AggregateRating`
- **AeoAnswerBlock:** inserted before FAQ section

### About

Person schemas for leadership. Organization EEAT fields. EEAT trust signals section.

### Contact

`ContactPoint` + `ProfessionalService` schema.

---

## Wave 3 — All 10 Service Pages

Each `lib/data/services/*.ts` adds an `seo` block:

```ts
seo: {
  title: string;
  metaDescription: string;
  h1: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  lsiTerms: string[];
  entities: EntityRef[];
  aeo: { tldr: string; definition: string; benefits: string[]; steps: string[] };
  faqs: Array<{ q: string; a: string }>; // 12 per service
}
```

Schemas per page: `Service` + `FAQPage` + `BreadcrumbList` + `HowTo`  
New component: `ServiceFaq`  
Updated: `app/services/[slug]/page.tsx`

| Slug | SEO H1 |
|------|--------|
| ai-strategy | Enterprise AI Strategy & Roadmapping Consulting |
| intelligence-modernization | AI Intelligence Modernization Services |
| autonomous-transformation | Autonomous AI Transformation for Enterprises |
| ai-platform-engineering | Enterprise AI Platform Engineering |
| knowledge-engineering | Knowledge Engineering & Knowledge Graph Consulting |
| ai-factory | AI Factory: Scalable AI Production Systems |
| coe | Enterprise AI Center of Excellence (CoE) |
| ai-governance | AI Governance, Risk & Compliance Consulting |
| aiops | AIOps: AI-Driven IT Operations & Automation |
| industry-accelerator | Industry-Specific AI Accelerator Programs |

---

## Wave 4 — All 16 Industry Pages

Each `lib/data/industries/*.ts` adds an `seo` block:

```ts
seo: {
  title: string;
  metaDescription: string;
  h1: string;
  entities: EntityRef[];
  aeo: { tldr: string; definition: string; benefits: string[] };
  faqs: Array<{ q: string; a: string }>;  // 10 per industry
  useCases: Array<{ title: string; description: string; roi: string }>;
  complianceNotes?: string;
}
```

New component: `IndustryFaq`. Updated: `IndustryRenderer`, `app/industries/[slug]/page.tsx`.

Industries: Healthcare, Finance, Manufacturing, Retail, Logistics, Insurance, Energy, Construction, Education, Telecom, Technology, Media, Government, Real Estate, Services, Real Estate.

---

## Wave 5 — Products & Platform (including HivePulse + Cerebro X)

### All Product Pages (`/products/[slug]`)

Replace inline JSON-LD with `ProductSchema` component. Fix domain. Add `FAQPage`, `BreadcrumbList`. Each `lib/data/products/*.ts` gets an `seo` block.

10 existing products + HivePulse + Cerebro X = **12 product pages** with full schema coverage.

**HivePulse page** (new or coming-soon):
- Schemas: `SoftwareApplication` + `WebApplication` + `Product` + `Offer` + `FAQPage`
- AeoAnswerBlock: "What is HivePulse?"
- 10 FAQs: What does HivePulse do, what integrations, pricing model, deployment options, etc.

**Cerebro X page** (new or coming-soon):
- Same schema stack
- AeoAnswerBlock: "What is Cerebro X?"

### Platform Pages (`/platform`, `/platform/[slug]`)

`WebApplication` + `SoftwareApplication` + `BreadcrumbList` + `FAQPage`.  
`featureList` from `lib/data/platform/capabilities.ts`.

---

## Wave 6 — Academy (Course & Certification Schemas)

Extract course data from `app/academy/page.tsx` into `lib/data/academy/courses.ts`.

**Academy hub:** `EducationalOrganization` + `OfferCatalog` + `FAQPage`  
**Each course:** `Course` + `CourseInstance` + `Offer` (10 courses)  
**Each certification:** `EducationalOccupationalCredential` (10 certs)  
**Learning paths:** `LearningResource` (4 paths)  
**New component:** `CourseSchema`

Academy metadata targets:

| Page | Title |
|------|-------|
| /academy | AI Certification Courses for Enterprise Teams \| CerebroHive |
| /academy/courses | AI Courses: LLM, RAG, Agents, Fine-Tuning \| CerebroHive Academy |
| /academy/learning-paths | AI Learning Paths: Developer, Architect, PM \| CerebroHive |
| /academy/corporate-programs | Corporate AI Training Programs for Teams \| CerebroHive |

---

## Wave 7 — Developer Portal (TechArticle & APIReference)

`TechArticle` schema on all developer pages. `SoftwareApplication` for the API itself.  
`HowTo` for step-by-step pages.

| Page | Schema | Title |
|------|--------|-------|
| /developers | TechArticle | Developer API, SDK & Documentation \| CerebroHive |
| /developers/api | TechArticle + APIReference | CerebroHive API Reference Documentation |
| /developers/architecture | TechArticle | Platform Architecture & Design Docs |
| /developers/changelog | TechArticle | API Changelog & Release Notes |
| /developers/releases | TechArticle | Platform Release History |
| /developers/roadmap | TechArticle | Developer Roadmap |

Developer portal entity (`lib/discovery/entities/platform.ts`):

```ts
export const ENTITY_DEVELOPER_PLATFORM = {
  name: 'CerebroHive Developer Platform',
  description: 'REST API, Python/TypeScript SDKs, MCP servers, CLI tools, and OpenAPI specification for building on CerebroHive.',
  url: 'https://cerebropchive.org/developers',
};
```

---

## Wave 8 — Research, Resources & Cornerstone Guides

**Research articles:** `Article` schema via `ArticleSchema` component  
**Resources hub:** `CollectionPage`  
**5 cornerstone guides** (`/resources/guides/[slug]`): `Article` + `HowTo` + `AeoAnswerBlock`

| Slug | Title | Words |
|------|-------|-------|
| enterprise-ai-transformation | The Complete Enterprise AI Transformation Guide | 5,000 |
| rag-architecture | RAG Architecture Handbook for Enterprises | 4,500 |
| ai-governance-framework | Enterprise AI Governance Framework | 4,000 |
| enterprise-ai-agents | Executive Guide to Enterprise AI Agents | 4,500 |
| data-engineering-playbook | Enterprise Data Engineering Playbook | 4,000 |

---

## Knowledge Graph (Cross-cutting)

`lib/discovery/knowledge-graph/index.ts` maps entities to pages:

```ts
{
  entity: ENTITY_RAG,
  relatedServices: ['knowledge-engineering', 'ai-platform-engineering'],
  relatedProducts: ['cerebro-research', 'cerebro-archive', 'hivepulse'],
  relatedIndustries: ['healthcare', 'finance'],
  relatedGuides: ['rag-architecture'],
  relatedCourses: ['RP-301'],
},
{
  entity: ENTITY_HIVEPULSE,
  relatedServices: ['ai-platform-engineering', 'ai-factory', 'autonomous-transformation'],
  relatedProducts: ['hivepulse', 'cerebro-x'],
  relatedIndustries: ['technology', 'finance', 'manufacturing'],
  relatedGuides: ['enterprise-ai-agents', 'enterprise-ai-transformation'],
},
```

---

## Non-Goals (out of scope for this implementation)

**Content production (separate initiative):**
- 300+ blog articles
- AI Glossary
- Video schema (no video content yet)
- International SEO / hreflang (English-only)

**Platform components (deferred to respective launch phases):**
- Marketplace page components (schema architecture locked here; UI deferred to marketplace launch)
- AI Playground
- Platform Shell documentation pages
- Universal search backend (SearchAction route registered; backend deferred)

**Operational infrastructure (separate initiative):**
- Analytics integration: GA4, PostHog, Search Console
- CMS / publishing workflow
- Discovery Dashboard (admin SEO operations console)
- Platform Search (Ctrl+K global search for HivePulse)

**Future evolution phases (architecture extensible, not yet needed):**
- `lib/discovery/recommendations/` — cross-entity recommendation engine
- `lib/discovery/registry/` — unified metadata registry per entity
- Schema versioning (v1/v2/v3)
- Discovery API (`/api/discovery`) — when internal/external consumers need it
- Three-layer separation: `lib/platform/`, `lib/content/` split from `lib/discovery/` (deferred until scale warrants it)

---

## Implementation Order

```
Wave 1 — Discovery Infrastructure
  lib/discovery/config.ts
  lib/discovery/context/*.ts         ← CEREBRO_CONTEXT (AI memory, MCP source)
  lib/discovery/entities/*.ts        ← includes HivePulse, Cerebro X, Marketplace
  lib/discovery/knowledge-graph/
  lib/discovery/schemas/*.ts         ← includes marketplace.ts (locked)
  lib/discovery/metadata/
  lib/discovery/sitemap/config.ts
  lib/discovery/robots/config.ts
  lib/discovery/search/index.ts
  components/discovery/JsonLd.tsx
  components/discovery/Breadcrumbs.tsx
  components/discovery/FaqSection.tsx
  components/discovery/AeoAnswerBlock.tsx
  app/opengraph-image.tsx (+ 7 route variants incl. marketplace)
  app/layout.tsx (metadataBase + root schemas)
  app/sitemap.ts → lib/discovery/sitemap/config.ts
  app/robots.ts → lib/discovery/robots/config.ts

Wave 2 — Homepage + About + Contact
  app/page.tsx (metadata + HomeFaq)
  components/home/v4-os/HomeFaq.tsx
  app/about/page.tsx
  app/contact/page.tsx

Wave 3 — 10 Service Pages
  lib/data/services/*.ts (seo blocks)
  components/services/ServiceFaq.tsx
  app/services/[slug]/page.tsx

Wave 4 — 16 Industry Pages
  lib/data/industries/*.ts (seo blocks)
  components/industries/engine/IndustryRenderer.tsx
  app/industries/[slug]/page.tsx

Wave 5 — Products & Platform (12 product pages incl. HivePulse + Cerebro X)
  components/discovery/ProductSchema.tsx
  lib/data/products/*.ts (seo blocks)
  app/products/hivepulse/page.tsx    ← new (first-class entity page)
  app/products/cerebro-x/page.tsx   ← new (first-class entity page)
  app/products/[slug]/page.tsx (replace inline JSON-LD)
  app/platform/page.tsx + app/platform/[slug]/page.tsx

Wave 6 — Academy
  lib/data/academy/courses.ts        ← extract from app/academy/page.tsx
  components/discovery/CourseSchema.tsx
  app/academy/layout.tsx
  app/academy/page.tsx
  app/academy/courses/page.tsx
  app/academy/learning-paths/page.tsx
  app/academy/corporate-programs/page.tsx

Wave 7 — Developer Portal
  app/developers/layout.tsx
  app/developers/api/page.tsx
  app/developers/architecture/page.tsx
  app/developers/changelog/page.tsx
  app/developers/releases/page.tsx

Wave 8 — Research + Resources + Guides
  components/discovery/ArticleSchema.tsx
  app/research/[slug]/[articleSlug]/page.tsx
  lib/data/guides/*.ts               ← 5 cornerstone guides content
  app/resources/guides/[slug]/page.tsx
  app/resources/page.tsx
```

---

## Schema Coverage Summary

| Schema Type | Applied To |
|-------------|-----------|
| Organization | Root layout (every page) |
| WebSite + SearchAction | Root layout (every page) |
| BreadcrumbList | All inner pages |
| FAQPage | Homepage, services, industries, products, academy, guides |
| AggregateRating | Homepage ProofOfImpact |
| Service | 10 service pages |
| SoftwareApplication | 12 product pages + platform + developers |
| WebApplication | Platform + HivePulse + Cerebro X |
| Product + Offer | All product pages |
| Course | 10 academy courses |
| CourseInstance | Academy courses |
| LearningResource | Academy learning paths |
| EducationalOccupationalCredential | 10 certifications |
| EducationalOrganization | Academy hub |
| Article | Research articles |
| TechArticle | Developer docs, architecture, API reference |
| HowTo | Guides, API quickstart, service methodology |
| Dataset | Research dataset pages |
| CollectionPage | Resources hub, research hub |
| Person | About page leadership |
| ContactPoint + ProfessionalService | Contact page |
| SoftwareApplication (Marketplace) | Architecture locked — components deferred |

---

## Success Criteria

- All pages pass Google Rich Results Test (FAQ, Breadcrumb, Organization, Course, SoftwareApplication schemas)
- Sitemap at `https://cerebropchive.org/sitemap.xml` — correct URLs across all platform routes
- Zero hardcoded `cerebro-hive.com` or `cerebrohive.com` in any schema, canonical, or OG tag
- Every page: unique keyword-targeted `<title>` and `<meta description>`
- Every page: route-specific `og:image`
- HivePulse and Cerebro X: indexed entity pages with full schema coverage
- Marketplace schema architecture: in `lib/discovery/schemas/marketplace.ts` and entity library
- Every service, industry, product, academy page: 8–12 FAQs with `FAQPage` schema
- Every major page: `AeoAnswerBlock` (TL;DR + definition + benefits)
- Academy: complete `Course` + `EducationalOccupationalCredential` schemas
- Developer pages: `TechArticle` schema
- Knowledge graph: entity relationships defined for all entities
- Core Web Vitals: unaffected
- TypeScript: zero build errors
