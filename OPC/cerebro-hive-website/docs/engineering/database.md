# Prisma Setup Guide for CerebroHive

## Overview

Your CerebroHive project already has:
- ✓ Prisma schema (comprehensive 10-phase data model)
- ✓ pgvector extension for embeddings
- ✓ Docker-based PostgreSQL + pgvector database
- ✓ Database package in `packages/database`

## Quick Start

### Option 1: PowerShell (Windows)

```powershell
cd D:\{MY_PROJECTS}\{OPC_cerebro_hive}\OPC\cerebro-hive-website

# Run the complete setup
.\scripts\prisma-setup.ps1 setup

# Or individual steps:
.\scripts\prisma-setup.ps1 start-db      # Start database
.\scripts\prisma-setup.ps1 generate      # Generate Prisma client
.\scripts\prisma-setup.ps1 migrate       # Create migration
.\scripts\prisma-setup.ps1 studio        # Open Prisma Studio
.\scripts\prisma-setup.ps1 verify        # Verify setup
.\scripts\prisma-setup.ps1 reset         # Reset database (careful!)
```

### Option 2: Bash (Linux/Mac/WSL)

```bash
cd /d/{MY_PROJECTS}/{OPC_cerebro_hive}/OPC/cerebro-hive-website

# Run the complete setup
./scripts/prisma-setup.sh setup

# Or individual steps:
./scripts/prisma-setup.sh start-db      # Start database
./scripts/prisma-setup.sh generate      # Generate Prisma client
./scripts/prisma-setup.sh migrate       # Create migration
./scripts/prisma-setup.sh studio        # Open Prisma Studio
./scripts/prisma-setup.sh verify        # Verify setup
./scripts/prisma-setup.sh reset         # Reset database (careful!)
```

### Option 3: Manual Commands

#### 1. Start the database
```bash
cd OPC/cerebro-hive-website
docker compose up -d db redis
```

#### 2. Wait for health check
```bash
docker compose exec db pg_isready -U cerebrohive -h localhost
```

#### 3. Generate Prisma client
```bash
npm run prisma:generate
# or from database package:
cd packages/database
npm run generate
```

#### 4. Create baseline migration
```bash
cd packages/database
npm run migrate:dev -- --name initial_baseline
```

#### 5. Verify setup
```bash
# Check database tables
docker compose exec db psql -U cerebrohive -d cerebrohive_db -c "\dt"

# Enable pgvector extension
docker compose exec db psql -U cerebrohive -d cerebrohive_db -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Open Prisma Studio
npm run studio
```

---

## Database Configuration

**Database URL** (from `.env`):
```
postgresql://cerebrohive:[PASSWORD]@localhost:5433/cerebrohive_db?schema=public
```

**Credentials:**
- User: `cerebrohive`
- Password: `supersecretpassword123`
- Host: `localhost`
- Port: `5433`
- Database: `cerebrohive_db`

**Features:**
- pgvector extension enabled (for AI embeddings)
- pgcrypto extension enabled (for encryption)
- UUID primary keys (gen_random_uuid)

---

## Schema Overview

Your Prisma schema covers 10 phases:

1. **Phase 1: Platform Foundation** — Multi-tenancy, Users, Roles, API Keys, Sessions
2. **Phase 2: AI & Agent Domain** — Agents, Tools, Knowledge, Memory, Conversations
3. **Phase 3: Workflow Domain** — Workflows, Templates, Triggers, Schedules, Events
4. **Phase 4: Software Engineering** — Projects, Repos, Sprints, Modules, Requirements (CerebroForge)
5. **Phase 5: Knowledge & RAG** — Documents, Embeddings, Knowledge Graphs, Citations
6. **Phase 6: AI Model Management** — Providers, Models, Versions, Pricing
7. **Phase 7: Infrastructure** — Cloud Accounts, Regions, Resources, Deployments
8. **Phase 8: Observability** — Metrics, Traces, Logs, Alerts, Health Checks
9. **Phase 9: Marketplace** — Plugins, Extensions, Integrations, Connectors
10. **Phase 10: AI Software Factory** — Applications, Screens, APIs, DTOs, Services

---

## Common Tasks

### Regenerate Prisma Client
```bash
cd packages/database
npm run generate
```

### View Data in Studio
```bash
cd packages/database
npm run studio
# Opens http://localhost:5555
```

### Create a New Migration
```bash
cd packages/database
npm run migrate:dev -- --name describe_your_changes
```

### Deploy Migrations to Production
```bash
cd packages/database
npm run migrate:deploy
```

### Reset Database (Development Only)
```bash
cd packages/database
npx prisma migrate reset --force
```

### Inspect Database Directly
```bash
# Connect to PostgreSQL
docker compose exec db psql -U cerebrohive -d cerebrohive_db

# Common psql commands:
\dt              # List all tables
\d table_name    # Describe table
SELECT * FROM "User" LIMIT 5;  # Query data
\quit            # Exit
```

### Check pgvector Extension
```bash
docker compose exec db psql -U cerebrohive -d cerebrohive_db -c "\dx"
```

---

## Integration in Services

### Node.js Services (TypeScript)

```typescript
import { PrismaClient } from '@cerebro/database';

const prisma = new PrismaClient();

// Use in your service
const users = await prisma.user.findMany();
```

### Java Services

Use the generated Prisma client via REST or via ORM (consider Hibernate/JPA):

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.0</version>
</dependency>
```

### Python Services

Use SQLAlchemy or async drivers:

```python
from sqlalchemy import create_engine
import os

DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_engine(DATABASE_URL)
```

---

## Troubleshooting

### "Database connection refused"
```bash
# Check if db container is running
docker compose ps db

# Start it
docker compose up -d db

# Wait 30-60 seconds, then verify
docker compose exec db pg_isready -U cerebrohive
```

### "No schema has been created yet"
```bash
# Run migrations
cd packages/database
npm run migrate:dev
```

### "pgvector extension not found"
```bash
# Ensure you're using the pgvector image
docker compose down db
docker compose up -d db

# Then enable extension
docker compose exec db psql -U cerebrohive -d cerebrohive_db -c "CREATE EXTENSION vector;"
```

### "Port 5433 already in use"
```bash
# Kill the process using that port
# Windows:
netstat -ano | findstr :5433
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :5433
kill -9 <PID>

# Or change port in docker-compose.yml and .env
```

### "Permission denied on scripts"
```bash
# Make bash script executable
chmod +x scripts/prisma-setup.sh

# Or run with bash explicitly
bash scripts/prisma-setup.sh setup
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│      Your Application Services          │
│  (Node.js, Java, Python, Rust, C++)     │
└──────────────┬──────────────────────────┘
               │
               ├─ @cerebro/database (Prisma)
               │  ├─ schema.prisma (10 phases)
               │  └─ migrations/
               │
┌──────────────┴──────────────────────────┐
│    PostgreSQL (Docker - pgvector:pg16)  │
│  ┌────────────────────────────────────┐ │
│  │ Extensions:                        │ │
│  │  - pgvector (embeddings)           │ │
│  │  - pgcrypto (encryption)           │ │
│  │                                    │ │
│  │ Schemas:                           │ │
│  │  - public (all tables)             │ │
│  │  - keycloak (Keycloak auth)        │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Next Steps

1. ✓ **Start database** — `docker compose up -d db`
2. ✓ **Generate Prisma client** — `npm run prisma:generate`
3. ✓ **Create baseline migration** — `npm run migrate:dev -- --name initial_baseline`
4. 🔜 **Define seed data** — Create `packages/database/prisma/seed.ts`
5. 🔜 **Integrate in services** — Import PrismaClient in your service packages
6. 🔜 **Set up CI/CD** — Ensure migrations run in deployment pipelines
7. 🔜 **Add observability** — Monitor database queries via OTel

---

## References

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL pgvector](https://github.com/pgvector/pgvector)
- [Prisma Studio](https://www.prisma.io/studio)
- [Database URL Format](https://www.prisma.io/docs/reference/database-reference/connection-urls/postgresql)
