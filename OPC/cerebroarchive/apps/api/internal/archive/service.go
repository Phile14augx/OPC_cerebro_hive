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
	"mime/multipart"

	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/database/sqlc"
	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/storage"
	"github.com/google/uuid"
)

type Service struct {
	repo    Repository
	storage storage.BlobStorage
	logger  *slog.Logger
}

func NewService(repo Repository, blobStorage storage.BlobStorage, logger *slog.Logger) *Service {
	return &Service{
		repo:    repo,
		storage: blobStorage,
		logger:  logger,
	}
}

// IngestDocument orchestrates the upload, checksumming, storage, and outbox event creation.
func (s *Service) IngestDocument(ctx context.Context, tenantID, workspaceID, userID string, req IngestDocumentRequest) (*DocumentDTO, error) {
	
	// 1. Open the uploaded file stream
	file, err := req.File.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer file.Close()

	// 2. Magic Byte Detection & Checksum Calculation
	// We read the first 512 bytes to sniff content type, and duplicate the stream to calculate SHA-256
	buffer := make([]byte, 512)
	n, _ := file.Read(buffer)
	// TODO: sniff contentType from buffer using http.DetectContentType
	
	// Reset file pointer
	file.Seek(0, 0)
	
	// Calculate Checksum via a TeeReader if we were streaming directly, 
	// or fully hash it here before uploading for strict integrity.
	hash := sha256.New()
	if _, err := io.Copy(hash, file); err != nil {
		return nil, errors.New("failed to compute file checksum")
	}
	checksum := hex.EncodeToString(hash.Sum(nil))
	
	// Reset file pointer again for the actual S3 upload
	file.Seek(0, 0)

	docID := uuid.New().String()

	// 3. Upload to S3 (Source of Truth for Bytes)
	s.logger.Info("uploading document to blob storage", "document_id", docID)
	objectKey, err := s.storage.StoreDocument(ctx, tenantID, workspaceID, docID, file, req.File.Size, "application/pdf")
	if err != nil {
		return nil, fmt.Errorf("storage upload failed: %w", err)
	}

	// 4. Database Transaction (Source of Truth for Metadata + Orchestration)
	err = s.repo.RunInTransaction(ctx, func(txRepo Repository) error {
		// A. Persist Document Metadata (Status: uploaded)
		_, err := txRepo.CreateDocument(ctx, sqlc.CreateDocumentParams{
			ID:          docID,
			WorkspaceID: workspaceID,
			Title:       req.Title,
			Checksum:    checksum,
			ObjectKey:   objectKey,
			SizeBytes:   req.File.Size,
			Status:      "uploaded", // Lifecycle: uploaded -> scanning -> parsing -> chunking -> embedding
		})
		if err != nil {
			return err
		}

		// B. Publish Outbox Event for Background Workers
		err = txRepo.InsertOutboxEvent(ctx, sqlc.InsertOutboxEventParams{
			ID:        uuid.New().String(),
			EventType: "document.uploaded",
			Payload:   []byte(fmt.Sprintf(`{"document_id":"%s"}`, docID)), // JSON payload
		})
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		// Compensating transaction: attempt to delete the orphaned S3 object
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
