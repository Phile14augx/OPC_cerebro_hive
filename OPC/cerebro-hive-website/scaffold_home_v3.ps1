$components = @(
  "HomeHero",
  "EnterpriseDashboard",
  "BusinessChallenges",
  "EnterpriseSimulator",
  "LivingDigitalTwin",
  "LivingArchitecture",
  "IntegratedPlatform",
  "ResearchHighlights",
  "HumanProof",
  "EnterpriseReadiness",
  "TransformationRoadmap"
)

New-Item -Path "components\home\v3" -ItemType Directory -Force | Out-Null

foreach ($comp in $components) {
  $file = "components\home\v3\$comp.tsx"
  if (-not (Test-Path $file)) {
    $content = @"
`"use client`";
import React from 'react';

export default function $comp() {
  return (
    <section className="py-24 border-b border-white/5">
      <div className="container-wide">
        <h2 className="text-3xl font-space text-white">$comp</h2>
      </div>
    </section>
  );
}
"@
    Set-Content -Path $file -Value $content
  }
}
