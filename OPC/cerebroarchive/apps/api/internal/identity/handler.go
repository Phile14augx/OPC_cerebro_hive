package identity

import (
	"github.com/gofiber/fiber/v2"
)

// Handler manages HTTP requests and responses for the identity domain.
type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

// RegisterRoutes attaches the identity endpoints to a Fiber router group.
func (h *Handler) RegisterRoutes(router fiber.Router) {
	router.Get("/organizations", h.listOrganizations)
	// Add more routes
}

func (h *Handler) listOrganizations(c *fiber.Ctx) error {
	// DTO binding, validation, and passing to service happens here
	// Return a standard APIResponse
	return c.JSON(fiber.Map{
		"data": []string{},
	})
}
