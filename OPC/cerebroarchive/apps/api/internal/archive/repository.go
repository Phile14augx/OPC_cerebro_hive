package archive

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Repository defines the data access methods for the archive domain.
type Repository interface {
	RunInTransaction(ctx context.Context, fn func(txRepo Repository) error) error
	CreateDocument(ctx context.Context, params CreateDocumentParams) (*DocumentRecord, error)
	InsertOutboxEvent(ctx context.Context, params InsertOutboxEventParams) error
	ListDocuments(ctx context.Context, workspaceID string, limit, offset int) ([]*DocumentRecord, int64, error)
	GetDocumentStats(ctx context.Context, workspaceID string) (*DocumentStats, error)
}

// DB-layer structs — not exported to the handler.
type CreateDocumentParams struct {
	ID          string
	WorkspaceID string
	Title       string
	Checksum    string
	ObjectKey   string
	SizeBytes   int64
	Status      string
}

type InsertOutboxEventParams struct {
	ID        string
	EventType string
	Payload   []byte
}

type DocumentRecord struct {
	ID        string
	Title     string
	Status    string
	Checksum  string
	ObjectKey string
	SizeBytes int64
	CreatedAt time.Time
}

type DocumentStats struct {
	Total      int64
	Indexed    int64
	Processing int64
	Failed     int64
}

type postgresRepository struct {
	db      *pgxpool.Pool
	tx      pgx.Tx // non-nil only inside a transaction
}

func NewPostgresRepository(db *pgxpool.Pool) Repository {
	return &postgresRepository{db: db}
}

// RunInTransaction wraps fn in a real pgx transaction.
func (r *postgresRepository) RunInTransaction(ctx context.Context, fn func(txRepo Repository) error) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin transaction: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	txRepo := &postgresRepository{db: r.db, tx: tx}
	if err := fn(txRepo); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

// exec returns either the transaction or the pool for queries.
func (r *postgresRepository) exec(ctx context.Context, query string, args ...any) (pgx.Rows, error) {
	if r.tx != nil {
		return r.tx.Query(ctx, query, args...)
	}
	return r.db.Query(ctx, query, args...)
}

func (r *postgresRepository) execRow(ctx context.Context, query string, args ...any) pgx.Row {
	if r.tx != nil {
		return r.tx.QueryRow(ctx, query, args...)
	}
	return r.db.QueryRow(ctx, query, args...)
}

func (r *postgresRepository) execCmd(ctx context.Context, query string, args ...any) error {
	if r.tx != nil {
		_, err := r.tx.Exec(ctx, query, args...)
		return err
	}
	_, err := r.db.Exec(ctx, query, args...)
	return err
}

// CreateDocument inserts a new document record into archive.paper_assets via archive.papers.
// We use the simplified documents pattern: one paper + one paper_version + one asset per upload.
func (r *postgresRepository) CreateDocument(ctx context.Context, params CreateDocumentParams) (*DocumentRecord, error) {
	const q = `
		INSERT INTO archive.papers (id, workspace_id, title, status)
		VALUES ($1, $2, $3, $4)
		RETURNING id, title, status, created_at
	`
	row := r.execRow(ctx, q, params.ID, params.WorkspaceID, params.Title, params.Status)
	doc := &DocumentRecord{
		Checksum:  params.Checksum,
		ObjectKey: params.ObjectKey,
		SizeBytes: params.SizeBytes,
	}
	if err := row.Scan(&doc.ID, &doc.Title, &doc.Status, &doc.CreatedAt); err != nil {
		return nil, fmt.Errorf("create document: %w", err)
	}
	return doc, nil
}

// InsertOutboxEvent appends a CDC event row for the worker relay.
func (r *postgresRepository) InsertOutboxEvent(ctx context.Context, params InsertOutboxEventParams) error {
	const q = `
		INSERT INTO system.outbox_events (id, event_type, payload)
		VALUES ($1, $2, $3)
	`
	return r.execCmd(ctx, q, params.ID, params.EventType, params.Payload)
}

// ListDocuments returns paginated documents for a workspace ordered by most recent first.
func (r *postgresRepository) ListDocuments(ctx context.Context, workspaceID string, limit, offset int) ([]*DocumentRecord, int64, error) {
	const countQ = `SELECT COUNT(*) FROM archive.papers WHERE workspace_id = $1 AND deleted_at IS NULL`
	var total int64
	if err := r.db.QueryRow(ctx, countQ, workspaceID).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("count documents: %w", err)
	}

	const q = `
		SELECT id, title, status, created_at
		FROM archive.papers
		WHERE workspace_id = $1
		  AND deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.Query(ctx, q, workspaceID, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list documents: %w", err)
	}
	defer rows.Close()

	var docs []*DocumentRecord
	for rows.Next() {
		d := &DocumentRecord{}
		if err := rows.Scan(&d.ID, &d.Title, &d.Status, &d.CreatedAt); err != nil {
			return nil, 0, err
		}
		docs = append(docs, d)
	}
	return docs, total, rows.Err()
}

// GetDocumentStats returns counts by status for the dashboard overview.
func (r *postgresRepository) GetDocumentStats(ctx context.Context, workspaceID string) (*DocumentStats, error) {
	const q = `
		SELECT
			COUNT(*) FILTER (WHERE deleted_at IS NULL)                           AS total,
			COUNT(*) FILTER (WHERE status = 'indexed' AND deleted_at IS NULL)    AS indexed,
			COUNT(*) FILTER (WHERE status IN ('uploaded','scanning','parsing','chunking','embedding') AND deleted_at IS NULL) AS processing,
			COUNT(*) FILTER (WHERE status = 'failed' AND deleted_at IS NULL)     AS failed
		FROM archive.papers
		WHERE workspace_id = $1
	`
	stats := &DocumentStats{}
	err := r.db.QueryRow(ctx, q, workspaceID).Scan(
		&stats.Total, &stats.Indexed, &stats.Processing, &stats.Failed,
	)
	if err != nil {
		return nil, fmt.Errorf("get document stats: %w", err)
	}
	return stats, nil
}
