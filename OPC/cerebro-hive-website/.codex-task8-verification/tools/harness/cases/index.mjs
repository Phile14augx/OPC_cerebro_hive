/**
 * Validation case registry.
 *
 * Cases are added when the phase that needs them arrives — not speculatively.
 * An unimplemented case reports PENDING with the phase it is waiting on, which
 * is honest and visible, rather than absent and forgotten.
 */
import './gate-a-sandbox-overhead.mjs';
import './gate-b-workflow-scale.mjs';
import './gate-c-tenant-isolation.mjs';
