package ai

import (
	"context"
	"fmt"
	"log/slog"
	"strings"

	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/ai"
	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/vector"
)

type Service struct {
	embedder ai.Embedder
	vector   vector.Store
	gen      ai.Generator
	logger   *slog.Logger
}

func NewService(embedder ai.Embedder, vector vector.Store, gen ai.Generator, logger *slog.Logger) *Service {
	return &Service{
		embedder: embedder,
		vector:   vector,
		gen:      gen,
		logger:   logger,
	}
}

// Ask orchestrates the Retrieval-Augmented Generation pipeline.
func (s *Service) Ask(ctx context.Context, tenantID, workspaceID string, req ChatRequest) (*ChatResponse, error) {
	s.logger.Info("executing RAG pipeline", "workspace", workspaceID, "query", req.Query)

	// 1. Generate Embedding for the User Query
	queryVectors, err := s.embedder.GenerateEmbeddings(ctx, []string{req.Query})
	if err != nil {
		return nil, fmt.Errorf("failed to embed query: %w", err)
	}
	queryVector := queryVectors[0]

	// 2. Vector Search (Retrieval)
	// Enforces multi-tenant isolation via workspaceID filtering
	results, err := s.vector.Search(ctx, tenantID, workspaceID, queryVector, 5)
	if err != nil {
		return nil, fmt.Errorf("vector search failed: %w", err)
	}

	// 3. Context Assembly
	var contextBuilder strings.Builder
	var citations []Citation

	for i, res := range results {
		// Append to context window
		contextBuilder.WriteString(fmt.Sprintf("--- Source %d ---\n%s\n\n", i+1, res.Text))
		
		// Build Citation DTO
		sourceName, _ := res.Metadata["source"].(string)
		citations = append(citations, Citation{
			DocumentID: res.DocumentID,
			Source:     sourceName,
			Text:       res.Text,
			Score:      res.Score,
		})
	}

	assembledContext := contextBuilder.String()

	// 4. Prompt Assembly
	// In the future, this comes from a Versioned Prompt Template Store
	systemPrompt := `You are an expert research assistant for CerebroArchive.
You must answer the user's question using ONLY the provided context.
If the context does not contain the answer, state that you do not have enough information.`

	userMessage := fmt.Sprintf("Context Information:\n%s\n\nUser Question: %s", assembledContext, req.Query)

	// 5. Generation
	answer, err := s.gen.GenerateResponse(ctx, systemPrompt, userMessage)
	if err != nil {
		return nil, fmt.Errorf("LLM generation failed: %w", err)
	}

	return &ChatResponse{
		Answer:    answer,
		Citations: citations,
	}, nil
}
