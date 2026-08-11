$plan = Get-Content "docs\superpowers\plans\2026-07-18-phase-2-services-rollout.md" -Raw

$files = @{
    4 = "components\services\IndustryMapping.tsx"
    5 = "components\services\InteractiveCapabilityMap.tsx"
    6 = "components\services\ConsultingCapabilityMatrix.tsx"
    7 = "components\services\TechStackShowcase.tsx"
    8 = "components\services\ConsultingProcessTimeline.tsx"
    9 = "components\services\ResearchInnovation.tsx"
    10 = "components\services\sections\ServiceHero.tsx"
    11 = "components\services\sections\ServiceBusinessChallenges.tsx"
    12 = "components\services\sections\ServiceMethodology.tsx"
    13 = "components\services\sections\ServiceArchitecture.tsx"
    14 = "components\services\sections\ServiceDeliverables.tsx"
    15 = "components\services\sections\ServiceROI.tsx"
    16 = "components\services\sections\ServiceFAQ.tsx"
    17 = "components\services\sections\ServiceCTA.tsx"
}

foreach ($task in 4..17) {
    $pattern = '### Task ' + $task + ':.*?- \[ \] \*\*Step 1: Replace the file contents\*\*\s*```tsx\s*(.*?)\s*```\s*- \[ \] \*\*Step 2:'
    $matches = [regex]::Match($plan, $pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
    if ($matches.Success) {
        $path = $files[$task]
        Set-Content -Path $path -Value $matches.Groups[1].Value
        Write-Output "Task $task code extracted and saved to $path"
    } else {
        Write-Output "Task $task regex failed!"
    }
}
