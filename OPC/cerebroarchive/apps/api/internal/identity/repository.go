package identity

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Repository defines the data access layer for the identity domain.
type Repository interface {
	CreateUser(ctx context.Context, params CreateUserParams) (*UserRecord, error)
	FindUserByEmail(ctx context.Context, email string) (*UserRecord, error)
	UpdateLastLogin(ctx context.Context, userID string) error
}

// UserRecord is the internal DB representation — not exposed to the handler.
type UserRecord struct {
	ID           string
	Email        string
	PasswordHash string
	FullName     string
	IsActive     bool
	IsVerified   bool
	CreatedAt    time.Time
}

type CreateUserParams struct {
	ID           string
	Email        string
	PasswordHash string
	FullName     string
}

type repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) Repository {
	return &repository{db: db}
}

func (r *repository) CreateUser(ctx context.Context, params CreateUserParams) (*UserRecord, error) {
	const q = `
		INSERT INTO identity.users (id, email, password_hash, full_name)
		VALUES ($1, $2, $3, $4)
		RETURNING id, email, password_hash, full_name, is_active, is_verified, created_at
	`
	row := r.db.QueryRow(ctx, q,
		params.ID,
		params.Email,
		params.PasswordHash,
		params.FullName,
	)
	return scanUser(row)
}

func (r *repository) FindUserByEmail(ctx context.Context, email string) (*UserRecord, error) {
	const q = `
		SELECT id, email, password_hash, full_name, is_active, is_verified, created_at
		FROM identity.users
		WHERE email = $1
		  AND deleted_at IS NULL
		LIMIT 1
	`
	row := r.db.QueryRow(ctx, q, email)
	return scanUser(row)
}

func (r *repository) UpdateLastLogin(ctx context.Context, userID string) error {
	const q = `UPDATE identity.users SET last_login_at = NOW() WHERE id = $1`
	_, err := r.db.Exec(ctx, q, userID)
	return err
}

func scanUser(row pgx.Row) (*UserRecord, error) {
	u := &UserRecord{}
	err := row.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.FullName, &u.IsActive, &u.IsVerified, &u.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return u, nil
}

// Sentinel errors
var (
	ErrNotFound      = errors.New("record not found")
	ErrEmailTaken    = errors.New("email already registered")
	ErrInvalidCreds  = errors.New("invalid credentials")
	ErrAccountLocked = errors.New("account is inactive")
)
