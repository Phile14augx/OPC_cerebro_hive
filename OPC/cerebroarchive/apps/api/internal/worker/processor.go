package worker

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"

	"github.com/cerebro/cerebroarchive/apps/api/internal/archive"
	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/ai"
	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/broker"
	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/document"
	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/storage"
	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/vector"
)

// DocumentProcessor listens for document upload events and coordinates the AI pipeline.
type DocumentProcessor struct {
	repo    archive.Repository
	storage storage.BlobStorage
	parser  document.Parser
	chunker document.Chunker
	embed   ai.Embedder
	vector  vector.Store
	sub     broker.Subscriber
	logger  *slog.Logger
}

func NewDocumentProcessor(repo archive.Repository, blobStorage storage.BlobStorage, parser document.Parser, chunker document.Chunker, embed ai.Embedder, vectorStore vector.Store, sub broker.Subscriber, logger *slog.Logger) *DocumentProcessor {
	return &DocumentProcessor{
		repo:    repo,
		storage: blobStorage,
		parser:  parser,
		chunker: chunker,
		embed:   embed,
		vector:  vectorStore,
		sub:     sub,
		logger:  logger,
	}
}

// Start subscribes to the relevant event streams.
func (p *DocumentProcessor) Start(ctx context.Context) error {
	p.logger.Info("starting document processor consumer")

	// Subscribe to the versioned contract
	err := p.sub.Subscribe(ctx, "document.uploaded.v1", "processor-group", p.handleDocumentUploaded)
	if err != nil {
		return fmt.Errorf("failed to subscribe: %w", err)
	}

	return nil
}

func (p *DocumentProcessor) handleDocumentUploaded(ctx context.Context, msg broker.Message, ack broker.AckFunc) {
	p.logger.Info("received document.uploaded event", "msg_id", msg.ID)

	// 1. Parse JSON payload (extract document_id)
	var payload struct {
		DocumentID string `json:"document_id"`
	}
	if err := json.Unmarshal(msg.Data, &payload); err != nil {
		p.logger.Error("failed to unmarshal payload", "error", err)
		ack(err)
		return
	}

	docID := payload.DocumentID
	// Stub multi-tenant resolution
	tenantID := "dummy-tenant"
	workspaceID := "dummy-workspace"
	objectKey := fmt.Sprintf("%s/%s/%s/original.pdf", tenantID, workspaceID, docID)

	p.logger.Info("processing document", "document_id", docID)

	// Stage 1: Download & Parse
	p.logger.Debug("state transition: parsing", "document_id", docID)
	// p.repo.UpdateDocumentStatus(ctx, docID, "parsing")
	reader, err := p.storage.GetDocument(ctx, objectKey)
	// if err != nil { ack(err); return }
	_ = reader // Handle real reader in prod
	
	parsedDoc, err := p.parser.Parse(ctx, nil)
	if err != nil {
		ack(err)
		return
	}

	// Stage 2: Normalize & Chunk
	p.logger.Debug("state transition: chunking", "document_id", docID)
	// p.repo.UpdateDocumentStatus(ctx, docID, "chunking")
	chunks, err := p.chunker.Split(ctx, parsedDoc)
	if err != nil {
		ack(err)
		return
	}

	// Stage 3: Embedding
	p.logger.Debug("state transition: embedding", "document_id", docID)
	// p.repo.UpdateDocumentStatus(ctx, docID, "embedding")
	
	var textsToEmbed []string
	for _, c := range chunks {
		textsToEmbed = append(textsToEmbed, c.Text)
	}

	// Batching is handled inside the Embedder implementation itself
	vectors, err := p.embed.GenerateEmbeddings(ctx, textsToEmbed)
	if err != nil {
		ack(err)
		return
	}

	// Stage 4: Indexing
	p.logger.Debug("state transition: indexed", "document_id", docID)
	// p.repo.UpdateDocumentStatus(ctx, docID, "indexed")
	
	var vectorChunks []vector.Chunk
	for i, c := range chunks {
		// Generate stable Chunk ID
		chunkID := fmt.Sprintf("%s-chunk-%d", docID, i)
		vectorChunks = append(vectorChunks, vector.Chunk{
			ID:         chunkID,
			DocumentID: docID,
			Text:       c.Text,
			Vector:     vectors[i],
			Metadata: map[string]any{
				"page":      c.PageNumber,
				"tenant_id": tenantID,
				"workspace_id": workspaceID,
			},
		})
	}

	err = p.vector.Upsert(ctx, tenantID, workspaceID, vectorChunks)
	if err != nil {
		ack(err)
		return
	}

	p.logger.Info("successfully processed and indexed document", "document_id", docID)
	ack(nil) // ACKs the JetStream message, ending the flow
}
