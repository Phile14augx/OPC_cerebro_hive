$components = @(
  "InsightsHero",
  "ExecutiveDashboard",
  "WeeklyBrief",
  "FeaturedIntelligence",
  "TrendRadar",
  "TechnologyLandscape",
  "IndustryIntelligence",
  "MarketWatch",
  "ExecutiveDecisionCenter",
  "StrategyCanvas",
  "InteractiveReports",
  "OpinionAnalysis",
  "InsightsExplorer",
  "NewsletterCTA",
  "InsightsAssistant"
)

New-Item -ItemType Directory -Force -Path "components\insights\v2"

foreach ($comp in $components) {
  $path = "components\insights\v2\$comp.tsx"
  $content = "import React from 'react';`n`nexport const $comp = () => {`n  return (`n    <section className=`"py-20 border-b border-border bg-[#0A0D14]`">`n      <div className=`"container-wide text-center`">`n        <h2 className=`"text-white font-bold`">$comp Placeholder</h2>`n      </div>`n    </section>`n  );`n};`n"
  Set-Content -Path $path -Value $content
}
