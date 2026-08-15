import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    // Generate/migrate only. The runtime client uses PrismaPg in index.ts.
    // A placeholder keeps `prisma generate` (postinstall / typecheck) honest
    // in CI when DATABASE_URL is unset; it does not open a connection.
    url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/postgres',
  },
  migrations: {
    path: "./prisma/migrations"
  }
});
