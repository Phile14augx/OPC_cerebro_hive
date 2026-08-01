// FIXTURE: must be REJECTED by dep-cruiser rule `eda-temporal-containment` (ADR 0009).
// If this file ever passes, the Temporal containment rule has stopped working.
import { Client } from '@temporalio/client';
export const c: unknown = Client;
