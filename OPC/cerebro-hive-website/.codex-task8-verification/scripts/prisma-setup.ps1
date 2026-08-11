# ==============================================================================
# CerebroHive Prisma Setup Script
# ==============================================================================
# This script initializes Prisma with Docker-based PostgreSQL + pgvector

param(
    [string]$Action = "help"
)

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$DatabasePackage = Join-Path $ProjectRoot "packages\database"
$DockerComposePath = Join-Path $ProjectRoot "docker-compose.yml"

function Write-Header {
    param([string]$Message)
    Write-Host "`n===========================================================" -ForegroundColor Cyan
    Write-Host "  $($Message.PadRight(57))" -ForegroundColor Cyan
    Write-Host "===========================================================" -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Message)
    Write-Host "  > $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "  i $Message" -ForegroundColor Blue
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "  X $Message" -ForegroundColor Red
}

# -----------------------------------------------------------------------------
# STEP 1: Start Database
# -----------------------------------------------------------------------------

function Start-Database {
    Write-Header "STEP 1: Starting PostgreSQL + pgvector"
    
    Write-Step "Starting database container..."
    Push-Location $ProjectRoot
    docker compose up -d db redis
    Pop-Location
    
    Write-Step "Waiting for database to be healthy (30-60 seconds)..."
    
    $maxRetries = 60
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            $result = docker compose exec db pg_isready -U cerebrohive 2>$null
            if ($result -match "accepting connections") {
                Write-Step "OK Database is healthy!"
                return $true
            }
        } catch {
            # Continue trying
        }
        
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 1
        $retryCount++
    }
    
    Write-Error-Custom "Database failed to start after 60 seconds"
    return $false
}

# -----------------------------------------------------------------------------
# STEP 2: Generate Prisma Client
# -----------------------------------------------------------------------------

function Generate-PrismaClient {
    Write-Header "STEP 2: Generating Prisma Client"
    
    Write-Step "Navigating to database package: $DatabasePackage"
    Push-Location $DatabasePackage
    
    Write-Step "Running: npm run generate"
    npm run generate
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to generate Prisma client"
        Pop-Location
        return $false
    }
    
    Write-Step "OK Prisma client generated successfully"
    Pop-Location
    return $true
}

# -----------------------------------------------------------------------------
# STEP 3: Create Initial Baseline Migration
# -----------------------------------------------------------------------------

function Create-BaselineMigration {
    Write-Header "STEP 3: Creating Initial Baseline Migration"
    
    Push-Location $DatabasePackage
    
    Write-Step "Checking existing migrations..."
    $migrationsDir = Join-Path (Get-Location) "prisma\migrations"
    
    if (Test-Path $migrationsDir) {
        $migrationCount = (Get-ChildItem $migrationsDir -Directory | Measure-Object).Count
        Write-Info "Found $migrationCount existing migration(s)"
    } else {
        Write-Info "No migrations directory yet - will be created"
    }
    
    Write-Step "Running: npm run migrate:dev -- --name initial_baseline"
    npm run migrate:dev -- --name initial_baseline
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to create migration"
        Pop-Location
        return $false
    }
    
    Write-Step "OK Migration created successfully"
    Pop-Location
    return $true
}

# -----------------------------------------------------------------------------
# STEP 4: Verify Setup
# -----------------------------------------------------------------------------

function Verify-Setup {
    Write-Header "STEP 4: Verifying Setup"
    
    Push-Location $ProjectRoot
    
    Write-Step "Checking database connection..."
    try {
        $tableCount = docker compose exec db psql -U cerebrohive -d cerebrohive_db -c "\dt" 2>&1 | Measure-Object -Line
        Write-Info "Found tables in database"
    } catch {
        Write-Error-Custom "Failed to connect to database"
        Pop-Location
        return $false
    }
    
    Write-Step "Checking pgvector extension..."
    try {
        docker compose exec db psql -U cerebrohive -d cerebrohive_db -c "CREATE EXTENSION IF NOT EXISTS vector;" 2>&1 | Out-Null
        Write-Info "pgvector extension available"
    } catch {
        Write-Error-Custom "pgvector extension failed"
        Pop-Location
        return $false
    }
    
    Pop-Location
    return $true
}

# -----------------------------------------------------------------------------
# STEP 5: Show Summary
# -----------------------------------------------------------------------------

function Show-Summary {
    Write-Header "OK Setup Complete!"
    
    Write-Info "Database: cerebrohive_db"
    Write-Info "User: cerebrohive"
    Write-Info "Port: 5433"
    Write-Info "Schema: public"
    
    Write-Host "`n  Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. View Prisma Studio:  npm run studio -w @cerebro/database" -ForegroundColor Gray
    Write-Host "  2. Deploy migrations:   npm run migrate:deploy -w @cerebro/database" -ForegroundColor Gray
    Write-Host "  3. Seed data:          npm run prisma db seed -w @cerebro/database" -ForegroundColor Gray
    Write-Host ""
}

function Show-Help {
    Write-Header "CerebroHive Prisma Setup"
    
    Write-Host @"
Usage: .\scripts\prisma-setup.ps1 [Action]

Actions:
  setup        Initialize database, generate client, create baseline migration
  start-db     Start PostgreSQL + pgvector container
  generate     Generate Prisma client only
  migrate      Create and apply initial migration
  verify       Verify database connection and schema
  studio       Open Prisma Studio for schema visualization
  reset        Reset database (CAUTION: deletes all data)
  help         Show this help message

Examples:
  # Complete setup
  .\scripts\prisma-setup.ps1 setup

  # Just generate client
  .\scripts\prisma-setup.ps1 generate

  # Open Prisma Studio
  .\scripts\prisma-setup.ps1 studio
"@
}

# -----------------------------------------------------------------------------
# MAIN EXECUTION
# -----------------------------------------------------------------------------

switch ($Action.ToLower()) {
    "setup" {
        if (Start-Database) {
            if (Generate-PrismaClient) {
                if (Create-BaselineMigration) {
                    if (Verify-Setup) {
                        Show-Summary
                    }
                }
            }
        }
    }
    
    "start-db" {
        Start-Database | Out-Null
    }
    
    "generate" {
        Generate-PrismaClient | Out-Null
    }
    
    "migrate" {
        Create-BaselineMigration | Out-Null
    }
    
    "verify" {
        Verify-Setup | Out-Null
    }
    
    "studio" {
        Write-Header "Opening Prisma Studio"
        Push-Location $DatabasePackage
        npm run studio
        Pop-Location
    }
    
    "reset" {
        Write-Header "⚠ RESETTING DATABASE"
        Write-Host "This will DELETE ALL DATA in cerebrohive_db" -ForegroundColor Red
        $confirm = Read-Host "Type 'yes' to confirm"
        
        if ($confirm -eq "yes") {
            Push-Location $DatabasePackage
            npx prisma migrate reset --force
            Pop-Location
        } else {
            Write-Host "Reset cancelled" -ForegroundColor Yellow
        }
    }
    
    default {
        Show-Help
    }
}
