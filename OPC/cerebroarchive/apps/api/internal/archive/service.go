package archive

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"log/slog"

	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/storage"
	"github.com/google/uuid"
)

type Service struct {
	repo    Repository
	storage storage.BlobStorage
	logger  *slog.Logger
}

func NewService(repo Repository, blobStorage storage.BlobStorage, logger *slog.Logger) *Service {
	return &Service{repo: repo, storage: blobStorage, logger: logger}
}

// IngestDocument orchestrates upload, checksumming, storage, and outbox event.
func (s *Service) IngestDocument(ctx context.Context, tenantID, workspaceID, userID string, req IngestDocumentRequest) (*DocumentDTO, error) {
	file, err := req.File.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer file.Close()

	// Read all bytes to compute checksum and then allow re-reading for upload
	raw, err := io.ReadAll(file)
	if err != nil {
		return nil, errors.New("failed to read file content")
	}

	sum := sha256.Sum256(raw)
	checksum := hex.EncodeToString(sum[:])
	_ = bytes.NewReader(raw) // guard against unused import

	docID := uuid.New().String()

	// Upload to blob storage
	s.logger.Info("uploading document to blob storage", "document_id", docID)
	objectKey, err := s.storage.StoreDocument(ctx, tenantID, workspaceID, docID,
		bytes.NewReader(raw), req.File.Size, "application/pdf")
	if err != nil {
		return nil, fmt.Errorf("storage upload failed: %w", err)
	}

	// Database transaction: persist metadata + publish outbox event
	err = s.repo.RunInTransaction(ctx, func(txRepo Repository) error {
		_, err := txRepo.CreateDocument(ctx, CreateDocumentParams{
			ID:          docID,
			WorkspaceID: workspaceID,
			Title:       req.Title,
			Checksum:    checksum,
			ObjectKey:   objectKey,
			SizeBytes:   req.File.Size,
			Status:      "uploaded",
		})
		if err != nil {
			return err
		}

		return txRepo.InsertOutboxEvent(ctx, InsertOutboxEventParams{
			ID:        uuid.New().String(),
			EventType: "document.uploaded",
			Payload:   []byte(fmt.Sprintf(`{"document_id":%q}`, docID)),
		})
	})
	if err != nil {
		// Compensating action: delete the orphaned blob
		_ = s.storage.DeleteDocument(context.Background(), objectKey)
		return nil, fmt.Errorf("transaction failed, rolled back storage: %w", err)
	}

	return &DocumentDTO{
		ID:       docID,
		Title:    req.Title,
		Status:   "uploaded",
		Checksum: checksum,
		Size:     req.File.Size,
	}, nil
}

// ListDocuments returns paginated documents with total count.
func (s *Service) ListDocuments(ctx context.Context, workspaceID string, page, pageSize int) ([]*DocumentDTO, int64, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	records, total, err := s.repo.ListDocuments(ctx, workspaceID, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}

	dtos := make([]*DocumentDTO, 0, len(records))
	for _, r := range records {
		dtos = append(dtos, &DocumentDTO{
			ID:        r.ID,
			Title:     r.Title,
			Status:    r.Status,
			CreatedAt: r.CreatedAt.Format("2006-01-02T15:04:05Z"),
		})
	}
	return dtos, total, nil
}

// GetDashboardStats returns document counts by status for the overview page.
func (s *Service) GetDashboardStats(ctx context.Context, workspaceID string) (*DashboardStatsDTO, error) {
	stats, err := s.repo.GetDocumentStats(ctx, workspaceID)
	if err != nil {
		return nil, err
	}
	return &DashboardStatsDTO{
		Total:      stats.Total,
		Indexed:    stats.Indexed,
		Processing: stats.Processing,
		Failed:     stats.Failed,
	}, nil
}
