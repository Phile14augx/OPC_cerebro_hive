-- 000004_create_identity_multi_tenant.down.sql

DROP TABLE IF EXISTS identity.team_members;
DROP TABLE IF EXISTS identity.workspace_members;
DROP TABLE IF EXISTS identity.organization_members;
DROP TABLE IF EXISTS identity.users;
DROP TABLE IF EXISTS identity.teams;
DROP TABLE IF EXISTS identity.workspaces;
DROP TABLE IF EXISTS identity.organizations;
