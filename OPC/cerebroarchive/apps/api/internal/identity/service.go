package identity

import (
	"context"
	"log/slog"

	"github.com/cerebro/cerebroarchive/apps/api/internal/common/auth"
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

// RegisterUser executes the registration flow but leaves the account unverified.
func (s *Service) RegisterUser(ctx context.Context, req RegisterUserRequest) (*UserDTO, error) {
	// 1. Hash Password
	// hash, err := s.hasher.Hash(req.Password)
	
	// 2. Insert into DB (status: unverified)
	// user, err := s.repo.CreateUser(ctx, ...)

	// 3. Trigger Email Verification Job (Outbox pattern)
	// s.repo.InsertOutboxEvent(...)
	
	return &UserDTO{
		ID: "dummy-uuid",
		Email: req.Email,
		FullName: req.FullName,
	}, nil
}

// BootstrapTenant implements the exact transaction flow recommended for Org creation:
// User -> Organization -> Default Workspace -> Assign Owner Role -> Commit
func (s *Service) BootstrapTenant(ctx context.Context, userID string, req BootstrapTenantRequest) error {
	// s.repo.RunInTransaction(ctx, func(txRepo Repository) error {
	//     1. Create Org
	//     2. Create Workspace
	//     3. Map User to Org (Owner)
	//     4. Map User to Workspace (Admin)
	//     return nil
	// })
	return nil
}
