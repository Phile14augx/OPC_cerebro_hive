package ai

import (
	"github.com/cerebro/cerebroarchive/apps/api/internal/common/errors"
	"github.com/cerebro/cerebroarchive/apps/api/internal/common/validation"
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	service   *Service
	validator *validation.Validator
}

func NewHandler(service *Service, validator *validation.Validator) *Handler {
	return &Handler{
		service:   service,
		validator: validator,
	}
}

func (h *Handler) RegisterRoutes(router fiber.Router) {
	// Protected by RequireAuth and RequireWorkspace middlewares
	router.Post("/chat", h.handleChat)
}

func (h *Handler) handleChat(c *fiber.Ctx) error {
	var req ChatRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": errors.APIError{Code: "invalid_json", Message: "Invalid request payload"},
		})
	}

	if valErrs := h.validator.ValidateStruct(req); valErrs != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": errors.APIError{Code: "validation_failed", Details: map[string]any{"fields": valErrs}},
		})
	}

	// Extract Context
	tenantID := "dummy-tenant"
	workspaceID := "dummy-workspace"

	resp, err := h.service.Ask(c.Context(), tenantID, workspaceID, req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": errors.APIError{Code: "rag_failed", Message: "Failed to generate AI response"},
		})
	}

	return c.JSON(fiber.Map{"data": resp})
}
