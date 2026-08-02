#!/usr/bin/env bash
# Proves the boundary rules FAIL on deliberate violations.
#
# A rule that has never been observed to fail may be passing vacuously — wrong
# path, wrong glob, disabled plugin. This script is the difference between
# "CI is green" and "the rule works".
set -uo pipefail
cd "$(dirname "$0")/../.."

fixtures=(temporal-import raw-pg-import otel-import graph-internal-import)
failed=0

for f in "${fixtures[@]}"; do
  path="tools/arch/fixtures/violations/$f"
  if npx depcruise --config .dependency-cruiser.js --output-type err "$path" >/dev/null 2>&1; then
    echo "FAIL: $f was ACCEPTED — the boundary rule is not firing."
    failed=1
  else
    echo "ok:   $f correctly rejected"
  fi
done

exit $failed
