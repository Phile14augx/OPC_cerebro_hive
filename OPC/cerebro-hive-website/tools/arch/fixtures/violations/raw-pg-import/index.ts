// FIXTURE: must be REJECTED by `eda-db-access-via-tenancy-only` (ADR 0010).
import { Pool } from 'pg';
export const p: unknown = Pool;
