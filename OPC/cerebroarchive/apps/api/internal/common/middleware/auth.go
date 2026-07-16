package middleware

import (
	"strings"

	"github.com/cerebro/cerebroarchive/apps/api/internal/common/auth"
	"github.com/cerebro/cerebroarchive/apps/api/internal/common/errors"
	"github.com/gofiber/fiber/v2"
)

// IdentityContext is the typed object injected into the request.
type IdentityContext struct {
	UserID       string
	SessionID    string
	WorkspaceID  string // Populated by RequireWorkspace middleware
}

// RequireAuth separates Authentication from Authorization.
// It verifies the Bearer token or Cookie and injects the minimal IdentityContext.
func RequireAuth(provider auth.TokenProvider) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var tokenStr string
		
		// 1. Try Bearer Token
		authHeader := c.Get("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
		}

		// 2. Try Cookie fallback
		if tokenStr == "" {
			tokenStr = c.Cookies("access_token")
		}

		if tokenStr == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": errors.APIError{
					Code:    "unauthorized",
					Message: "Missing authentication token.",
				},
			})
		}

		claims, err := provider.ValidateToken(tokenStr)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": errors.APIError{
					Code:    "invalid_token",
					Message: "Token is invalid or expired.",
				},
			})
		}

		// Inject typed IdentityContext (Separation of Auth and Context logic)
		identityCtx := &IdentityContext{
			UserID:    claims.UserID,
			SessionID: claims.SessionID,
		}
		
		c.Locals("identity", identityCtx)
		return c.Next()
	}
}

// RequireWorkspace is an example of Tenant Resolution middleware that runs *after* RequireAuth
func RequireWorkspace() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Expects identity context to exist
		val := c.Locals("identity")
		if val == nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Missing identity context"})
		}

		identityCtx := val.(*IdentityContext)
		
		// Read X-Workspace-ID header 
		workspaceID := c.Get("X-Workspace-ID")
		if workspaceID == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": errors.APIError{
					Code:    "missing_workspace",
					Message: "X-Workspace-ID header is required.",
				},
			})
		}

		// Note: Here we would check if the UserID is actually a member of WorkspaceID via a fast cache lookup
		// For now we just inject it:
		identityCtx.WorkspaceID = workspaceID
		c.Locals("identity", identityCtx)

		return c.Next()
	}
}
