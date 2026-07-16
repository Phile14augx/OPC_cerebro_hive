package identity

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
	router.Post("/register", h.register)
	router.Post("/bootstrap", h.bootstrap)
}

// register handles user sign-up
func (h *Handler) register(c *fiber.Ctx) error {
	var req RegisterUserRequest

	// 1. Bind JSON to DTO
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": errors.APIError{Code: "invalid_json", Message: "Malformed JSON body"},
		})
	}

	// 2. Validate DTO
	if valErrs := h.validator.ValidateStruct(req); valErrs != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": errors.APIError{
				Code:    "validation_failed",
				Message: "Invalid request payload",
				Details: map[string]any{"fields": valErrs},
			},
		})
	}

	// 3. Execute Service Logic
	user, err := h.service.RegisterUser(c.Context(), req)
	if err != nil {
		// Log error, return standard APIError
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": errors.APIError{Code: "registration_failed", Message: "Could not register user"},
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"data": user})
}

// bootstrap handles organization creation for a user
func (h *Handler) bootstrap(c *fiber.Ctx) error {
	// ... similar flow using BootstrapTenantRequest and IdentityContext injection
	return c.SendStatus(fiber.StatusNotImplemented)
}
