# CerebroHive — UI/UX Design Philosophy

> **Rule Zero:** Every page is a revenue conversion event, not a display exercise.
> Design is the silent salesperson. It must communicate authority, precision, and technological maturity — before a single word is read.

---

## 1. Foundational Philosophy

### The Core Principle: Dark Intelligence

CerebroHive is an AI automation company selling to enterprise buyers and technical decision-makers. The design language must communicate:

- **Precision** — measured spacing, structured grids, consistent type hierarchy
- **Authority** — deep dark background, restrained use of colour, neon accents used purposefully
- **Intelligence** — hexagonal motifs (hive), neural glow effects, crisp monospaced code aesthetics
- **Trustworthiness** — no visual noise, no cheap gradients, no crowded UI

The aesthetic is best described as **Dark Intelligence Design**: the visual language of high-end SaaS platforms, defence-grade dashboards, and elite AI research interfaces — not a startup blog or a design portfolio.

### What This Is NOT

| Avoid | Reason |
|---|---|
| Bright white or light backgrounds | Undermines the premium dark-tech identity |
| Generic gradients (blue→purple as decoration) | Must earn meaning — only used on brand text and CTAs |
| Dense walls of text | Every section must breathe |
| Tailwind utility classes for layout | Fragile with v4; use inline styles + CSS design tokens |
| Emojis in UI | Breaks the serious, technical brand voice |
| Bootstrap-style cards | Use `card-glass` with glassmorphism exclusively |
| Animation for its own sake | Every animation must communicate state or guide attention |

---

## 2. Technology Constraints

| Layer | Decision |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | **Inline styles + CSS custom properties (globals.css)** — not Tailwind utilities |
| Layout system | `container-wide` CSS class + inline `display: grid` |
| Fonts | Google Fonts via Next.js `localFont`: Orbitron, Exo 2, JetBrains Mono |
| Icons | Lucide React — consistent stroke weight, not filled icons |
| Animation | CSS keyframes (`@keyframes`) + inline `transition` — no Framer Motion yet |

### Why Inline Styles Over Tailwind

Tailwind v4 uses a content-scan compilation model. During development, arbitrary utility classes like `pt-36`, `gap-12`, `text-[#00E5FF]` may silently fail to generate if they appear in dynamic contexts. All layout values must use **inline CSS styles** referencing **CSS custom properties** from `globals.css`. This is non-negotiable for correctness.

---

## 3. Colour System

All colours are defined as CSS custom properties in `app/globals.css` and must be referenced exclusively through `var()`.

### Background Scale

```css
--bg-primary:    #080B14;   /* Page background — almost-black blue-black */
--bg-secondary:  #0D1221;   /* Elevated surfaces, nav dropdowns */
--bg-card:       #111827;   /* Card base before glass effects */
--bg-glass:      rgba(255, 255, 255, 0.04); /* Glass surface fill */
```

### Brand Accent Colours

```css
--neural-blue:   #00E5FF;   /* PRIMARY — cyan electric; CTAs, links, active states */
--violet:        #7B61FF;   /* SECONDARY — blue-violet; Academy, alt CTAs */
--hot-pink:      #FF2ED1;   /* TERTIARY — used on Marketing & Academy paths */
--amber:         #FFBA00;   /* HIGHLIGHT — awards, certifications, gold tiers */
--hive-orange:   #FF8A00;   /* ACCENT — Data, Automation vertical colour */
```

### Colour Assignment by Section

| Section | Primary Colour | Rationale |
|---|---|---|
| Solutions / Services | `--neural-blue` (#00E5FF) | Trust, technology, precision |
| Academy / Learning | `--violet` (#7B61FF) | Knowledge, creativity, depth |
| Marketing / Growth | `--hot-pink` (#FF2ED1) | Energy, velocity, ambition |
| Data / Automation | `--hive-orange` (#FF8A00) | Power, processing, urgency |
| Certifications / Awards | `--amber` (#FFBA00) | Achievement, value, gold |

### Text Scale

```css
--text-primary:  #F5F7FA;   /* Main body and headings */
--text-muted:    #8892A4;   /* Subheadings, descriptions, labels */
--text-dim:      #4B5563;   /* Placeholders, inactive states */
```

### Border Scale

```css
--border-glass:  rgba(255, 255, 255, 0.08);  /* Default card borders */
--border-blue:   rgba(0, 229, 255, 0.2);     /* Active/highlighted borders */
--border-violet: rgba(123, 97, 255, 0.2);    /* Academy section borders */
```

### Glow Values (for `box-shadow`)

```css
--glow-blue:   0 0 20px rgba(0,229,255,0.35), 0 0 60px rgba(0,229,255,0.1);
--glow-violet: 0 0 20px rgba(123,97,255,0.35), 0 0 60px rgba(123,97,255,0.1);
--glow-orange: 0 0 20px rgba(255,138,0,0.35), 0 0 60px rgba(255,138,0,0.1);
--glow-pink:   0 0 20px rgba(255,46,209,0.35), 0 0 60px rgba(255,46,209,0.1);
```

---

## 4. Typography System

### Font Roles

| Font | CSS Variable | Role | Usage |
|---|---|---|---|
| **Orbitron** | `var(--font-orbitron)` | Display / Technical | All `h1`–`h6`, section labels, card titles, buttons, badges |
| **Exo 2** | `var(--font-exo)` | Body / Readable | Paragraphs, descriptions, labels, list items |
| **JetBrains Mono** | `var(--font-mono)` | Code / Data | Metric values, terminal blocks, code samples |

### Heading Scale

```
h1 — clamp(2.5rem, 5vw, 3.5rem)  — Page hero titles
h2 — 1.5rem – 1.75rem             — Section headers
h3 — 1.05rem – 1.2rem             — Card titles
h4 — 0.85rem – 0.95rem            — Feature item titles
```

All headings: `font-family: Orbitron`, `font-weight: 700`, `color: var(--text-primary)`, `line-height: 1.2`

### Body Scale

```
Primary body:  1.05rem – 1.1rem,  Exo 2,  color: var(--text-muted),  line-height: 1.7
Card desc:     0.875rem,           Exo 2,  color: var(--text-muted),  line-height: 1.6
Labels/captions: 0.75rem – 0.8rem, Exo 2, color: var(--text-muted)
```

### Gradient Text Classes

```css
.gradient-text-full        /* Blue → Violet → Orange  — primary brand statement */
.gradient-text-blue-violet /* Blue → Violet             — Academy, alternate CTA */
.gradient-text-orange      /* Amber → Orange            — Data / pricing emphasis */
```

**Rule:** Only `<span>` inside an `<h1>` or `<h2>` should use gradient text. Never on body copy.

---

## 5. Spacing & Layout

### Layout Container

```css
.container-wide {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;      /* 16px on mobile */
}
```

**All pages use `.container-wide`**. Never define a custom max-width inside a page. Never break out of the container except for full-bleed background effects.

### Section Spacing

```css
.section-pad    { padding: 100px 0; }   /* Standard section */
.section-pad-sm { padding: 60px 0; }    /* Compact section */
```

### Page Hero Pattern

Every index page follows this exact structure:

```jsx
<section style={{ paddingTop: "140px", paddingBottom: "50px", position: "relative", overflow: "hidden" }}>
  {/* Radial glow background */}
  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(0,229,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
  <div className="container-wide" style={{ position: "relative" }}>
    <div className="section-label"><Icon size={11} /> Label Text</div>
    <h1>Main Title <span className="gradient-text-full">Emphasis</span></h1>
    <p>Subtitle — max 600px wide, Exo 2, var(--text-muted)</p>
  </div>
</section>
```

`paddingTop: "140px"` = 72px navbar + 68px breathing room. **Never use `pt-36` Tailwind on page root containers.**

### Grid System (Inline)

```jsx
/* 3-column card grid */
style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}

/* 2-column card grid */
style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}

/* 2-column asymmetric content layout */
style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "60px", alignItems: "center" }}

/* 4-column metrics row */
style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}
```

---

## 6. Component Library

All components are defined in `app/globals.css` and composed via `className`. Never re-implement their styles inline.

### `card-glass`

The universal surface for all card-based content.

```css
background: rgba(255, 255, 255, 0.03);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 16px;
backdrop-filter: blur(12px);
transition: all 0.35s ease;

/* Hover */
background: rgba(255, 255, 255, 0.055);
border-color: rgba(0, 229, 255, 0.2);
transform: translateY(-4px);
box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(0,229,255,0.1);
```

**Padding rule:** Use `padding: "36px 30px"` for standard cards, `padding: "24px"` for compact metric cards, `padding: "40px"` for large panel cards, `padding: "48px"` for hero-level CTA blocks.

### `section-label`

The eyebrow pill badge above page titles and section headers.

```css
font-family: Orbitron, 0.7rem, 600, letter-spacing: 0.2em, UPPERCASE
color: var(--neural-blue)
background: rgba(0,229,255,0.08)
border: 1px solid rgba(0,229,255,0.2)
border-radius: 100px; padding: 6px 14px;
```

For violet-tinted sections (Academy), override inline:
```jsx
style={{ color: "var(--violet)", background: "rgba(123,97,255,0.08)", borderColor: "rgba(123,97,255,0.2)" }}
```

### Buttons

| Class | Use case | Style |
|---|---|---|
| `.btn-primary` | Primary CTA — "Book Call", "Start Free", "Explore" | Gradient fill: blue→violet, dark text, glow shadow |
| `.btn-ghost` | Secondary CTA — "Learn More", "View Docs" | Transparent, neural-blue border and text |
| `.btn-orange` | Upgrade/pricing CTA | Gradient fill: amber→orange |

**Never style buttons inline.** Use the class. Add `style={{ gap: "6px", justifyContent: "center" }}` for icon alignment only.

### `neon-divider`

Section separators — a 1px gradient line from transparent through blue/violet to transparent.

```jsx
<div className="neon-divider" />
```

### Glassmorphism Variants

```css
.glass       /* Default — white glass for overlays */
.glass-blue  /* Blue-tinted — highlighted info blocks */
.glass-violet /* Violet-tinted — Academy panels */
```

### Badge / Tag Pattern

For card metadata labels (not the `section-label` pill):
```jsx
style={{
  fontSize: "0.6rem",
  fontFamily: "Orbitron, sans-serif",
  fontWeight: 700,
  color: "var(--text-muted)",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  padding: "3px 10px",
  borderRadius: "100px",
  textTransform: "uppercase"
}}
```

For coloured status badges (e.g. "GA — Live", "Beta", "Coming Soon"):
```jsx
style={{
  color: prod.available ? prod.color : "var(--text-muted)",
  background: prod.available ? `${prod.color}14` : "rgba(255,255,255,0.03)",
  border: `1px solid ${prod.available ? prod.color + "40" : "rgba(255,255,255,0.06)"}`,
}}
```

---

## 7. Page Architecture Patterns

Every index page follows one of two canonical structures:

### Pattern A — Directory Page (Solutions, Services)

```
Hero (section-label + h1 + subtitle + radial bg)
  ↓
Card Grid (3-col or 2-col, card-glass, icon + tag + title + desc + "Explore →")
  ↓
Feature/CTA Block (2-col asymmetric, content + glass panel with btn-primary)
  ↓
Supporting Grid (3-col trust items: checkmark + title + desc)
```

### Pattern B — Hub Page (Academy, Products)

```
Hero (section-label + h1 + subtitle + coloured radial bg)
  ↓
Metrics Row (4-col or 3-col stats, card-glass, Orbitron metric value)
  ↓
Category Grid (3-col or 2-col, card-glass, icon + tag + title + desc + bullets + "Explore →")
  ↓
Interactive Block (card-glass 48px padding, input/quiz/calculator/form)
```

### Pattern C — Detail/Feature Page (Solutions subpages)

```
Back link (← Back to [parent])
Hero (section-label + h1 + subtitle)
  ↓
Metrics Row (3-col stats)
  ↓
Core Showcase (1.2fr / 1fr grid: feature list left, glass CTA panel right)
```

---

## 8. Navbar

- `position: fixed`, `top: 0`, `width: 100%`, `height: 72px`
- `background: rgba(8,11,20,0.85)`, `backdrop-filter: blur(16px)`
- `border-bottom: 1px solid var(--border-glass)`
- `z-index: 1000`
- **Logo:** `Orbitron 700` + `#00E5FF` accent colour
- **Nav links:** `Exo 2 600`, `var(--text-muted)`, hover → `var(--text-primary)`, `0.3s transition`
- **CTA button:** `.btn-primary` in navbar, compact padding

### Navbar Offset Rule

The `<main>` element in `layout.tsx` has `style={{ paddingTop: "72px" }}` applied globally. All page content containers should then add their own internal top padding (typically `paddingTop: "140px"` for hero sections) — **never** rely on Tailwind's `pt-*` classes for this.

---

## 9. Backgrounds & Atmospheric Effects

### Page Radial Glows

Every page hero section gets a radial gradient background glow:

```jsx
/* Default (blue) */
background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(0,229,255,0.05) 0%, transparent 70%)"

/* Academy / Violet */
background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(123,97,255,0.06) 0%, transparent 70%)"
```

### Grid Overlay Pattern

For pages with a technical/dashboard feel:

```jsx
style={{
  background: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
  backgroundSize: "32px 32px"
}}
```

### Ambient Blob Glows

Soft, blurred radial blobs placed at `position: absolute` behind content:

```jsx
<div style={{ position: "absolute", top: "25%", left: "33%", width: "384px", height: "384px", background: "rgba(0,229,255,0.05)", borderRadius: "50%", filter: "blur(130px)", pointerEvents: "none" }} />
```

### Hexagonal Background (`hex-pattern`)

Used on hero sections and section backgrounds. Defines the hive motif:

```css
.hex-pattern {
  background-image:
    radial-gradient(circle at 50% 50%, rgba(0,229,255,0.03) 0%, transparent 60%),
    url("data:image/svg+xml, ... hexagon SVG stroke ... ");
  background-size: 56px 100px;
}
```

---

## 10. Animation Rules

| Effect | CSS Class / Approach | When to Use |
|---|---|---|
| Card hover lift | `card-glass:hover { transform: translateY(-4px) }` | All clickable cards |
| Button hover lift | `.btn-primary:hover { transform: translateY(-2px) }` | All action buttons |
| Pulse glow | `.animate-pulse-glow` | Status indicators, hero icons |
| Float | `.animate-float` | Decorative visual elements in hero |
| Scrollbar | Custom `::webkit-scrollbar` with neural-blue thumb | Global |

### Timing Standards

```
Micro-interactions:   0.2s ease       (hover, focus, button states)
Card transitions:     0.35s ease      (card-glass hover)
Page-level:          0.3s ease        (nav links, dropdown)
Float animation:      6s ease-in-out  (hero decorative elements)
Pulse animation:      3s ease-in-out  (status dots, glows)
```

**Rule:** No animation on text itself. No `animate-bounce`. No `animate-spin` on non-loading elements.

---

## 11. Card Inner Anatomy

Every `card-glass` card follows this internal structure:

```
┌─────────────────────────────────┐
│  [Icon Box 44×44]    [Tag pill] │  ← Row: space-between
├─────────────────────────────────┤
│  h3 — Card Title                │  ← Orbitron 700, 1.05rem, mb:12px
│  p — Description (Exo 2)        │  ← text-muted, 0.875rem, line-height 1.6
├─────────────────────────────────┤
│  ● Bullet item 1                │  ← Optional feature list (with CheckCircle/›)
│  ● Bullet item 2                │
├─────────────────────────────────┤
│  Explore → (colour: icon.color) │  ← Always at bottom, flex-end, marginTop: auto
└─────────────────────────────────┘
```

Icon Box styling:
```jsx
style={{ width: 44, height: 44, borderRadius: "10px", background: `${color}14`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}
```

---

## 12. Metrics / Stat Blocks

Used immediately after the hero section on detail and hub pages.

```jsx
<div className="card-glass" style={{ padding: "24px", textAlign: "center" }}>
  <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--neural-blue)", marginBottom: "6px" }}>{value}</div>
  <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)" }}>{label}</div>
</div>
```

- Metric value: **Orbitron 800**, `1.5rem` – `2.2rem`, brand colour
- Metric label: **Exo 2**, `0.8rem`, `var(--text-muted)`
- Optional sub-label: **Exo 2**, `0.75rem`, `var(--text-muted)`

---

## 13. Interactive Elements

### Input Fields

```jsx
style={{
  padding: "12px 16px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "var(--text-primary)",
  fontFamily: "Exo 2, sans-serif",
  fontSize: "0.9rem",
  outline: "none",
}}
```

### Range Sliders

```jsx
style={{ width: "100%", height: "4px", accentColor: "var(--neural-blue)", cursor: "pointer" }}
```

### Segmented Control / Toggle Buttons

```jsx
/* Active state */
background: "rgba(0,229,255,0.1)", border: "1px solid var(--neural-blue)", color: "var(--neural-blue)"

/* Inactive state */
background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "var(--text-muted)"
```

---

## 14. Writing Style (UI Copy)

| Element | Rule |
|---|---|
| Page titles | Noun phrase + gradient emphasis word. E.g. "AI Solutions **Directory**", "CerebroHive **Academy**" |
| Section labels | All-caps, max 3 words, factual descriptor. E.g. "ENTERPRISE BLUEPRINTS", "CERTIFIED L&D ECOSYSTEM" |
| Card titles | Title Case, product-feature descriptive |
| Card descriptions | 1–2 sentences, active verbs, no buzzwords. Specific and credible. |
| CTAs | Action verbs: "Explore", "Begin", "Request", "Validate", "Join". Never "Click here". |
| Bullet items | Start with a noun or capability, not a verb. E.g. "LangGraph pipeline builder" not "Build LangGraph pipelines" |
| Metric values | Lead with the number. E.g. "70% ticket deflection" not "We deflect 70% of tickets" |

---

## 15. Responsive Rules

```css
/* Container narrows */
@media (max-width: 768px) {
  .section-pad    { padding: 60px 0; }
  .container-wide { padding: 0 16px; }
}
```

Grid columns collapse:
- 3-col → 1-col on mobile: `gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"`
- 2-col asymmetric → stacked: wrap into `flex-direction: column` or single column grid

**No horizontal scrolling allowed on any breakpoint.**

---

## 16. Accessibility Checklist

- [ ] All interactive elements have unique `id` attributes
- [ ] All `<img>` elements have descriptive `alt` text
- [ ] Colour contrast: text `#F5F7FA` on `#080B14` = **16:1** ✓
- [ ] Colour contrast: `var(--text-muted)` `#8892A4` on `#080B14` = **5.1:1** ✓ (AA)
- [ ] Focus states: inputs must show visible focus ring (override with `outline: "1px solid var(--neural-blue)"`)
- [ ] Interactive buttons: always `cursor: pointer`
- [ ] Links used for navigation, buttons used for actions — never swapped

---

## 17. File Organization

```
app/
├── globals.css              ← Single source of truth for all design tokens
├── layout.tsx               ← Navbar + Footer + main offset (paddingTop: "72px")
│
├── solutions/page.tsx       ← Reference implementation — canonical page pattern
├── services/page.tsx        ← Pattern A (Directory)
├── academy/page.tsx         ← Pattern B (Hub)
├── products/page.tsx        ← Pattern B (Hub)
│
├── components/
│   ├── Navbar.tsx           ← Fixed glassmorphic navigation
│   ├── Footer.tsx           ← Standard footer
│   └── CerebroChat.tsx      ← AI chat widget overlay
```

**The `solutions/page.tsx` file is the canonical reference implementation.** When in doubt about how to structure a new page, copy its pattern exactly.

---

## 18. Quick Reference Card

```
Background:    #080B14
Primary:       #00E5FF  (neural-blue)
Secondary:     #7B61FF  (violet)
Text:          #F5F7FA  (primary) / #8892A4 (muted)
Card:          card-glass (borderRadius: 16px, glass border)
Heading font:  Orbitron 700
Body font:     Exo 2
Code font:     JetBrains Mono
Container:     max-width 1280px, padding 0 24px
Section:       padding 100px 0
Hero:          paddingTop 140px, paddingBottom 50px
Grid gap:      20px (standard)
Card padding:  36px 30px (standard) / 24px (compact) / 48px (hero CTA)
Transition:    0.35s ease (cards), 0.3s ease (nav), 0.2s ease (micro)
Border:        rgba(255,255,255,0.08) → rgba(0,229,255,0.2) on hover
```

---

*Last updated: June 2026 — CerebroHive Frontend Team*
*Reference implementation: `app/solutions/page.tsx` and `app/solutions/customer-support-ai/page.tsx`*
