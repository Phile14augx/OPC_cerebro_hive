package identity

import (
	"errors"
	"net/http"

	apierrors "github.com/cerebro/cerebroarchive/apps/api/internal/common/errors"
	"github.com/cerebro/cerebroarchive/apps/api/internal/common/validation"
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	service   *Service
	validator *validation.Validator
}

func NewHandler(service *Service, validator *validation.Validator) *Handler {
	return &Handler{service: service, validator: validator}
}

func (h *Handler) RegisterRoutes(router fiber.Router) {
	router.Post("/register", h.register)
	router.Post("/login", h.login)
	router.Post("/bootstrap", h.bootstrap)
	router.Get("/me", h.me) // Protected — reads user_id from JWT claims injected by middleware
}

// register handles new user sign-up.
func (h *Handler) register(c *fiber.Ctx) error {
	var req RegisterUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": apierrors.APIError{Code: "invalid_json", Message: "Malformed JSON body"},
		})
	}
	if valErrs := h.validator.ValidateStruct(req); valErrs != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": apierrors.APIError{Code: "validation_failed", Message: "Invalid request payload", Details: map[string]any{"fields": valErrs}},
		})
	}

	user, err := h.service.RegisterUser(c.Context(), req)
	if err != nil {
		if errors.Is(err, ErrEmailTaken) {
			return c.Status(http.StatusConflict).JSON(fiber.Map{
				"error": apierrors.APIError{Code: "email_taken", Message: "An account with this email already exists"},
			})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": apierrors.APIError{Code: "registration_failed", Message: "Could not create account"},
		})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{"data": user})
}

// login issues a JWT on valid credentials.
func (h *Handler) login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": apierrors.APIError{Code: "invalid_json", Message: "Malformed JSON body"},
		})
	}
	if valErrs := h.validator.ValidateStruct(req); valErrs != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": apierrors.APIError{Code: "validation_failed", Message: "Invalid request payload", Details: map[string]any{"fields": valErrs}},
		})
	}

	resp, err := h.service.LoginUser(c.Context(), req)
	if err != nil {
		if errors.Is(err, ErrInvalidCreds) {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
				"error": apierrors.APIError{Code: "invalid_credentials", Message: "Invalid email or password"},
			})
		}
		if errors.Is(err, ErrAccountLocked) {
			return c.Status(http.StatusForbidden).JSON(fiber.Map{
				"error": apierrors.APIError{Code: "account_inactive", Message: "Your account has been deactivated"},
			})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": apierrors.APIError{Code: "login_failed", Message: "Could not complete login"},
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"data": resp})
}

// me returns the authenticated user's profile.
// Expects user_id to be injected into Locals by JWT middleware.
func (h *Handler) me(c *fiber.Ctx) error {
	// TODO: Replace with middleware.IdentityContext once JWT middleware is wired.
	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": apierrors.APIError{Code: "unauthenticated", Message: "Authentication required"},
		})
	}

	user, err := h.service.GetMe(c.Context(), userID)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": apierrors.APIError{Code: "user_not_found", Message: "User profile not found"},
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"data": user})
}

// bootstrap creates an org + workspace for a user — called after first login.
func (h *Handler) bootstrap(c *fiber.Ctx) error {
	return c.SendStatus(http.StatusNotImplemented)
}
