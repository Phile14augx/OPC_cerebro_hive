package identity

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"github.com/cerebro/cerebroarchive/apps/api/internal/common/auth"
	"github.com/google/uuid"
)

// Service encapsulates the business logic for the identity domain.
type Service struct {
	repo          Repository
	logger        *slog.Logger
	hasher        auth.PasswordHasher
	tokenProvider auth.TokenProvider
}

func NewService(repo Repository, logger *slog.Logger, hasher auth.PasswordHasher, tokenProvider auth.TokenProvider) *Service {
	return &Service{
		repo:          repo,
		logger:        logger,
		hasher:        hasher,
		tokenProvider: tokenProvider,
	}
}

// RegisterUser creates a new user account with a hashed password.
func (s *Service) RegisterUser(ctx context.Context, req RegisterUserRequest) (*UserDTO, error) {
	// 1. Hash password
	hash, err := s.hasher.Hash(req.Password)
	if err != nil {
		s.logger.Error("failed to hash password", "error", err)
		return nil, errors.New("internal error during registration")
	}

	// 2. Insert into DB
	user, err := s.repo.CreateUser(ctx, CreateUserParams{
		ID:           uuid.New().String(),
		Email:        req.Email,
		PasswordHash: hash,
		FullName:     req.FullName,
	})
	if err != nil {
		if errors.Is(err, ErrEmailTaken) {
			return nil, ErrEmailTaken
		}
		s.logger.Error("failed to create user", "error", err)
		return nil, errors.New("could not create account")
	}

	return &UserDTO{ID: user.ID, Email: user.Email, FullName: user.FullName}, nil
}

// LoginUser authenticates a user and returns a signed JWT.
func (s *Service) LoginUser(ctx context.Context, req LoginRequest) (*AuthResponse, error) {
	// 1. Load user record
	user, err := s.repo.FindUserByEmail(ctx, req.Email)
	if err != nil {
		return nil, ErrInvalidCreds
	}

	// 2. Check account status
	if !user.IsActive {
		return nil, ErrAccountLocked
	}

	// 3. Verify password
	if !s.hasher.Compare(user.PasswordHash, req.Password) {
		return nil, ErrInvalidCreds
	}

	// 4. Issue JWT (24-hour session)
	token, err := s.tokenProvider.GenerateToken(user.ID, uuid.New().String(), 1, 24*time.Hour)
	if err != nil {
		s.logger.Error("failed to generate token", "error", err)
		return nil, errors.New("internal error during login")
	}

	// 5. Update last login timestamp asynchronously
	go func() {
		if err := s.repo.UpdateLastLogin(context.Background(), user.ID); err != nil {
			s.logger.Warn("failed to update last_login_at", "user_id", user.ID, "error", err)
		}
	}()

	return &AuthResponse{
		AccessToken: token,
		User:        UserDTO{ID: user.ID, Email: user.Email, FullName: user.FullName},
	}, nil
}

// GetMe returns the current user profile by ID (used by /me endpoint).
func (s *Service) GetMe(ctx context.Context, userID string) (*UserDTO, error) {
	// In the future this will also resolve org/workspace from the claims.
	// For now, we do a direct DB lookup.
	user, err := s.repo.FindUserByEmail(ctx, userID) // TODO: add FindByID method
	if err != nil {
		return nil, ErrNotFound
	}
	return &UserDTO{ID: user.ID, Email: user.Email, FullName: user.FullName}, nil
}

// BootstrapTenant creates an org and default workspace for a new user.
func (s *Service) BootstrapTenant(ctx context.Context, userID string, req BootstrapTenantRequest) error {
	// Transactional org + workspace creation will be wired here.
	// Intentionally left as a stub until the organization tables are migrated.
	return nil
}
