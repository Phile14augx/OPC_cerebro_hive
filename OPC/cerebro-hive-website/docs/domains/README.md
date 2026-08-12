# Domains

Documentation for individual product/platform subsystems, grouped so everything about one subsystem lives together (architecture, data model, runtime, roadmap, ADRs stay adjacent within the subsystem's own folder — except ADRs, which are consolidated under [`../architecture/decisions/`](../architecture/decisions/README.md) to avoid numbering collisions; each domain's ADRs are linked from its README).

| Domain | Covers |
|---|---|
| [`hiveforge/`](./hiveforge/) | The HiveForge control-plane platform — provisioning, provider framework, execution runtime, business platform layer |

Only one domain folder exists today because HiveForge is the one subsystem in this repository with enough dedicated, self-contained documentation to warrant its own folder. Other subsystems (CerebroEDA, Studio/Company OS, Digital Twin) currently have their documentation living in `../architecture/assessments/` (point-in-time design docs) and `../specifications/features/` (design specs) rather than a dedicated domain folder — promote them here if/when they accumulate enough dedicated material to justify it. Don't create empty domain folders speculatively.
