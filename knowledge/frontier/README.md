# Frontier Technology Factory

This directory contains governed research state for the Cerebro Nexarch Frontier Technology Factory.
It is not an application runtime store and does not authorize implementation work.

## Authority boundaries

- PostgreSQL remains the system of record for production business truth.
- Files here are research evidence, recommendations, and automation continuity records.
- A recommendation does not change the canonical implementation ledger.
- Only the current execution wave and repository governance can authorize experiments or implementation.
- External technologies must integrate through canonical Nexarch ports and adapters.

## Layout

```text
radar/technology-radar.json     durable ADOPT/TRIAL/ASSESS/HOLD state
reports/weekly/YYYY-MM-DD.md    human-readable weekly review
reports/weekly/YYYY-MM-DD.json  machine-readable evidence and decisions
state/last-run.json             compact automation hand-off state
```

## Opportunity score

Each dimension is scored from 0 to 10. Risk dimensions use 0 as low risk and 10 as high risk.

```text
NEXARCH_OPPORTUNITY_SCORE = 10 × (
  0.15 StrategicFit
  + 0.08 TechnicalMaturity
  + 0.12 EvidenceStrength
  + 0.10 EnterpriseDemand
  + 0.08 Differentiation
  + 0.14 PlatformReuse
  + 0.07 RevenuePotential
  + 0.10 CustomerROI
  + 0.04 (10 - ImplementationCost)
  + 0.04 (10 - IntegrationComplexity)
  + 0.03 (10 - SecurityRisk)
  + 0.02 (10 - VendorLockIn)
  + 0.02 (10 - LicenseRisk)
  + 0.01 (10 - OperationalRisk)
)
```

The score ranks research attention. It never authorizes work. The experiment threshold is 70, subject
to dependency, WIP, license, security, and governor checks.

## Evidence discipline

Source claims, repository observations, and Cerebro recommendations are distinct. Source hashes in
machine reports are SHA-256 hashes of the retrieved HTTP representation at the recorded retrieval
time; they are provenance aids, not signatures or publisher attestations.
