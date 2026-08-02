#!/usr/bin/env bash
set -e

# Get all failed run IDs
echo "Fetching failed run IDs..."
FAILED_IDS=$(gh run list --repo Phile14augx/OPC_cerebro_hive --limit 200 2>&1 | awk -F'\t' 'NF>=7 && $1=="completed" && $2=="failure" {print $7}')

COUNT=$(echo "$FAILED_IDS" | grep -c "^[0-9]" || true)
echo "Found $COUNT failed runs to delete"

if [ -z "$FAILED_IDS" ] || [ "$COUNT" -eq 0 ]; then
  echo "No failed runs to delete."
  exit 0
fi

DELETED=0
FAILED=0

for id in $FAILED_IDS; do
  if gh run delete "$id" --repo Phile14augx/OPC_cerebro_hive 2>/dev/null; then
    DELETED=$((DELETED + 1))
    if [ $((DELETED % 10)) -eq 0 ]; then
      echo "Deleted $DELETED / $COUNT..."
    fi
  else
    FAILED=$((FAILED + 1))
    echo "Failed to delete run $id"
  fi
  sleep 0.2  # Avoid rate limits
done

echo
echo "Complete. Deleted: $DELETED, Failed: $FAILED"