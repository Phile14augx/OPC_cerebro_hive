// ── Pagination types ──────────────────────────────────────────────────────────

export interface PaginationParams {
  page?:    number;     // 1-indexed, default 1
  limit?:   number;     // default 20, max 100
  cursor?:  string;     // opaque cursor for cursor-based pagination
  sortBy?:  string;
  sortDir?: "asc" | "desc";
  search?:  string;
}

export interface PaginatedResponse<T> {
  data:       T[];
  meta: {
    total:      number;
    page:       number;
    limit:      number;
    totalPages: number;
    hasMore:    boolean;
    nextCursor: string | null;
    prevCursor: string | null;
  };
}

export function paginate<T>(
  items: T[],
  total: number,
  params: Required<Pick<PaginationParams, "page" | "limit">>,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / params.limit);
  return {
    data: items,
    meta: {
      total,
      page:       params.page,
      limit:      params.limit,
      totalPages,
      hasMore:    params.page < totalPages,
      nextCursor: params.page < totalPages ? String(params.page + 1) : null,
      prevCursor: params.page > 1 ? String(params.page - 1) : null,
    },
  };
}
