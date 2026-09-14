# Nexarch Frontier Technology Factory

This directory stores research and knowledge state produced by recurring frontier-technology reviews. It is not an application runtime system of record.

## Structure

- `reports/weekly/` — human-readable and machine-readable weekly decision packets
- `radar/technology-radar.json` — durable normalized technology lifecycle and radar state
- `state/last-run.json` — latest run counters, blockers, and next-review triggers

Production authority remains in the canonical PostgreSQL persistence architecture. Research records preserve source, retrieval time, content hash where retrievable, confidence, and verification state. A research decision does not authorize implementation.

## Opportunity score

Scores are calculated from 0–10 inputs:

```text
Benefit =
  0.20 StrategicFit +
  0.10 TechnicalMaturity +
  0.15 EvidenceStrength +
  0.10 EnterpriseDemand +
  0.10 Differentiation +
  0.15 PlatformReuse +
  0.05 RevenuePotential +
  0.15 CustomerROI

Burden =
  0.20 ImplementationCost +
  0.20 IntegrationComplexity +
  0.25 SecurityRisk +
  0.10 VendorLockIn +
  0.10 LicenseRisk +
  0.15 OperationalRisk

NEXARCH_OPPORTUNITY_SCORE =
  round(10 × (0.75 × Benefit + 0.25 × (10 - Burden)))
```

An opportunity score of 73 or higher is eligible for experiment consideration, not automatic execution. Security controls with direct repository evidence may receive an `ADOPT_NOW` recommendation, but only the governor and current implementation ledger may authorize work.
