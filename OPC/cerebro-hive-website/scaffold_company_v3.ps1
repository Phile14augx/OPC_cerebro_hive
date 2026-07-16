$components = @(
  "CompanyHero",
  "OriginStory",
  "EnterpriseManifesto",
  "OperatingPhilosophy",
  "EngineeringPrinciples",
  "HowWeThink",
  "InnovationFlywheel",
  "WhyCerebroHive",
  "EngineeringCulture",
  "ResponsibleAI",
  "EnterpriseProof",
  "FounderPerspective",
  "TeamExpertise",
  "LivingTimeline",
  "CompanyRoadmap",
  "GlobalOperatingModel",
  "CompanyCTA"
)

New-Item -Path "components\company\v3" -ItemType Directory -Force | Out-Null

foreach ($comp in $components) {
  $file = "components\company\v3\$comp.tsx"
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
