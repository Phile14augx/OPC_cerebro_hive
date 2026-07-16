package auth

import "golang.org/x/crypto/bcrypt"

// PasswordHasher defines the interface for secure password operations.
// Using an interface allows swapping bcrypt for Argon2id in the future without touching business logic.
type PasswordHasher interface {
	Hash(password string) (string, error)
	Compare(hash, password string) bool
}

type bcryptHasher struct {
	cost int
}

func NewBcryptHasher(cost int) PasswordHasher {
	if cost == 0 {
		cost = bcrypt.DefaultCost
	}
	return &bcryptHasher{cost: cost}
}

func (h *bcryptHasher) Hash(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), h.cost)
	return string(bytes), err
}

func (h *bcryptHasher) Compare(hash, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
