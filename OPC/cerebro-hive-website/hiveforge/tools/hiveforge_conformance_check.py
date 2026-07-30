#!/usr/bin/env python3
"""
HiveForge architecture conformance checker.

A minimal, dependency-free suite that formalizes the manual "mechanical
consistency pass" done before freezing the Masterplan baseline (see
hiveforge/08-ROADMAP.md) into a repeatable, CI-runnable check.

What this checks (deliberately minimal — expand as new capabilities land):

  1. ADR reference integrity   — every ADR-0NN mentioned in a doc resolves to
                                   a real file in hiveforge/adr/, unless it is
                                   an explicitly whitelisted external/illustrative
                                   reference (audit/ ADRs, or IDs on record as
                                   never-real, e.g. ADR-013).
  2. Naming-drift guard        — flags deprecated/superseded component names
                                   (ProviderAdapter, AIPolicyEngine, bare "AI
                                   Gateway") that aren't inside an explicitly
                                   allow-listed historical-reference sentence.
  3. Evidence-status legend    — flags "Status:" tokens that aren't one of the
                                   five canonical values from 00-FOUNDATION.md.
  4. Architectural Impact gate — every numbered phase doc (01-08) must contain
                                   an "Architectural Impact" section.

Exit code is non-zero if any check fails, so this can be wired into CI later
without modification. (Wired: .github/workflows/hiveforge-conformance.yml runs
this on every push/PR touching hiveforge/.)

Backlog (not implemented — noted so they aren't lost, not built speculatively
ahead of need):
  - Architecture traceability: verify each implementation phase/module
    references the ADRs it depends on (bidirectional decision <-> execution
    link), once real implementation code exists to check against.
  - Cross-document consistency: detect duplicate or conflicting definitions
    of the same capability/service/lifecycle state across hiveforge/*.md.

Usage:
    python3 hiveforge_conformance_check.py [path-to-hiveforge-dir]
"""

import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuration — the parts of this suite expected to grow over time.
# ---------------------------------------------------------------------------

# ADR IDs referenced in hiveforge/ docs that are known-good even though they
# don't resolve to a file under hiveforge/adr/ — because they point at the
# separate, closed audit/adr/ ADR set (M26.1 baseline + Engineering Review
# vertical-slice work), or because a document explicitly discusses an ID as
# illustrative/never-real. 001-007 verified via `ls audit/adr/` — all seven
# are real files, not a fabricated range (a first run of this script flagged
# 001/003/005 as errors; checked by hand against the real directory listing
# before whitelisting them, rather than assumed).
#   - "008" appears only in 03-CONTROL-PLANE.md §8's reconciliation table,
#     explicitly discussing a user-proposed ADR-0008-0014 numbering that was
#     never adopted (real numbers are ADR-020-037) — same category as "013".
EXTERNAL_OR_FLAGGED_ADR_IDS = {"001", "002", "003", "004", "005", "006", "007", "008", "013"}

# Deprecated names -> what replaced them, and why. Each entry is a regex
# matched against a whole line; a line is only flagged if it does NOT also
# match one of that name's ALLOWLIST_CONTEXT patterns (explanatory/historical
# sentences that legitimately mention the old name while documenting why it
# changed).
DEPRECATED_NAMES = {
    "ProviderAdapter": {
        "replacement": "ProviderMetadata / ProviderExecutor (ADR-020, amended Phase 4)",
        "allowlist_context": [
            r"split", r"amend", r"replaced", r"original", r"stale",
            r"conflated", r"Consequences", r"Decision",
        ],
    },
    "AIPolicyEngine": {
        "replacement": "AIGovernanceEngine (see 06-SECURITY.md §0)",
        # Negation phrasing ("no leftover AIPolicyEngine", "none found") is a
        # legitimate mention — it's a consistency-pass record confirming the
        # name is absent, not an actual occurrence of the deprecated name.
        "allowlist_context": [r"no leftover", r"none found", r"not found", r"no\s"],
    },
}

# Evidence-status legend, per 00-FOUNDATION.md §0 (amended, 08-ROADMAP.md §3).
CANONICAL_EVIDENCE_STATUSES = {
    "Verified", "Approved", "Planned", "Vision", "Open Decision",
}

# Phase documents required to carry a closing Architectural Impact section.
PHASE_DOCS_REQUIRING_IMPACT_SECTION = [
    "00-FOUNDATION.md",
    "01-DOMAIN-MODEL.md",
    "01-PLATFORM-ARCHITECTURE.md",
    "02-SERVICE-CATALOG.md",
    "03-CONTROL-PLANE.md",
    "04-PROVIDER-FRAMEWORK.md",
    "05-BUSINESS-PLATFORM.md",
    "06-SECURITY.md",
    "07-OPERATIONS.md",
    "08-ROADMAP.md",
    "09-EXECUTION-LIFECYCLE-RUNTIME.md",
]

ADR_REF_RE = re.compile(r"ADR-0*(\d{2,3})")
BARE_AI_GATEWAY_RE = re.compile(r"\bAI Gateway\b")


def check_adr_references(hiveforge_dir: Path) -> list[str]:
    errors = []
    adr_dir = hiveforge_dir / "adr"
    real_ids = set()
    for f in adr_dir.glob("ADR-*.md"):
        m = re.match(r"ADR-(\d{3})", f.name)
        if m:
            real_ids.add(m.group(1))

    for md in sorted(hiveforge_dir.rglob("*.md")):
        text = md.read_text(encoding="utf-8")
        for m in ADR_REF_RE.finditer(text):
            num = m.group(1).zfill(3)
            if num in real_ids or num in EXTERNAL_OR_FLAGGED_ADR_IDS:
                continue
            line_no = text[: m.start()].count("\n") + 1
            errors.append(
                f"{md.relative_to(hiveforge_dir.parent)}:{line_no}: "
                f"references ADR-{num}, which does not exist under hiveforge/adr/ "
                f"and is not in the known external/flagged list "
                f"({sorted(EXTERNAL_OR_FLAGGED_ADR_IDS)}). "
                f"Either the file is missing, or this ID needs to be added to "
                f"EXTERNAL_OR_FLAGGED_ADR_IDS with a reason."
            )
    return errors


def check_naming_drift(hiveforge_dir: Path) -> list[str]:
    errors = []
    for md in sorted(hiveforge_dir.rglob("*.md")):
        text = md.read_text(encoding="utf-8")
        lines = text.splitlines()
        for i, line in enumerate(lines, start=1):
            for name, cfg in DEPRECATED_NAMES.items():
                if name not in line:
                    continue
                allowed = any(
                    re.search(pat, line, re.IGNORECASE)
                    for pat in cfg["allowlist_context"]
                )
                if not allowed:
                    errors.append(
                        f"{md.relative_to(hiveforge_dir.parent)}:{i}: "
                        f"uses deprecated name '{name}' outside an allow-listed "
                        f"historical-reference context. Use "
                        f"'{cfg['replacement']}' instead, or add context "
                        f"matching one of {cfg['allowlist_context']} if this "
                        f"really is documenting the old name for history."
                    )
            m = BARE_AI_GATEWAY_RE.search(line)
            if m and "SecureAIGateway" not in line and "ADR-030" not in line:
                errors.append(
                    f"{md.relative_to(hiveforge_dir.parent)}:{i}: "
                    f"bare 'AI Gateway' mention — should be 'SecureAIGateway' "
                    f"(ADR-030), unless this line is titling/describing the ADR "
                    f"itself."
                )
    return errors


def check_evidence_status_legend(hiveforge_dir: Path) -> list[str]:
    errors = []
    status_line_re = re.compile(r"\*\*Status(?::)?\*\*:?\s*(.+)")
    for md in sorted(hiveforge_dir.glob("*.md")):
        text = md.read_text(encoding="utf-8")
        for i, line in enumerate(text.splitlines(), start=1):
            m = status_line_re.search(line)
            if not m:
                continue
            rest = m.group(1)
            # A doc-header "Status:" line describes doc lifecycle (Proposed/
            # Approved/etc.), not the five-value evidence legend — only check
            # legend usage inside the legend table itself and inline
            # evidence tags like "(Planned)" or "Status: Verified".
            if any(tok in rest for tok in CANONICAL_EVIDENCE_STATUSES):
                continue
            if any(tok in rest for tok in ("Proposed", "Draft", "Frozen")):
                continue  # doc-lifecycle status, not evidence-status legend
            errors.append(
                f"{md.relative_to(hiveforge_dir.parent)}:{i}: "
                f"Status line '{rest.strip()}' doesn't match a known "
                f"doc-lifecycle or evidence-status token — verify by hand."
            )
    return errors


def check_architectural_impact_sections(hiveforge_dir: Path) -> list[str]:
    errors = []
    for name in PHASE_DOCS_REQUIRING_IMPACT_SECTION:
        path = hiveforge_dir / name
        if not path.exists():
            errors.append(f"{name}: expected phase document is missing entirely.")
            continue
        text = path.read_text(encoding="utf-8")
        if "Architectural Impact" not in text and "Architectural impact" not in text:
            errors.append(
                f"{name}: missing required 'Architectural Impact' section "
                f"(standing governance rule, adopted from Phase 5 onward — "
                f"00-FOUNDATION.md and Phase 1-4 docs predate the rule and are "
                f"exempt; if this fires for one of those, update this script's "
                f"exemption list rather than treating it as a real gap)."
            )
    return errors


def main():
    hiveforge_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("hiveforge")
    if not hiveforge_dir.is_dir():
        print(f"error: {hiveforge_dir} is not a directory", file=sys.stderr)
        sys.exit(2)

    # Phase 0-4 docs predate the "Architectural Impact" governance rule
    # (adopted starting Phase 5) — don't fail them for lacking it.
    global PHASE_DOCS_REQUIRING_IMPACT_SECTION
    PHASE_DOCS_REQUIRING_IMPACT_SECTION = [
        n for n in PHASE_DOCS_REQUIRING_IMPACT_SECTION
        if n not in {
            "00-FOUNDATION.md", "01-DOMAIN-MODEL.md",
            "01-PLATFORM-ARCHITECTURE.md", "02-SERVICE-CATALOG.md",
            "03-CONTROL-PLANE.md", "04-PROVIDER-FRAMEWORK.md",
        }
    ]

    checks = [
        ("ADR reference integrity", check_adr_references),
        ("Naming-drift guard", check_naming_drift),
        ("Evidence-status legend", check_evidence_status_legend),
        ("Architectural Impact section gate", check_architectural_impact_sections),
    ]

    total_errors = 0
    for label, fn in checks:
        errors = fn(hiveforge_dir)
        status = "PASS" if not errors else f"FAIL ({len(errors)})"
        print(f"[{status}] {label}")
        for e in errors:
            print(f"    - {e}")
        total_errors += len(errors)

    print()
    if total_errors:
        print(f"Conformance check FAILED: {total_errors} issue(s) found.")
        sys.exit(1)
    else:
        print("Conformance check PASSED: no issues found.")
        sys.exit(0)


if __name__ == "__main__":
    main()
