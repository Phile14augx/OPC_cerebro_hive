# CerebroHive Makefile
# Convenience targets for common development and assurance tasks.
#
# Usage:
#   make assurance          → Full local evidence package + dashboard
#   make assurance-cec      → CEC score only (reads existing evidence)
#   make assurance-dashboard→ Open dashboard in browser
#   make test               → pnpm test
#   make lint               → pnpm lint
#   make build              → pnpm build
#   make clean              → pnpm clean

.PHONY: help assurance assurance-cec assurance-dashboard \
        test lint build clean typecheck format \
        falco-lint tetragon-lint chaos-preflight

# ── Default: show help ────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  CerebroHive — available make targets"
	@echo ""
	@echo "  Assurance"
	@echo "    make assurance             Full evidence package + CEC score + dashboard"
	@echo "    make assurance-cec         CEC score from existing evidence (fast)"
	@echo "    make assurance-dashboard   Open dashboard in browser"
	@echo ""
	@echo "  Development"
	@echo "    make build                 Build all packages"
	@echo "    make test                  Run all tests"
	@echo "    make lint                  Lint all packages"
	@echo "    make typecheck             TypeScript checks"
	@echo "    make format                Prettier format"
	@echo "    make clean                 Clean build artifacts"
	@echo ""
	@echo "  Infra validation"
	@echo "    make falco-lint            Validate Falco rule naming/coverage"
	@echo "    make tetragon-lint         Validate Tetragon TracingPolicy files"
	@echo "    make chaos-preflight       Verify chaos prerequisites in cluster"
	@echo ""

# ── Assurance ─────────────────────────────────────────────────────────────────
assurance:
	bash infra/assurance/run-local.sh

assurance-cec:
	bash infra/assurance/run-local.sh --cec-only

assurance-dashboard:
	bash infra/assurance/run-local.sh --dashboard-only

assurance-skip-slow:
	bash infra/assurance/run-local.sh --skip-slow

# ── Development ───────────────────────────────────────────────────────────────
build:
	pnpm build

test:
	pnpm test

lint:
	pnpm lint

typecheck:
	pnpm typecheck

format:
	pnpm format

clean:
	pnpm clean

# ── Infra validation ──────────────────────────────────────────────────────────
falco-lint:
	@echo "Validating Falco rules..."
	@python3 -c " \
import re, sys; \
txt = open('infra/falco/falco-rules.yaml').read(); \
rules = re.findall(r'^- rule: (.+)', txt, re.MULTILINE); \
bad = [r for r in rules if not r.startswith('CEREBRO_')]; \
print(f'  Total rules: {len(rules)}'); \
print(f'  CEREBRO_* rules: {len(rules)-len(bad)}'); \
[print(f'  ❌ Bad name: {r}') for r in bad]; \
sys.exit(1 if bad else 0) \
"
	@echo "  ✅ All Falco rules pass naming check"

tetragon-lint:
	@echo "Validating Tetragon TracingPolicies..."
	@python3 -c " \
import re, sys; \
txt = open('infra/tetragon/tracing-policies.yaml').read(); \
policies = txt.count('kind: TracingPolicy'); \
sigkills = txt.count('action: Sigkill'); \
print(f'  TracingPolicies: {policies}'); \
print(f'  Sigkill actions: {sigkills}'); \
ok = policies >= 9 and sigkills >= 6; \
sys.exit(0 if ok else 1) \
"
	@echo "  ✅ Tetragon policies pass validation"

chaos-preflight:
	@echo "Checking chaos game-day prerequisites..."
	@kubectl get ns cerebro-staging &>/dev/null || (echo "❌ cerebro-staging namespace not found" && exit 1)
	@kubectl get crd podchaos.chaos-mesh.org &>/dev/null || (echo "❌ Chaos Mesh CRDs not installed" && exit 1)
	@echo "  ✅ cerebro-staging exists"
	@echo "  ✅ Chaos Mesh installed"
	@kubectl get nodes --no-headers | grep -v " Ready " | \
		(grep . && echo "❌ Not all nodes Ready" && exit 1) || echo "  ✅ All nodes Ready"
