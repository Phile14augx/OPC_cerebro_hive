-- CerebroHive Platform — PostgreSQL Domain Schemas Initialization
-- This script creates the named schemas for each platform domain.
-- All tables in each domain will be created inside their schema by
-- SQLAlchemy / Prisma migrations. This file only creates the namespaces.

-- Platform Foundation (Identity, Orgs, Auth, Billing, Audit)
CREATE SCHEMA IF NOT EXISTS platform;

-- CerebroArchive™ (Documents, Embeddings, Prompts, Models, Datasets)
CREATE SCHEMA IF NOT EXISTS archive;

-- HivePulse™ / Agent Runtime (Runs, Plans, Steps, Artifacts)
CREATE SCHEMA IF NOT EXISTS runtime;

-- CerebroStudio™ (Prompt Registry, Evaluation, Experiments)
CREATE SCHEMA IF NOT EXISTS studio;

-- CerebroFlow™ (Workflow Definitions, Execution History, Schedules)
CREATE SCHEMA IF NOT EXISTS flow;

-- CerebroCopilot™ (Conversations, Threads, Messages)
CREATE SCHEMA IF NOT EXISTS copilot;

-- CerebroInsight™ (Metrics, Dashboards, Reports)
CREATE SCHEMA IF NOT EXISTS insight;

-- HiveShield™ / Security (Policies, Approvals, Compliance)
CREATE SCHEMA IF NOT EXISTS security;

-- HiveOps™ (Deployments, Clusters, Cost Tracking)
CREATE SCHEMA IF NOT EXISTS hiveops;

-- Observability (Traces, Spans, Metrics)
CREATE SCHEMA IF NOT EXISTS observability;

-- Keycloak (created here so KC_DB_SCHEMA=keycloak works)
CREATE SCHEMA IF NOT EXISTS keycloak;

-- Grant all privileges on all schemas to the platform user
DO $$
DECLARE
  schema_name TEXT;
BEGIN
  FOREACH schema_name IN ARRAY ARRAY['platform','archive','runtime','studio','flow','copilot','insight','security','hiveops','observability','keycloak']
  LOOP
    EXECUTE format('GRANT ALL PRIVILEGES ON SCHEMA %I TO %I', schema_name, current_user);
    EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT ALL ON TABLES TO %I', schema_name, current_user);
  END LOOP;
END $$;
