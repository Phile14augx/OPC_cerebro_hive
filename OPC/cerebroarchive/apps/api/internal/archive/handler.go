package archive

import (
	"net/http"
	"strconv"

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
	router.Post("/documents", h.ingestDocument)
	router.Get("/documents", h.listDocuments)
	router.Get("/dashboard/stats", h.dashboardStats)
}

// ingestDocument handles multipart form uploads.
func (h *Handler) ingestDocument(c *fiber.Ctx) error {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": apierrors.APIError{Code: "missing_file", Message: "A file is required for ingestion"},
		})
	}
	if fileHeader.Size > 20*1024*1024 {
		return c.Status(http.StatusRequestEntityTooLarge).JSON(fiber.Map{
			"error": apierrors.APIError{Code: "file_too_large", Message: "Maximum file size is 20MB"},
		})
	}

	req := IngestDocumentRequest{
		Title: c.FormValue("title"),
		File:  fileHeader,
	}
	if valErrs := h.validator.ValidateStruct(req); valErrs != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": apierrors.APIError{Code: "validation_failed", Details: map[string]any{"fields": valErrs}},
		})
	}

	// TODO: Extract from JWT middleware once wired.
	tenantID := c.Locals("tenant_id").(string)
	if tenantID == "" { tenantID = "default-tenant" }
	workspaceID := c.Locals("workspace_id").(string)
	if workspaceID == "" { workspaceID = "default-workspace" }
	userID := c.Locals("user_id").(string)
	if userID == "" { userID = "default-user" }

	doc, err := h.service.IngestDocument(c.Context(), tenantID, workspaceID, userID, req)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": apierrors.APIError{Code: "ingestion_failed", Message: "Failed to ingest document"},
		})
	}

	return c.Status(http.StatusAccepted).JSON(fiber.Map{"data": doc})
}

// listDocuments returns paginated documents for the authenticated workspace.
func (h *Handler) listDocuments(c *fiber.Ctx) error {
	workspaceID, _ := c.Locals("workspace_id").(string)
	if workspaceID == "" {
		workspaceID = c.Query("workspace_id", "default-workspace")
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("page_size", "20"))

	docs, total, err := h.service.ListDocuments(c.Context(), workspaceID, page, pageSize)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": apierrors.APIError{Code: "list_failed", Message: "Failed to fetch documents"},
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"data": ListDocumentsResponse{
			Documents: docs,
			Total:     total,
			Page:      page,
			PageSize:  pageSize,
		},
	})
}

// dashboardStats returns document counts by status for the overview page.
func (h *Handler) dashboardStats(c *fiber.Ctx) error {
	workspaceID, _ := c.Locals("workspace_id").(string)
	if workspaceID == "" {
		workspaceID = c.Query("workspace_id", "default-workspace")
	}

	stats, err := h.service.GetDashboardStats(c.Context(), workspaceID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": apierrors.APIError{Code: "stats_failed", Message: "Failed to fetch stats"},
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"data": stats})
}
