# Documentation Guidelines

Rules for keeping `docs/` coherent as it grows. See [`DOCUMENTATION-MAP.md`](./DOCUMENTATION-MAP.md) for the current tree.

1. **Canonical system behavior goes in permanent documentation** — `architecture/`, `domains/`, `specifications/`, `engineering/`, `operations/`, `company-handbook/`, or the content catalog (`01-company-foundation/` etc.). These describe the system/company as it exists now.
2. **Implementation plans go under `plans/active/`.** A plan describes work being executed, not current fact — don't let a plan's description of a future state get cited as if it were the current architecture.
3. **Completed plans move to `plans/completed/`** in the same change that closes the work out. Don't leave finished plans sitting in `active/`.
4. **Superseded or abandoned documents move to `archive/`**, not deleted, with an `> Status: Archived` / `> Superseded by:` / `> Archived:` / `> Reason:` header block pointing to whatever replaced them. Use `archive/superseded/` when a specific newer document replaced it, `archive/historical/` when it's just no longer current.
5. **New architecture decisions use ADRs** under `architecture/decisions/<series>/`. Pick the subfolder matching the subsystem; create a new one only for a genuinely new subsystem. Use the next free number within that series — series are not cross-numbered (see `architecture/decisions/README.md`).
6. **Avoid duplicate sources of truth.** If two documents describe the same thing, one is canonical and the other either links to it or is archived — don't let both keep drifting independently.
7. **Update documentation in the same change as the architecture change it describes.** A merged change that alters behavior without touching the relevant doc is incomplete.
8. **Use relative Markdown links**, not absolute filesystem paths (`file:///...`) or bare filenames pretending to be links.
9. **Use lowercase kebab-case filenames** for new documents (`agent-versioning.md`, not `FINAL_ARCH_DOC_NEW_V2.md`). Exceptions: ecosystem-convention names (`README.md`, `CONTRIBUTING.md`, `LICENSE`, `AGENTS.md`, `CLAUDE.md`, `SECURITY.md`, `CHANGELOG.md`, `ROADMAP.md`) and `ADR-XXXX-*.md`-style decision records, which follow their own established convention.
10. **Every major document should state its purpose and status up front** — a one-line description of what it covers, and for anything not obviously permanent, whether it's a plan, a review, or archived.

## Why some documents don't follow rule 9

Several directories moved during the August 2026 reorganization (`hiveforge/`, `PRODUCT_SPECIFICATIONS/`, the various ADR sets) already used a consistent internal naming convention — `SCREAMING-KEBAB-CASE.md`, numeric prefixes, or `ADR-XXXX-*.md`. Those were preserved on move rather than renamed, because the files are extensively cross-referenced by filename in surrounding prose, and blanket renaming ~300 files for a cosmetic naming change was judged not worth the churn or the risk of breaking a reference this pass didn't catch. New documents in these folders should still prefer lowercase kebab-case going forward unless matching an existing numbered/ADR sequence.
