$components = @(
  "ResearchHero",
  "ResearchStats",
  "ResearchConstellation",
  "FeaturedResearch",
  "ResearchExplorer",
  "BenchmarkLab",
  "ExperimentGallery",
  "KnowledgeGraphView",
  "ResearchTimeline",
  "ResearchToProductBridge",
  "IndustryResearch",
  "OpenSourceProjects",
  "DeveloperResources",
  "ResearchRoadmap",
  "ResearchTeam",
  "ResearchAssistant"
)

foreach ($comp in $components) {
  $path = "components\research\v2\$comp.tsx"
  $content = "import React from 'react';`n`nexport const $comp = () => {`n  return (`n    <section className=`"py-20 border-b border-border`">`n      <div className=`"container-wide text-center`">`n        <h2>$comp Placeholder</h2>`n      </div>`n    </section>`n  );`n};`n"
  Set-Content -Path $path -Value $content
}
