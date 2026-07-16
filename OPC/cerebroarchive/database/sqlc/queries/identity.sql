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

-- name: GetUserByEmail :one
SELECT * FROM identity.users
WHERE email = $1 LIMIT 1;

-- name: CreateUser :one
INSERT INTO identity.users (
  id, email, password_hash, full_name, avatar_url
) VALUES (
  $1, $2, $3, $4, $5
)
RETURNING *;
