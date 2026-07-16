-- name: GetOrganization :one
SELECT * FROM identity.organizations
WHERE id = $1 LIMIT 1;

-- name: ListOrganizations :many
SELECT * FROM identity.organizations
ORDER BY name;

-- name: CreateOrganization :one
INSERT INTO identity.organizations (
  id, name, slug, domain
) VALUES (
  $1, $2, $3, $4
)
RETURNING *;
