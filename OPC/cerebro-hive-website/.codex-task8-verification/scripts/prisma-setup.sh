#!/bin/bash
# ==============================================================================
# CerebroHive Prisma Setup Script (Bash/Linux/Mac)
# ==============================================================================
# This script initializes Prisma with Docker-based PostgreSQL + pgvector

set -e  # Exit on error

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DATABASE_PACKAGE="$PROJECT_ROOT/packages/database"
DOCKER_COMPOSE_PATH="$PROJECT_ROOT/docker-compose.yml"

# Colors for output
CYAN='\033[0;36m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ─────────────────────────────────────────────────────────────────────────────
# Helper Functions
# ─────────────────────────────────────────────────────────────────────────────

write_header() {
    echo -e "\n${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║ $1${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
}

write_step() {
    echo -e "${GREEN}  ➜ $1${NC}"
}

write_info() {
    echo -e "${BLUE}  ℹ $1${NC}"
}

write_error() {
    echo -e "${RED}  ✗ $1${NC}"
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1: Start Database
# ─────────────────────────────────────────────────────────────────────────────

start_database() {
    write_header "STEP 1: Starting PostgreSQL + pgvector"
    
    write_step "Starting database container..."
    cd "$PROJECT_ROOT"
    docker compose up -d db redis
    
    write_step "Waiting for database to be healthy (30-60 seconds)..."
    
    local max_retries=60
    local retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        if docker compose exec db pg_isready -U cerebrohive >/dev/null 2>&1; then
            write_step "✓ Database is healthy!"
            return 0
        fi
        
        echo -n "."
        sleep 1
        ((retry_count++))
    done
    
    write_error "Database failed to start after 60 seconds"
    return 1
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2: Generate Prisma Client
# ─────────────────────────────────────────────────────────────────────────────

generate_prisma_client() {
    write_header "STEP 2: Generating Prisma Client"
    
    write_step "Navigating to database package: $DATABASE_PACKAGE"
    cd "$DATABASE_PACKAGE"
    
    write_step "Running: npm run generate"
    npm run generate
    
    if [ $? -ne 0 ]; then
        write_error "Failed to generate Prisma client"
        return 1
    fi
    
    write_step "✓ Prisma client generated successfully"
    return 0
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 3: Create Initial Baseline Migration
# ─────────────────────────────────────────────────────────────────────────────

create_baseline_migration() {
    write_header "STEP 3: Creating Initial Baseline Migration"
    
    cd "$DATABASE_PACKAGE"
    
    write_step "Checking existing migrations..."
    local migrations_dir="$DATABASE_PACKAGE/prisma/migrations"
    
    if [ -d "$migrations_dir" ]; then
        local migration_count=$(find "$migrations_dir" -maxdepth 1 -type d ! -name "migrations" | wc -l)
        write_info "Found $migration_count existing migration(s)"
    else
        write_info "No migrations directory yet - will be created"
    fi
    
    write_step "Running: npm run migrate:dev -- --name initial_baseline"
    npm run migrate:dev -- --name initial_baseline
    
    if [ $? -ne 0 ]; then
        write_error "Failed to create migration"
        return 1
    fi
    
    write_step "✓ Migration created successfully"
    return 0
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 4: Verify Setup
# ─────────────────────────────────────────────────────────────────────────────

verify_setup() {
    write_header "STEP 4: Verifying Setup"
    
    cd "$PROJECT_ROOT"
    
    write_step "Checking database connection..."
    if ! docker compose exec db psql -U cerebrohive -d cerebrohive_db -c "\dt" >/dev/null 2>&1; then
        write_error "Failed to connect to database"
        return 1
    fi
    write_info "Database connected successfully"
    
    write_step "Checking pgvector extension..."
    if ! docker compose exec db psql -U cerebrohive -d cerebrohive_db -c "CREATE EXTENSION IF NOT EXISTS vector;" >/dev/null 2>&1; then
        write_error "pgvector extension failed"
        return 1
    fi
    write_info "pgvector extension available"
    
    return 0
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 5: Show Summary
# ─────────────────────────────────────────────────────────────────────────────

show_summary() {
    write_header "✓ Setup Complete!"
    
    write_info "Database: cerebrohive_db"
    write_info "User: cerebrohive"
    write_info "Port: 5433"
    write_info "Schema: public"
    
    echo -e "\n${YELLOW}  Next Steps:${NC}"
    echo -e "  ${BLUE}1. View Prisma Studio:  npm run studio -w @cerebro/database${NC}"
    echo -e "  ${BLUE}2. Deploy migrations:   npm run migrate:deploy -w @cerebro/database${NC}"
    echo -e "  ${BLUE}3. Seed data:          npm run prisma db seed -w @cerebro/database${NC}"
    echo ""
}

# ─────────────────────────────────────────────────────────────────────────────
# Show Help
# ─────────────────────────────────────────────────────────────────────────────

show_help() {
    write_header "CerebroHive Prisma Setup"
    
    cat << EOF
Usage: ./scripts/prisma-setup.sh [action]

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
  ./scripts/prisma-setup.sh setup

  # Just generate client
  ./scripts/prisma-setup.sh generate

  # Open Prisma Studio
  ./scripts/prisma-setup.sh studio
EOF
}

# ─────────────────────────────────────────────────────────────────────────────
# MAIN EXECUTION
# ─────────────────────────────────────────────────────────────────────────────

ACTION="${1:-help}"

case "$ACTION" in
    setup)
        if start_database && generate_prisma_client && create_baseline_migration && verify_setup; then
            show_summary
        fi
        ;;
    
    start-db)
        start_database
        ;;
    
    generate)
        generate_prisma_client
        ;;
    
    migrate)
        create_baseline_migration
        ;;
    
    verify)
        verify_setup
        ;;
    
    studio)
        write_header "Opening Prisma Studio"
        cd "$DATABASE_PACKAGE"
        npm run studio
        ;;
    
    reset)
        write_header "⚠ RESETTING DATABASE"
        echo -e "${RED}This will DELETE ALL DATA in cerebrohive_db${NC}"
        read -p "Type 'yes' to confirm: " confirm
        
        if [ "$confirm" = "yes" ]; then
            cd "$DATABASE_PACKAGE"
            npx prisma migrate reset --force
        else
            echo -e "${YELLOW}Reset cancelled${NC}"
        fi
        ;;
    
    *)
        show_help
        ;;
esac
