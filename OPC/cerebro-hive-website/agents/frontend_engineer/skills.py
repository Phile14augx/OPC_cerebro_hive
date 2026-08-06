"""Frontend Engineer agent skills — React, Next.js, TypeScript, accessibility, and performance."""
from __future__ import annotations
import json
from typing import Any, Optional
from pydantic import BaseModel, Field

try:
    from crewai.tools import BaseTool
except ImportError:
    class BaseTool:
        name: str = ""
        description: str = ""
        def run(self, **kwargs: Any) -> str: return self._run(**kwargs)
        def _run(self, **kwargs: Any) -> str: raise NotImplementedError

# ── Input Schemas ────────────────────────────────────────────────────────────

class ComponentInput(BaseModel):
    name: str = Field(..., description="Component name in PascalCase.")
    type: str = Field(default="feature", description="Type: page|layout|ui|feature.")
    props: Optional[str] = Field(None, description="Props with types (TypeScript interface style).")
    accessibility: bool = Field(default=True, description="Require full ARIA/WCAG support.")

class PageInput(BaseModel):
    route: str = Field(..., description="Next.js route path (e.g. /dashboard/tools).")
    render_strategy: str = Field(default="SSR", description="SSR|SSG|ISR|CSR.")
    auth_required: bool = Field(default=True, description="Whether page requires authentication.")

class DesignSystemInput(BaseModel):
    component: str = Field(..., description="Design system component to implement.")
    variant: Optional[str] = Field(None, description="Variant: primary|secondary|destructive|ghost.")
    size: str = Field(default="md", description="Size: sm|md|lg|xl.")

class APIHookInput(BaseModel):
    resource: str = Field(..., description="API resource name.")
    operations: str = Field(default="list,get,create,update,delete", description="CRUD operations.")
    auth_header: bool = Field(default=True, description="Include Authorization header.")

class StateInput(BaseModel):
    store_name: str = Field(..., description="State store name.")
    state_type: str = Field(default="zustand", description="State type: zustand|redux|context|query.")
    entities: str = Field(..., description="Entities managed by this store.")

class TestInput(BaseModel):
    component: str = Field(..., description="Component to test.")
    test_type: str = Field(default="unit", description="unit|integration|e2e|a11y|visual.")

class PerformanceInput(BaseModel):
    component: str = Field(..., description="Component or page to optimise.")
    metric: str = Field(default="LCP", description="Core Web Vital: LCP|CLS|INP|FCP|TTFB.")

class AnimationInput(BaseModel):
    element: str = Field(..., description="Element or component to animate.")
    type: str = Field(default="transition", description="Animation type: transition|keyframe|spring|gesture.")

# ── Skills ───────────────────────────────────────────────────────────────────

class FrontendEngineeringSkill(BaseTool):
    name: str = "frontend_engineering"
    description: str = "Design and implement production-ready frontend components with TypeScript."
    def _run(self, name: str, type: str = "feature", props: str = "", accessibility: bool = True) -> str:
        return json.dumps({
            "component": name, "type": type,
            "file": f"src/components/{type}/{name}/{name}.tsx",
            "template": f"""
'use client';
import {{ type FC }} from 'react';
interface {name}Props {{ {props or '// define props'} }}
export const {name}: FC<{name}Props> = (props) => {{
  return (
    <div role="region" aria-label="{name}">
      {{/* implementation */}}
    </div>
  );
}};
export default {name};
""",
            "checklist": ["Loading state", "Error boundary", "Empty state", "ARIA attributes", "Keyboard nav"],
        }, indent=2)

class ReactSkill(BaseTool):
    name: str = "react"
    description: str = "Build React components with hooks, compound components, and render optimisation."
    def _run(self, name: str, type: str = "feature", props: str = "", accessibility: bool = True) -> str:
        return json.dumps({
            "patterns": {
                "Hooks": "useState, useEffect, useCallback, useMemo, useRef — follow Rules of Hooks",
                "Compound": "Context + subcomponents for complex UI (Tabs, Accordion, Dialog)",
                "Memo": "React.memo on pure child components — only after profiler confirms renders",
                "Keys": "Stable unique keys on lists — never array index",
                "Effects": "Cleanup in useEffect return — clear timers, subscriptions, abort controllers",
            },
            "forbidden": ["Class components", "forceUpdate", "dangerouslySetInnerHTML without sanitisation"],
        }, indent=2)

class NextJSSkill(BaseTool):
    name: str = "nextjs"
    description: str = "Build Next.js App Router applications: pages, layouts, server components, and rendering strategies."
    def _run(self, route: str, render_strategy: str = "SSR", auth_required: bool = True) -> str:
        return json.dumps({
            "route": route,
            "render_strategy": render_strategy,
            "file_structure": {
                f"app{route}/page.tsx": f"Page component — {render_strategy}",
                f"app{route}/layout.tsx": "Layout — shared UI and metadata",
                f"app{route}/loading.tsx": "Suspense boundary skeleton",
                f"app{route}/error.tsx": "Error boundary component",
                f"app{route}/not-found.tsx": "404 component",
            },
            "metadata": f"""
export const metadata: Metadata = {{
  title: '{route.split("/")[-1].replace("-", " ").title()} | CerebroHive',
  description: 'Page description for SEO',
}};
""",
            "auth": "Use middleware.ts to redirect unauthenticated users before page render" if auth_required else "Public route",
        }, indent=2)

class TypeScriptSkill(BaseTool):
    name: str = "typescript"
    description: str = "Write strictly-typed TypeScript with no 'any', discriminated unions, and branded types."
    def _run(self, name: str, type: str = "feature", props: str = "", accessibility: bool = True) -> str:
        return json.dumps({
            "tsconfig": {"strict": True, "noImplicitAny": True, "exactOptionalPropertyTypes": True, "noUncheckedIndexedAccess": True},
            "patterns": {
                "Result": "type Result<T, E = AppError> = { ok: true; value: T } | { ok: false; error: E }",
                "Branded": "type UserId = string & { readonly _brand: unique symbol }",
                "Readonly": "Readonly<T> and as const for immutable data",
                "Unknown": "Use unknown + type guard instead of any",
            },
        }, indent=2)

class TailwindCSSSkill(BaseTool):
    name: str = "tailwind_css"
    description: str = "Style components with Tailwind CSS utility classes, CSS variables, and design tokens."
    def _run(self, component: str, variant: str = "primary", size: str = "md") -> str:
        return json.dumps({
            "design_tokens": "Use CSS custom properties: var(--color-brand-500), var(--spacing-4)",
            "dark_mode": "dark: prefix — ensure all components support dark mode",
            "responsive": "Mobile-first: base → sm: → md: → lg: → xl:",
            "component_classes": f"cn() utility for conditional class merging — avoid string concatenation",
            "forbidden": ["Arbitrary values without design token justification", "Inline styles for theming"],
        }, indent=2)

class FramerMotionSkill(BaseTool):
    name: str = "framer_motion"
    description: str = "Implement smooth animations with Framer Motion: transitions, gestures, and layout animations."
    def _run(self, element: str, type: str = "transition") -> str:
        return json.dumps({
            "template": f"""
import {{ motion, AnimatePresence }} from 'framer-motion';
const {element}Motion = () => (
  <AnimatePresence mode="wait">
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {{/* content */}}
    </motion.div>
  </AnimatePresence>
);
""",
            "a11y": "Add prefers-reduced-motion: const prefersReduced = useReducedMotion(); if (prefersReduced) skip animation",
        }, indent=2)

class ReactQuerySkill(BaseTool):
    name: str = "react_query"
    description: str = "Manage server state with TanStack Query: fetching, caching, invalidation, and optimistic updates."
    def _run(self, resource: str, operations: str = "list,get,create,update,delete", auth_header: bool = True) -> str:
        return json.dumps({
            "hooks": f"""
// List
export const use{resource.capitalize()}List = (params: QueryParams) =>
  useQuery({{ queryKey: ['{resource.lower()}s', params], queryFn: () => api.get{resource.capitalize()}List(params) }});

// Create with optimistic update
export const useCreate{resource.capitalize()} = () =>
  useMutation({{
    mutationFn: api.create{resource.capitalize()},
    onSuccess: () => queryClient.invalidateQueries({{ queryKey: ['{resource.lower()}s'] }}),
    onError: (err) => toast.error(err.message),
  }});
""",
            "stale_time": "5 * 60 * 1000  // 5 minutes — adjust per resource volatility",
            "error_handling": "Set global queryClient errorHandler — render <ErrorBoundary> per route",
        }, indent=2)

class ZustandSkill(BaseTool):
    name: str = "zustand"
    description: str = "Manage global UI state with Zustand: slices, selectors, and devtools integration."
    def _run(self, store_name: str, state_type: str = "zustand", entities: str = "") -> str:
        return json.dumps({
            "store": f"""
import {{ create }} from 'zustand';
import {{ devtools }} from 'zustand/middleware';

interface {store_name}State {{
  // state
  loading: boolean;
  error: string | null;
  // actions
  reset: () => void;
}}

export const use{store_name} = create<{store_name}State>()(
  devtools(
    (set) => ({{
      loading: false,
      error: null,
      reset: () => set({{ loading: false, error: null }}),
    }}),
    {{ name: '{store_name}' }}
  )
);
""",
            "selector": f"const value = use{store_name}((s) => s.specificValue); // atomic selector — prevents unnecessary re-renders",
        }, indent=2)

class DesignSystemSkill(BaseTool):
    name: str = "design_systems"
    description: str = "Build and maintain a component design system: tokens, primitives, compositions, and Storybook."
    def _run(self, component: str, variant: str = "primary", size: str = "md") -> str:
        return json.dumps({
            "token_hierarchy": ["global → semantic → component → override"],
            "component_levels": {
                "Primitives": "Button, Input, Text, Icon — single responsibility, fully accessible",
                "Compositions": "Card, FormField, Modal — assembled from primitives",
                "Patterns": "DataTable, CommandPalette, Sidebar — complex compositions with state",
            },
            "storybook": f"""
// {component}.stories.tsx
const meta: Meta<typeof {component}> = {{
  title: 'Design System/{component}',
  component: {component},
  parameters: {{ a11y: {{ config: {{ rules: [{{ id: 'color-contrast', enabled: true }}] }} }} }},
  argTypes: {{ variant: {{ options: ['primary', 'secondary', 'ghost', 'destructive'] }} }},
}};
""",
        }, indent=2)

class StorybookSkill(BaseTool):
    name: str = "storybook"
    description: str = "Document components with Storybook stories, controls, and accessibility audits."
    def _run(self, component: str, variant: str = "primary", size: str = "md") -> str:
        return json.dumps({
            "addons": ["@storybook/addon-a11y", "@storybook/addon-docs", "@storybook/addon-interactions"],
            "story_template": f"""
export const Default: Story = {{ args: {{ /* defaults */ }} }};
export const WithError: Story = {{ args: {{ error: 'Something went wrong' }} }};
export const Loading: Story = {{ args: {{ loading: true }} }};
export const Empty: Story = {{ args: {{ data: [] }} }};
""",
            "a11y": "Run axe-core on every story — fail if violations detected",
        }, indent=2)

class AccessibilitySkill(BaseTool):
    name: str = "accessibility_wcag"
    description: str = "Implement WCAG 2.2 AA accessibility: ARIA, keyboard navigation, focus management, and contrast."
    def _run(self, name: str, type: str = "feature", props: str = "", accessibility: bool = True) -> str:
        return json.dumps({
            "wcag_checklist": {
                "1.1.1": "Text alternatives for non-text content — alt on images, aria-label on icons",
                "1.3.1": "Info and relationships — use semantic HTML: <nav>, <main>, <article>",
                "1.4.3": "Contrast ratio ≥ 4.5:1 for normal text, 3:1 for large text",
                "2.1.1": "All functionality via keyboard — no mouse-only interactions",
                "2.4.3": "Focus order matches DOM order — logical tab sequence",
                "2.4.7": "Focus visible — :focus-visible with clear ring",
                "3.2.2": "No unexpected context changes on input",
                "4.1.2": "Role, name, value — all interactive elements have accessible names",
            },
            "focus_trap": "For modals/drawers — use focus-trap-react or headlessui FocusTrap",
            "live_region": "For dynamic updates — <div aria-live='polite'> or aria-live='assertive' for errors",
        }, indent=2)

class ResponsiveDesignSkill(BaseTool):
    name: str = "responsive_design"
    description: str = "Implement mobile-first responsive layouts: fluid grids, breakpoints, and container queries."
    def _run(self, name: str, type: str = "feature", props: str = "", accessibility: bool = True) -> str:
        return json.dumps({
            "breakpoints": {"sm": "640px", "md": "768px", "lg": "1024px", "xl": "1280px", "2xl": "1536px"},
            "approach": "Mobile-first — base styles for mobile, override at larger breakpoints",
            "grid": "CSS Grid for 2D layouts, Flexbox for 1D — avoid nested flex-in-flex",
            "testing": "Test at 320px, 375px, 768px, 1024px, 1440px — use browser DevTools device simulation",
            "container_queries": "@container for component-level responsive — preferred over screen queries for reusable components",
        }, indent=2)

class PerformanceOptimisationSkill(BaseTool):
    name: str = "frontend_performance_optimization"
    description: str = "Optimise Core Web Vitals: LCP, CLS, INP — code splitting, lazy loading, image optimisation."
    def _run(self, component: str, metric: str = "LCP") -> str:
        return json.dumps({
            "metric": metric,
            "optimisations": {
                "LCP": ["Use next/image with priority prop on above-fold images", "Preload critical fonts", "Eliminate render-blocking resources"],
                "CLS": ["Explicit width/height on all images and iframes", "Reserve space for dynamic content", "Avoid inserting DOM above existing content"],
                "INP": ["Defer non-critical JS with next/script lazyOnload", "Break long tasks into chunks with scheduler.yield()", "Avoid synchronous layout thrashing"],
            }.get(metric, ["Profile with Chrome DevTools Performance tab"]),
            "bundle": "next build --analyze — identify large chunks, replace with dynamic imports",
            "tool": "Lighthouse CI in GitHub Actions — fail if score < 95",
        }, indent=2)

class DataVisualisationSkill(BaseTool):
    name: str = "data_visualization"
    description: str = "Build data visualisations with D3.js, Recharts, and Chart.js: dashboards, graphs, and charts."
    def _run(self, name: str, type: str = "feature", props: str = "", accessibility: bool = True) -> str:
        return json.dumps({
            "library_selection": {
                "Recharts": "Declarative React charts — line, bar, area, pie — responsive by default",
                "D3.js": "Custom visualisations requiring fine-grained control — force graphs, maps",
                "Chart.js": "Canvas-based — use for performance-critical large datasets",
            },
            "accessibility": "Provide data table alternative — <table> with same data as chart; chart is aria-hidden",
            "responsive": "Use ResponsiveContainer from recharts or viewBox on SVG for fluid charts",
            "theme": "Use CSS custom properties for chart colours — supports dark mode automatically",
        }, indent=2)

class APIIntegrationSkill(BaseTool):
    name: str = "api_integration"
    description: str = "Integrate REST and GraphQL APIs with type-safe clients, error handling, and loading states."
    def _run(self, resource: str, operations: str = "list,get,create,update,delete", auth_header: bool = True) -> str:
        return json.dumps({
            "http_client": "fetch with typed wrapper — or axios for interceptors and cancellation",
            "type_safety": "Generate types from OpenAPI spec — openapi-typescript generates interfaces automatically",
            "error_handling": """
try {
  const data = await apiClient.get<Resource>(`/v1/${resource}s/${id}`);
  return { ok: true, data };
} catch (err) {
  const apiErr = parseApiError(err); // maps to RFC 9457 ProblemDetail
  return { ok: false, error: apiErr };
}
""",
            "auth": "Attach Authorization: Bearer {token} via interceptor — refresh on 401 with retry",
            "cancellation": "AbortController on component unmount — avoid state updates after unmount",
        }, indent=2)

class SEOSkill(BaseTool):
    name: str = "seo"
    description: str = "Implement SEO: meta tags, Open Graph, structured data, sitemap, and Core Web Vitals."
    def _run(self, route: str, render_strategy: str = "SSR", auth_required: bool = False) -> str:
        return json.dumps({
            "metadata_template": f"""
export const metadata: Metadata = {{
  title: 'Page Title | CerebroHive',
  description: 'Accurate 155-char description for search snippet',
  openGraph: {{
    title: 'OG Title',
    description: 'OG Description',
    images: [{{ url: '/og-image.jpg', width: 1200, height: 630 }}],
  }},
  twitter: {{ card: 'summary_large_image' }},
  robots: {{ index: true, follow: true }},
}};
""",
            "structured_data": "JSON-LD via next/head — SoftwareApplication schema for product pages",
            "sitemap": "next-sitemap — generate sitemap.xml + robots.txt automatically",
            "note": "Public pages (auth_required=False) only — no-index all auth-required pages",
        }, indent=2)

class FrontendTestingSkill(BaseTool):
    name: str = "frontend_testing"
    description: str = "Write Vitest unit tests and Playwright E2E tests for React components."
    def _run(self, component: str, test_type: str = "unit") -> str:
        if test_type == "unit":
            code = f"""
import {{ render, screen }} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {{ {component} }} from './{component}';

describe('{component}', () => {{
  it('renders without crashing', () => {{
    render(<{component} />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  }});

  it('is keyboard navigable', async () => {{
    const user = userEvent.setup();
    render(<{component} />);
    await user.tab();
    expect(document.activeElement).not.toBe(document.body);
  }});
}});
"""
        else:
            code = f"""
import {{ test, expect }} from '@playwright/test';
test('{component} E2E', async ({{ page }}) => {{
  await page.goto('/');
  await expect(page.getByRole('region', {{ name: '{component}' }})).toBeVisible();
}});
"""
        return json.dumps({"framework": "vitest" if test_type == "unit" else "playwright", "code": code}, indent=2)

class I18nSkill(BaseTool):
    name: str = "internationalization"
    description: str = "Implement i18n with next-intl: translation keys, locale routing, and RTL support."
    def _run(self, name: str, type: str = "feature", props: str = "", accessibility: bool = True) -> str:
        return json.dumps({
            "library": "next-intl — file-based translations, type-safe keys",
            "structure": "messages/{locale}.json — en.json, es.json, ar.json (RTL)",
            "usage": "const t = useTranslations('ComponentName'); <h1>{t('title')}</h1>",
            "rtl": "dir={locale === 'ar' ? 'rtl' : 'ltr'} on <html> — use logical CSS properties (start/end)",
            "plurals": "t('items', { count: n }) — use ICU message format for pluralisation",
        }, indent=2)

class FrontendSecuritySkill(BaseTool):
    name: str = "frontend_security"
    description: str = "Implement frontend security: CSP, XSS prevention, CSRF, secure storage, and OWASP checks."
    def _run(self, name: str, type: str = "feature", props: str = "", accessibility: bool = True) -> str:
        return json.dumps({
            "csp": "Content-Security-Policy header — restrict script-src, style-src, img-src — no 'unsafe-inline'",
            "xss": "DOMPurify.sanitize() before dangerouslySetInnerHTML — avoid where possible",
            "storage": "Never store sensitive data in localStorage/sessionStorage — use httpOnly cookies for tokens",
            "dependencies": "npm audit + Dependabot — zero HIGH+ vulnerabilities",
            "owasp_a3": "Sanitise all user inputs — React escapes by default but watch dangerouslySetInnerHTML",
            "owasp_a7": "JWT validated server-side — never trust client-decoded claims",
        }, indent=2)

class FrontendObservabilitySkill(BaseTool):
    name: str = "frontend_observability"
    description: str = "Instrument frontend with OTel: user actions, API errors, Core Web Vitals, and error tracking."
    def _run(self, name: str, type: str = "feature", props: str = "", accessibility: bool = True) -> str:
        return json.dumps({
            "web_vitals": "web-vitals library — send LCP, CLS, INP, FCP, TTFB to analytics endpoint",
            "error_tracking": "Sentry — capture unhandled errors with user context and session replay",
            "otel": "@opentelemetry/sdk-web — instrument XHR/fetch, create custom spans for key user actions",
            "rum": "Real User Monitoring — track navigation timing, resource timing, user flows",
        }, indent=2)

FRONTEND_ENGINEER_SKILLS = [
    FrontendEngineeringSkill(), ReactSkill(), NextJSSkill(), TypeScriptSkill(),
    TailwindCSSSkill(), FramerMotionSkill(), ReactQuerySkill(), ZustandSkill(),
    DesignSystemSkill(), StorybookSkill(), AccessibilitySkill(), ResponsiveDesignSkill(),
    PerformanceOptimisationSkill(), DataVisualisationSkill(), APIIntegrationSkill(),
    SEOSkill(), FrontendTestingSkill(), I18nSkill(), FrontendSecuritySkill(),
    FrontendObservabilitySkill(),
]

__all__ = ["FRONTEND_ENGINEER_SKILLS"]
