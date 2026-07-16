package identity

import (
	"log/slog"
)

// Service encapsulates the business logic for the identity domain.
type Service struct {
	repo   Repository
	logger *slog.Logger
}

func NewService(repo Repository, logger *slog.Logger) *Service {
	return &Service{
		repo:   repo,
		logger: logger,
	}
}

// Logic methods like CreateOrganization, InviteUser, etc. go here
