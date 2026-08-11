/**
 * CerebroHive API Client
 *
 * Typed fetch wrapper for the Rust gateway (http://gateway:8900/api/v1).
 * Server components use the internal URL; client components use the public URL.
 *
 * Usage:
 *   // Server component:
 *   const products = await api.platform.listProducts()
 *
 *   // Client component (with token):
 *   const products = await api.platform.listProducts({ token: jwt })
 */

// ── Config ────────────────────────────────────────────────────────────────────

const SERVER_API = process.env.API_URL            ?? "http://gateway:8900/api/v1";
const PUBLIC_API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8900/api/v1";

export function getApiBase(isServer = typeof window === "undefined"): string {
  return isServer ? SERVER_API : PUBLIC_API;
}

// ── HTTP primitives ───────────────────────────────────────────────────────────

interface RequestOptions {
  token?: string;
  cache?: RequestCache;
  revalidate?: number; // seconds, 0 = no-store
  tags?: string[];     // next.js fetch tags for on-demand revalidation
}

async function request<T>(
  path: string,
  init: RequestInit & RequestOptions = {}
): Promise<T> {
  const { token, cache, revalidate, tags, ...fetchInit } = init;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchInit.headers ?? {}),
  };

  const nextOptions: Record<string, unknown> = {};
  if (revalidate !== undefined) nextOptions.revalidate = revalidate;
  if (tags?.length) nextOptions.tags = tags;

  const res = await fetch(`${getApiBase()}${path}`, {
    ...fetchInit,
    headers,
    cache: cache ?? (revalidate !== undefined ? undefined : "no-store"),
    next: nextOptions as NextFetchRequestConfig,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new ApiError(res.status, error?.error?.message ?? res.statusText, error);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Error ─────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Types (mirrors platform-svc DTOs) ────────────────────────────────────────

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  tier: string;
  tierLabel: string;
  features: string[];
  integrations: string[];
  useCases: string[];
  sla?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItem {
  id: string;
  code: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  practice: string;
  timeline: string;
  investment: string;
  deliverables: string[];
  outcomes: string[];
  active: boolean;
}

export interface Industry {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  overview: string;
  compliance: string[];
  metrics: string[];
  icon?: string;
  color?: string;
  useCases: UseCase[];
  active: boolean;
}

export interface UseCase {
  id: string;
  name: string;
  description: string;
  products: string[];
  roi?: string;
}

export interface Solution {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  deliverables: string[];
  timeline: string;
  investment: string;
  outcomes: string[];
  products: string[];
  services: string[];
  methodology?: string;
  active: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface Course {
  id: string;
  code: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  modules: string[];
  outcomes: string[];
  prerequisites: string[];
  active: boolean;
  enrollmentCount: number;
}

export interface LearningPath {
  id: string;
  code: string;
  slug: string;
  name: string;
  certTitle: string;
  description: string;
  level: string;
  durationMin: string;
  durationMax: string;
  courseIds: string[];
  outcomes: string[];
  active: boolean;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  status: string;
  progressPct: number;
  startedAt: string;
  completedAt?: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  contactId: string;
  contactEmail: string;
  contactName: string;
  company: string;
  status: string;
  engagementType: string;
  message: string;
  productsInterested: string[];
  score: number;
  grade?: string;
  source: string;
  createdAt: string;
}

// ── Platform API ──────────────────────────────────────────────────────────────

export const platform = {
  listProducts: (opts: RequestOptions & { page?: number; size?: number } = {}) =>
    request<Page<Product>>(`/platform/products?page=${opts.page ?? 0}&size=${opts.size ?? 50}`, {
      ...opts, revalidate: opts.revalidate ?? 300, tags: ["products"],
    }),

  getProduct: (slug: string, opts: RequestOptions = {}) =>
    request<Product>(`/platform/products/${slug}`, {
      ...opts, revalidate: opts.revalidate ?? 300, tags: [`product:${slug}`],
    }),

  searchProducts: (q: string, opts: RequestOptions = {}) =>
    request<Page<Product>>(`/platform/products/search?q=${encodeURIComponent(q)}`, opts),

  listServices: (opts: RequestOptions = {}) =>
    request<Page<ServiceItem>>("/platform/services?size=60", {
      ...opts, revalidate: 600, tags: ["services"],
    }),

  listIndustries: (opts: RequestOptions = {}) =>
    request<Page<Industry>>("/platform/industries?size=20", {
      ...opts, revalidate: 600, tags: ["industries"],
    }),

  getIndustry: (slug: string, opts: RequestOptions = {}) =>
    request<Industry>(`/platform/industries/${slug}`, {
      ...opts, revalidate: 600, tags: [`industry:${slug}`],
    }),

  listSolutions: (opts: RequestOptions = {}) =>
    request<Page<Solution>>("/platform/solutions?size=20", {
      ...opts, revalidate: 600, tags: ["solutions"],
    }),

  getSolution: (slug: string, opts: RequestOptions = {}) =>
    request<Solution>(`/platform/solutions/${slug}`, {
      ...opts, revalidate: 600, tags: [`solution:${slug}`],
    }),

  globalSearch: (q: string, opts: RequestOptions = {}) =>
    request<{ products: Product[]; services: ServiceItem[]; industries: Industry[]; solutions: Solution[] }>(
      `/platform/search?q=${encodeURIComponent(q)}`, opts
    ),
};

// ── Academy API ───────────────────────────────────────────────────────────────

export const academy = {
  listCourses: (opts: RequestOptions & { page?: number } = {}) =>
    request<Page<Course>>(`/academy/courses?page=${opts.page ?? 0}&size=40`, {
      ...opts, revalidate: 300, tags: ["courses"],
    }),

  getCourse: (slug: string, opts: RequestOptions = {}) =>
    request<Course>(`/academy/courses/${slug}`, {
      ...opts, revalidate: 300, tags: [`course:${slug}`],
    }),

  listLearningPaths: (opts: RequestOptions = {}) =>
    request<Page<LearningPath>>("/academy/learning-paths", {
      ...opts, revalidate: 600, tags: ["learning-paths"],
    }),

  listEnrollments: (opts: RequestOptions = {}) =>
    request<Page<Enrollment>>("/academy/enrollments", opts),

  enroll: (courseId: string, opts: RequestOptions = {}) =>
    request<Enrollment>("/academy/enrollments", {
      method: "POST",
      body: JSON.stringify({ courseId }),
      ...opts,
    }),

  updateProgress: (enrollmentId: string, progressPct: number, opts: RequestOptions = {}) =>
    request<Enrollment>(`/academy/enrollments/${enrollmentId}/progress`, {
      method: "PATCH",
      body: JSON.stringify({ progressPct }),
      ...opts,
    }),
};

// ── CRM API ───────────────────────────────────────────────────────────────────

export const crm = {
  submitLead: (data: {
    email: string;
    firstName: string;
    lastName: string;
    company?: string;
    jobTitle?: string;
    industry?: string;
    companySize?: string;
    region?: string;
    engagementType?: string;
    message?: string;
    productsInterested?: string[];
    source?: string;
  }) =>
    request<Lead>("/crm/leads", {
      method: "POST",
      body: JSON.stringify(data),
      cache: "no-store",
    }),

  createBooking: (data: {
    contactId: string;
    leadId?: string;
    meetingType?: string;
    scheduledAt?: string;
    durationMins?: number;
    notes?: string;
  }, opts: RequestOptions = {}) =>
    request<unknown>("/crm/bookings", {
      method: "POST",
      body: JSON.stringify(data),
      cache: "no-store",
      ...opts,
    }),

  registerReferral: (referredEmail: string, opts: RequestOptions = {}) =>
    request<unknown>("/crm/referrals", {
      method: "POST",
      body: JSON.stringify({ referredEmail }),
      ...opts,
    }),
};

// ── Convenience export ────────────────────────────────────────────────────────

export const api = { platform, academy, crm };
export default api;
