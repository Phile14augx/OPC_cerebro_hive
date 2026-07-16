package archive

import (
	"context"

	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/database/sqlc"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Repository defines the data access methods for the archive domain
type Repository interface {
	RunInTransaction(ctx context.Context, fn func(txRepo Repository) error) error
	CreateDocument(ctx context.Context, params sqlc.CreateDocumentParams) (sqlc.ArchiveDocument, error)
	InsertOutboxEvent(ctx context.Context, params sqlc.InsertOutboxEventParams) error
}

type postgresRepository struct {
	db      *pgxpool.Pool
	queries *sqlc.Queries
}

func NewPostgresRepository(db *pgxpool.Pool) Repository {
	return &postgresRepository{
		db:      db,
		queries: sqlc.New(db),
	}
}

func (r *postgresRepository) RunInTransaction(ctx context.Context, fn func(txRepo Repository) error) error {
	// Begin tx, defer rollback, execute fn, commit
	return nil
}

func (r *postgresRepository) CreateDocument(ctx context.Context, params sqlc.CreateDocumentParams) (sqlc.ArchiveDocument, error) {
	// return r.queries.CreateDocument(ctx, params)
	return sqlc.ArchiveDocument{ID: "dummy-id"}, nil
}

func (r *postgresRepository) InsertOutboxEvent(ctx context.Context, params sqlc.InsertOutboxEventParams) error {
	// return r.queries.InsertOutboxEvent(ctx, params)
	return nil
}
