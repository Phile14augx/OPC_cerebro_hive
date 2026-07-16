package archive

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
	router.Post("/documents", h.ingestDocument)
}

// ingestDocument handles multipart form uploads
func (h *Handler) ingestDocument(c *fiber.Ctx) error {
	// 1. Strict File Size Validation (e.g. 20MB limit enforced at Fiber level before parsing)
	fileHeader, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": errors.APIError{Code: "missing_file", Message: "A file is required for ingestion"},
		})
	}

	if fileHeader.Size > 20*1024*1024 { // 20 MB
		return c.Status(fiber.StatusPayloadTooLarge).JSON(fiber.Map{
			"error": errors.APIError{Code: "file_too_large", Message: "Maximum file size is 20MB"},
		})
	}

	// 2. Parse DTO
	req := IngestDocumentRequest{
		Title: c.FormValue("title"),
		File:  fileHeader,
	}

	// 3. Validate DTO
	if valErrs := h.validator.ValidateStruct(req); valErrs != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": errors.APIError{Code: "validation_failed", Details: map[string]any{"fields": valErrs}},
		})
	}

	// 4. Extract Identity Context (Tenant/Workspace/User)
	// identityCtx := c.Locals("identity").(middleware.IdentityContext)
	tenantID := "dummy-tenant"
	workspaceID := "dummy-workspace"
	userID := "dummy-user"

	// 5. Execute Service logic
	doc, err := h.service.IngestDocument(c.Context(), tenantID, workspaceID, userID, req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": errors.APIError{Code: "ingestion_failed", Message: "Failed to ingest document"},
		})
	}

	return c.Status(fiber.StatusAccepted).JSON(fiber.Map{"data": doc})
}
