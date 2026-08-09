import { Type } from "@sinclair/typebox";

export const PaginationQuery = Type.Object({
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 20, minimum: 1, maximum: 100 })),
  sort: Type.Optional(Type.String()), // e.g. 'createdAt', '-createdAt'
  search: Type.Optional(Type.String()),
});

export const PaginatedResponse = (ItemType: any) =>
  Type.Object({
    data: Type.Array(ItemType),
    meta: Type.Object({
      total: Type.Number(),
      page: Type.Number(),
      limit: Type.Number(),
      totalPages: Type.Number(),
    }),
  });
