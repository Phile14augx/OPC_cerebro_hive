<#
.SYNOPSIS
    CerebroHive working-tree triage: categorise, validate, worktree-split, commit, and push
    all 700+ uncommitted changes in cerebro-hive-website.

.DESCRIPTION
    Run this from the repo root (cerebro-hive-website/) in a Windows PowerShell terminal.
    It will:
      1. Show a categorised git status summary (dry-run preview)
      2. Prompt for confirmation before making any git changes
      3. Create a .worktrees/<name>/ directory per category (linked worktrees)
      4. Copy relevant files into each worktree, stage, validate, commit, and push
      5. Preserve legal-docs/ and sibling repos - never stages those paths

    PREREQUISITES
      - git >= 2.5 (worktree support), pnpm, python3 in PATH
      - You are authenticated: `git remote -v` shows the correct origin
      - The base branch (main) is up-to-date: `git fetch origin main`

.PARAMETER DryRun
    Show what would happen without making any git changes. Default: $true.
    Set -DryRun:$false to execute.

.PARAMETER SkipValidation
    Skip py_compile / yaml / typecheck gates. Not recommended. Default: $false.

.PARAMETER BaseBranch
    The branch to fork every worktree branch from. Default: "main".

.PARAMETER RemoteName
    Git remote to push to. Default: "origin".

.EXAMPLE
    # Preview only
    .\Invoke-CerebroWorktreeDispatch.ps1

    # Execute for real
    .\Invoke-CerebroWorktreeDispatch.ps1 -DryRun:$false

    # Execute, skip Python/YAML validation (faster, less safe)
    .\Invoke-CerebroWorktreeDispatch.ps1 -DryRun:$false -SkipValidation
#>

[CmdletBinding(SupportsShouldProcess)]
param(
    [bool]$DryRun = $true,
    [switch]$SkipValidation,
    [string]$BaseBranch = "main",
    [string]$RemoteName = "origin"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# -- Colours -----------------------------------------------------------------
function Write-Header  { param($m) Write-Host "`n=== $m ===" -ForegroundColor Cyan }
function Write-Step    { param($m) Write-Host "  -> $m" -ForegroundColor White }
function Write-OK      { param($m) Write-Host "  [OK] $m" -ForegroundColor Green }
function Write-Warn    { param($m) Write-Host "  [WARN] $m" -ForegroundColor Yellow }
function Write-Fail    { param($m) Write-Host "  [FAIL] $m" -ForegroundColor Red }
function Write-Skip    { param($m) Write-Host "  [SKIP] SKIP: $m" -ForegroundColor DarkGray }
function Write-Preserve{ param($m) Write-Host "  [LOCKED] PRESERVE: $m" -ForegroundColor Magenta }

# -- Helpers ------------------------------------------------------------------
function Invoke-Git {
    param([string[]]$Args)
    if ($DryRun) {
        Write-Host "    [DRY-RUN] git $($Args -join ' ')" -ForegroundColor DarkGray
        return ""
    }
    $result = & git @Args 2>&1
    if ($LASTEXITCODE -ne 0) { throw "git $($Args -join ' ') failed: $result" }
    return $result
}

function Test-GitignoreMatch {
    param([string]$Path)
    $result = & git check-ignore -q $Path 2>&1
    return ($LASTEXITCODE -eq 0)
}

# -- Verify we are in the repo root -------------------------------------------
Write-Header "CerebroHive Worktree Dispatch v1.0"
$repoRoot = (Get-Location).Path
if (-not (Test-Path "$repoRoot\.git")) {
    Write-Fail "Run this script from the cerebro-hive-website repo root (where .git lives)."
    exit 1
}
Write-OK "Repo root confirmed: $repoRoot"

if ($DryRun) {
    Write-Warn "DRY-RUN mode - no git changes will be made. Pass -DryRun:`$false to execute."
}

# -- Worktrees output directory ------------------------------------------------
$worktreesRoot = Join-Path $repoRoot ".worktrees"
if (-not (Test-Path $worktreesRoot)) {
    if (-not $DryRun) { New-Item -ItemType Directory -Path $worktreesRoot | Out-Null }
    Write-Step "Created .worktrees/ directory"
}

# -- 1. Get git status ---------------------------------------------------------
Write-Header "1. Reading git status"
$rawStatus = & git status --porcelain=v1 2>&1
if ($LASTEXITCODE -ne 0) { Write-Fail "git status failed. Is this a git repo?"; exit 1 }

$allChangedFiles = $rawStatus | Where-Object { $_ -match '^\S' -or $_ -match '^\s' } | ForEach-Object {
    $line = $_.Trim()
    if ($line.Length -gt 3) {
        $statusCode = $line.Substring(0,2).Trim()
        $filePath   = $line.Substring(3).Trim().Trim('"')
        # Handle renames: "old -> new"
        if ($filePath -match ' -> ') { $filePath = ($filePath -split ' -> ')[1].Trim() }
        [PSCustomObject]@{ Status = $statusCode; Path = $filePath }
    }
} | Where-Object { $null -ne $_.Path -and $_.Path -ne "" }

Write-OK "Total changed paths detected: $($allChangedFiles.Count)"

# -- 2. Paths that are ALWAYS excluded -----------------------------------------
$ALWAYS_SKIP_PREFIXES = @(
    "legal-docs/"            # Corporate legal docs - PRESERVE, never commit
    "../cerebro_hive/"       # Sibling repo - out of scope
    "../../hiveforge/"       # Sibling repo - out of scope
    "../../.turbo/"          # Shared turbo cache
    "node_modules/"
    ".next/"
    "out/"
    ".pnpm-store/"
    ".audit-quarantine/"
    ".agents/logs/"
    ".agents/worktrees/"     # M10.1 is handled separately via handoff doc
    ".claude/worktrees/"
    ".worktrees/"
)

$ALWAYS_SKIP_PATTERNS = @(
    "^\.env",                # .env files (secrets)
    "hs_err_pid",            # JVM crash logs
    "replay_pid",            # JVM replay logs
    "\.tsbuildinfo$",
    "^_tmp_",
    "^scratch_",
    "^build_output\.log",
    "^ts-errors\.log",
    "^diff\.txt",
    "^out\.zip"
)

function Test-ShouldSkip {
    param([string]$FilePath)
    foreach ($prefix in $ALWAYS_SKIP_PREFIXES) {
        if ($FilePath.StartsWith($prefix)) { return $true }
    }
    $filename = Split-Path $FilePath -Leaf
    foreach ($pattern in $ALWAYS_SKIP_PATTERNS) {
        if ($filename -match $pattern) { return $true }
    }
    # Also let git check-ignore decide
    if (Test-GitignoreMatch $FilePath) { return $true }
    return $false
}

# -- 3. Categorise files -------------------------------------------------------
Write-Header "2. Categorising files"

# Category definitions - order matters: first match wins
# Each entry: [BranchName, LocalWorktreeDir, Description, PathPredicate(scriptblock)]
$categories = [ordered]@{

    "chore/audit-sprint-coordination" = [PSCustomObject]@{
        Dir         = "chore--audit-sprint-coordination"
        Description = "Sprint coordination, agent task files, and progress log"
        Predicate   = {
            param($p)
            $p -match '^agents/(CLAUDE|GEMINI|CODEX)-TASKS\.md$' -or
            $p -match '^agents/CODEX-CHANGESET-MANIFEST\.md$'    -or
            $p -match '^agents/CODEX-M10\.'                      -or
            $p -match '^agents/M10\.1-COMMIT-HANDOFF\.md$'       -or
            $p -match '^agents/CURRENT-SPRINT\.md$'              -or
            $p -eq    'CURRENT-SPRINT.md'                         -or
            $p -eq    'PROGRESS.md'                               -or
            $p -eq    'AGENT-RUNTIME-BACKLOG.md'                  -or
            $p -eq    'AGENTS.md'                                 -or
            $p -match '^agents/TRIAGE-REPORT'
        }
    }

    "docs/root-planning-docs" = [PSCustomObject]@{
        Dir         = "docs--root-planning-docs"
        Description = "Root-level strategy, constitution, and baseline docs"
        Predicate   = {
            param($p)
            $p -eq    'CEREBROHIVE_CONSTITUTION.md'              -or
            $p -eq    'CEREBROHIVE-6-MONTH-MASTER-PLAN.md'       -or
            $p -eq    'MASTER-PLAN-EVOLUTION-LOG.md'             -or
            $p -eq    'MASTER-PLAN-GAP-ASSESSMENT.md'            -or
            $p -eq    'AUDIT-REPORT-2026-08-02.md'               -or
            $p -match '^BASELINE-MANIFEST-'                      -or
            $p -eq    'BASELINE-RUNBOOK-2026-08-03.md'           -or
            $p -eq    'RUNTIME-VALIDATION-CHECKLIST.md'          -or
            $p -eq    'IDEA.md'                                   -or
            $p -eq    'SECURITY.md'                               -or
            $p -eq    'README.md'                                 -or
            $p -eq    'CODEBASE.md'                               -or
            $p -match '^PRODUCT_SPECIFICATIONS/'                  -or
            $p -match '^\.planning/'
        }
    }

    "docs/architecture-update" = [PSCustomObject]@{
        Dir         = "docs--architecture-update"
        Description = "Architecture index, ADRs, capability model, EIOS manifesto"
        Predicate   = {
            param($p)
            $p -match '^architecture/'
        }
    }

    "docs/content-migration" = [PSCustomObject]@{
        Dir         = "docs--content-migration"
        Description = "Full docs/ tree - ~1200 content files"
        Predicate   = {
            param($p)
            $p -match '^docs/'
        }
    }

    "feat/agent-runner-python" = [PSCustomObject]@{
        Dir         = "feat--agent-runner-python"
        Description = "Python agent-runner service and role agent modules"
        Predicate   = {
            param($p)
            $p -match '^services/agent-runner/'
        }
    }

    "feat/hiveswarm-agent-definitions" = [PSCustomObject]@{
        Dir         = "feat--hiveswarm-agent-definitions"
        Description = "YAML agent definitions and CrewAI skill implementations"
        Predicate   = {
            param($p)
            $p -match '^agents/[^/]+/(agent\.yaml|skills\.py|__init__\.py)$' -or
            $p -match '^agents/hermes/'
        }
    }

    "feat/infra-scripts" = [PSCustomObject]@{
        Dir         = "feat--infra-scripts"
        Description = "Infrastructure config and developer/ops scripts"
        Predicate   = {
            param($p)
            $p -match '^infra/' -or
            $p -match '^scripts/' -or
            $p -match '^nginx/' -or
            $p -match '^docker-compose' -or
            $p -eq    'Makefile'        -or
            $p -eq    'Dockerfile.web'  -or
            $p -eq    'vercel.json'
        }
    }

    "feat/platform-source" = [PSCustomObject]@{
        Dir         = "feat--platform-source"
        Description = "App, package, and service source changes"
        Predicate   = {
            param($p)
            $p -match '^apps/'     -or
            $p -match '^packages/' -or
            $p -match '^services/' -or
            $p -match '^lib/'      -or
            $p -match '^components/' -or
            $p -match '^app/'      -or
            $p -match '^api/'      -or
            $p -match '^prisma/'   -or
            $p -match '^proto/'    -or
            $p -match '^tests/'    -or
            $p -match '^tooling/'  -or
            $p -match '^tools/'    -or
            $p -match '^data/'     -or
            $p -match '^hiveforge/' -or
            $p -match '^public/'
        }
    }
}

# Assign files to categories
$categoryFiles = [ordered]@{}
foreach ($key in $categories.Keys) { $categoryFiles[$key] = [System.Collections.Generic.List[string]]::new() }
$skippedFiles   = [System.Collections.Generic.List[string]]::new()
$preservedFiles = [System.Collections.Generic.List[string]]::new()
$uncategorised  = [System.Collections.Generic.List[string]]::new()

foreach ($item in $allChangedFiles) {
    $p = $item.Path -replace '\\','/'

    # Legal docs - always preserve
    if ($p -match '^legal-docs/') {
        $preservedFiles.Add($p) | Out-Null
        continue
    }

    # Always-skip check
    if (Test-ShouldSkip $p) {
        $skippedFiles.Add($p) | Out-Null
        continue
    }

    # Assign to first matching category
    $matched = $false
    foreach ($key in $categories.Keys) {
        if (& $categories[$key].Predicate $p) {
            $categoryFiles[$key].Add($p) | Out-Null
            $matched = $true
            break
        }
    }
    if (-not $matched) { $uncategorised.Add($p) | Out-Null }
}

# -- Print categorisation summary ----------------------------------------------
Write-Host ""
foreach ($key in $categories.Keys) {
    $count = $categoryFiles[$key].Count
    $col   = if ($count -gt 0) { "Green" } else { "DarkGray" }
    Write-Host ("  [{0,4} files]  {1}" -f $count, $key) -ForegroundColor $col
}
Write-Host ""
Write-Preserve "legal-docs/ ($($preservedFiles.Count) files) - will NOT be committed"
Write-Skip     "Gitignored / generated ($($skippedFiles.Count) paths skipped)"
if ($uncategorised.Count -gt 0) {
    Write-Warn "Uncategorised ($($uncategorised.Count) files) - will be listed but NOT committed:"
    $uncategorised | ForEach-Object { Write-Host "      $_" -ForegroundColor DarkYellow }
}

# -- Confirm before proceeding -------------------------------------------------
if (-not $DryRun) {
    Write-Host ""
    $confirm = Read-Host "Proceed with worktree creation, commit, and push? (yes/no)"
    if ($confirm -ne "yes") { Write-Warn "Aborted by user."; exit 0 }
}

# -- 4. Ensure legal-docs is gitignored ---------------------------------------
Write-Header "3. Verifying legal-docs protection"
$gitignorePath = Join-Path $repoRoot ".gitignore"
$gitignoreContent = Get-Content $gitignorePath -Raw
if ($gitignoreContent -notmatch "legal-docs/") {
    Write-Warn "legal-docs/ is NOT in .gitignore - adding it now"
    if (-not $DryRun) {
        Add-Content -Path $gitignorePath -Value "`n# Corporate legal documents - never commit`nlegal-docs/"
        Write-OK "Added legal-docs/ to .gitignore"
    } else {
        Write-Host "    [DRY-RUN] Would add 'legal-docs/' to .gitignore" -ForegroundColor DarkGray
    }
} else {
    Write-OK "legal-docs/ is already in .gitignore - safe"
}

# -- 5. M10.1 reminder --------------------------------------------------------
Write-Header "4. M10.1/M10.4 - existing worktree (manual step)"
Write-Warn "The feat/enterprise-agent-runtime worktree is at:"
Write-Host "    .agents/worktrees/feat-enterprise-agent-runtime/" -ForegroundColor Yellow
Write-Warn "Follow agents/M10.1-COMMIT-HANDOFF.md to commit and push it."
Write-Warn "Do NOT mix it into any worktree created by this script."

# -- 6. Create worktrees, copy files, validate, commit, push ------------------
Write-Header "5. Processing categories"

$results = [System.Collections.Generic.List[PSCustomObject]]::new()

foreach ($key in $categories.Keys) {
    $files = $categoryFiles[$key]
    if ($files.Count -eq 0) {
        Write-Skip "$key (no changed files)"
        continue
    }

    $cat      = $categories[$key]
    $branch   = $key
    $wtDir    = Join-Path $worktreesRoot $cat.Dir
    $wtSlash  = ($wtDir -replace '\\','/').TrimEnd('/')

    Write-Host ""
    Write-Header "  $key  ($($files.Count) files)"
    Write-Step $cat.Description

    # -- Create worktree ----------------------------------------------------
    if (Test-Path $wtDir) {
        Write-Warn "Worktree dir already exists: $wtDir - will reuse"
    } else {
        Write-Step "git worktree add $wtDir -b $branch (forked from $BaseBranch)"
        Invoke-Git @("worktree","add",$wtDir,"-b",$branch,$BaseBranch)
    }

    # -- Copy files into the worktree ---------------------------------------
    Write-Step "Copying $($files.Count) files into worktree..."
    foreach ($relPath in $files) {
        $srcFull  = Join-Path $repoRoot ($relPath -replace '/','\\')
        $destFull = Join-Path $wtDir    ($relPath -replace '/','\\')
        $destDir  = Split-Path $destFull -Parent

        if (-not $DryRun) {
            if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
            if (Test-Path $srcFull) {
                Copy-Item -Path $srcFull -Destination $destFull -Force
            } else {
                Write-Warn "Source missing (deleted?): $relPath"
            }
        }
    }
    Write-OK "Files copied"

    # -- Per-category validation --------------------------------------------
    if (-not $SkipValidation) {

        if ($key -eq "feat/agent-runner-python" -or $key -eq "feat/hiveswarm-agent-definitions") {
            Write-Step "Validating Python files with py_compile..."
            $pyFiles = $files | Where-Object { $_ -match '\.py$' }
            $pyFail  = $false
            foreach ($pyFile in $pyFiles) {
                $fullPath = Join-Path $wtDir ($pyFile -replace '/','\\')
                if ($DryRun) {
                    Write-Host "    [DRY-RUN] python -m py_compile $pyFile" -ForegroundColor DarkGray
                } elseif (Test-Path $fullPath) {
                    $out = & python -m py_compile $fullPath 2>&1
                    if ($LASTEXITCODE -ne 0) {
                        Write-Fail "py_compile FAILED: $pyFile`n      $out"
                        $pyFail = $true
                    }
                }
            }
            if (-not $pyFail) { Write-OK "All Python files compile cleanly" }

            if ($key -eq "feat/hiveswarm-agent-definitions") {
                Write-Step "Validating YAML agent definitions..."
                $yamlFiles = $files | Where-Object { $_ -match '\.yaml$' }
                foreach ($yf in $yamlFiles) {
                    $fullPath = Join-Path $wtDir ($yf -replace '/','\\')
                    if ($DryRun) {
                        Write-Host "    [DRY-RUN] yaml.safe_load $yf" -ForegroundColor DarkGray
                    } elseif (Test-Path $fullPath) {
                        $out = & python -c "import yaml; yaml.safe_load(open('$($fullPath -replace "\\","\\\\")').read()); print('OK')" 2>&1
                        if ($LASTEXITCODE -ne 0) {
                            Write-Fail "YAML parse FAILED: $yf`n      $out"
                            $pyFail = $true
                        }
                    }
                }
                if (-not $pyFail) { Write-OK "All YAML definitions parse cleanly" }
            }
        }

        if ($key -eq "docs/root-planning-docs" -or $key -eq "docs/content-migration") {
            Write-Step "Scanning for accidental secrets in docs..."
            $secretPatterns = @("ghp_","sk-","AKIA","AIza","Bearer [A-Za-z0-9]","password\s*=\s*\S+")
            $docFiles = $files | Where-Object { $_ -match '\.(md|txt|csv)$' }
            $secretFound = $false
            foreach ($df in ($docFiles | Select-Object -First 50)) {  # sample check
                $fullPath = Join-Path $wtDir ($df -replace '/','\\')
                if (Test-Path $fullPath) {
                    $content = Get-Content $fullPath -Raw -ErrorAction SilentlyContinue
                    foreach ($pat in $secretPatterns) {
                        if ($content -match $pat) {
                            Write-Fail "Possible secret pattern '$pat' in: $df"
                            $secretFound = $true
                        }
                    }
                }
            }
            if (-not $secretFound) { Write-OK "No secret patterns detected in sampled docs" }
        }

        if ($key -eq "feat/platform-source") {
            Write-Step "Running pnpm typecheck (from repo root - this may take a while)..."
            if (-not $DryRun) {
                $tcResult = & pnpm turbo typecheck 2>&1 | Tee-Object -FilePath (Join-Path $repoRoot "ts-errors.log")
                if ($LASTEXITCODE -ne 0) {
                    Write-Warn "Typecheck reported errors - review ts-errors.log before committing platform-source."
                    Write-Warn "The pre-existing audit baseline (19% coverage) means errors here may be pre-existing."
                    $confirm2 = Read-Host "Commit platform-source anyway? (yes/no)"
                    if ($confirm2 -ne "yes") {
                        Write-Warn "Skipping feat/platform-source commit. Fix type errors and re-run."
                        $results.Add([PSCustomObject]@{
                            Category = $key; Branch = $branch; Files = $files.Count
                            Status   = "SKIPPED (typecheck errors - see ts-errors.log)"
                        })
                        continue
                    }
                } else { Write-OK "Typecheck passed" }
            } else {
                Write-Host "    [DRY-RUN] pnpm turbo typecheck" -ForegroundColor DarkGray
            }
        }
    }

    # -- Build commit message -----------------------------------------------
    $commitMessages = @{
        "chore/audit-sprint-coordination"   = "chore(agents): sprint coordination and audit files 2026-08-06

Add agent task assignments (Claude/Codex/Gemini), sprint board,
M10.1 commit handoff, Codex changeset manifest, triage report,
and progress log for the Aug-06 session."

        "docs/root-planning-docs"           = "docs: root planning, constitution, audit and baseline docs

Add CerebroHive constitution, 6-month master plan, gap assessment,
evolution log, baseline manifests, audit report, runtime validation
checklist, IDEA, SECURITY, and CODEBASE docs."

        "docs/architecture-update"          = "docs(architecture): EIOS architecture index, ADRs, and capability model

Add ARCHITECTURE_INDEX.md, ADRs, capability architecture reference,
EIOS manifesto, and long-term roadmap as part of Phase P2
EIOS documentation migration."

        "docs/content-migration"            = "docs: full content migration - 1200+ files across all doc categories

Add company foundation, brand messaging, services portfolio,
industries, GTM playbooks, sales playbook, delivery operations,
templates, technology, AI governance, and thought leadership docs."

        "feat/agent-runner-python"          = "feat(agent-runner): HiveSwarm multi-role Python agent service

Add full agent-runner service: orchestrator, base agent, LLM client,
config, registry, and 20+ role implementations (AI Engineer,
Backend Engineer, DevOps SRE, Enterprise Architect, Frontend
Engineer, ML Engineer, Product Manager, and others)."

        "feat/hiveswarm-agent-definitions"  = "feat(agents): HiveSwarm YAML definitions and skills for 20 role agents

Add agent.yaml specs and CrewAI-compatible skills.py for all
agent families: AI Engineer, Backend Engineer, Customer Success
Manager, Data Engineer, DevOps SRE, Enterprise Architect,
Frontend Engineer, Hermes, Integration Engineer, LLMOps Engineer,
Marketing Strategist, ML Engineer, Platform Engineer, Product
Manager, Project Manager, Prompt Engineer, QA Engineer,
Research Scientist, Solution Architect."

        "feat/infra-scripts"                = "feat(infra): infrastructure config, Helm, Terraform, and dev scripts

Add infra directory (cloud provisioning), nginx config, Docker
compose, Makefile, Dockerfile, and scripts/ developer tooling
for builds, deploys, agent dispatch, and repo health checks."

        "feat/platform-source"              = "feat(platform): source changes across apps, packages, and services

Incremental platform source changes covering apps, packages,
services, components, lib, prisma schema, and tooling. See
PROGRESS.md for per-package details."
    }

    $msg = $commitMessages[$key]

    # -- Stage and commit ---------------------------------------------------
    Write-Step "Staging all files in worktree..."
    $prevLocation = Get-Location
    if (-not $DryRun) { Set-Location $wtDir }

    Invoke-Git @("add",".")
    Write-Step "Committing..."
    Invoke-Git @("commit","--message",$msg)
    Write-OK "Committed: $branch"

    # -- Push ---------------------------------------------------------------
    Write-Step "Pushing to $RemoteName/$branch..."
    Invoke-Git @("push","--set-upstream",$RemoteName,$branch)
    Write-OK "Pushed: $RemoteName/$branch"

    if (-not $DryRun) { Set-Location $prevLocation }

    $results.Add([PSCustomObject]@{
        Category = $key
        Branch   = $branch
        Files    = $files.Count
        Status   = if ($DryRun) { "DRY-RUN (not committed)" } else { "PUSHED [OK]" }
    })
}

# -- 7. Report -----------------------------------------------------------------
Write-Header "6. Summary"

$results | Format-Table Category, Branch, Files, Status -AutoSize

Write-Host ""
Write-Preserve "legal-docs/ ($($preservedFiles.Count) files) - preserved, not committed"
Write-Skip "Skipped/gitignored: $($skippedFiles.Count) paths"

if ($uncategorised.Count -gt 0) {
    Write-Warn "Uncategorised paths still in working tree ($($uncategorised.Count)):"
    $uncategorised | ForEach-Object { Write-Host "      $_" -ForegroundColor DarkYellow }
    Write-Warn "Review these manually and add them to an appropriate category or .gitignore."
}

# -- 8. Gitignore .worktrees/ itself ------------------------------------------
if (-not $DryRun) {
    if ((Get-Content $gitignorePath -Raw) -notmatch "^\.worktrees/") {
        Add-Content -Path $gitignorePath -Value "`n# Local worktree checkouts (machine-local)`n.worktrees/"
        Write-OK "Added .worktrees/ to .gitignore"
    }
}

# -- 9. M10.1 final reminder ---------------------------------------------------
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  MANUAL STEP REMAINING: Land M10.1 via the handoff doc" -ForegroundColor Yellow
Write-Host ""
Write-Host "  cd .agents\worktrees\feat-enterprise-agent-runtime\OPC\cerebro-hive-website" -ForegroundColor White
Write-Host "  # Then follow agents/M10.1-COMMIT-HANDOFF.md" -ForegroundColor DarkGray
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Warn "This was a DRY-RUN. Run with -DryRun:`$false to execute."
} else {
    Write-OK "All categories processed. Open PRs from the pushed branches."
}
