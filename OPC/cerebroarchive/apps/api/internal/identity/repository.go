package identity

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	// "github.com/cerebro/cerebroarchive/apps/api/internal/platform/database/sqlc"
)

// Repository defines the data access layer for the identity domain.
type Repository interface {
	// GetOrganization(ctx context.Context, id string) (sqlc.IdentityOrganization, error)
}

type repository struct {
	db *pgxpool.Pool
	// queries *sqlc.Queries // Will be injected when sqlc generated code exists
}

func NewRepository(db *pgxpool.Pool) Repository {
	return &repository{
		db: db,
		// queries: sqlc.New(db),
	}
}
