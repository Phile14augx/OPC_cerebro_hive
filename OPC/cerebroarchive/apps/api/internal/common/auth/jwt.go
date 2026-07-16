package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Minimal claims as recommended for enterprise scale.
// Authorization details (permissions, large role lists) are intentionally excluded.
type Claims struct {
	UserID       string `json:"sub"`
	SessionID    string `json:"session_id"`
	RolesVersion int    `json:"roles_version"`
	jwt.RegisteredClaims
}

type TokenProvider interface {
	GenerateToken(userID, sessionID string, rolesVersion int, duration time.Duration) (string, error)
	ValidateToken(tokenStr string) (*Claims, error)
}

type jwtProvider struct {
	secret []byte
	issuer string
}

func NewJWTProvider(secret, issuer string) TokenProvider {
	return &jwtProvider{
		secret: []byte(secret),
		issuer: issuer,
	}
}

func (p *jwtProvider) GenerateToken(userID, sessionID string, rolesVersion int, duration time.Duration) (string, error) {
	claims := Claims{
		UserID:       userID,
		SessionID:    sessionID,
		RolesVersion: rolesVersion,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    p.issuer,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(p.secret)
}

func (p *jwtProvider) ValidateToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return p.secret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	return nil, jwt.ErrSignatureInvalid
}
