package vector

import "context"

// Chunk represents a piece of text that has been vectorized.
type Chunk struct {
	ID         string
	DocumentID string
	Text       string
	Metadata   map[string]any
	Vector     []float32
}

// SearchResult represents a retrieved chunk with its similarity score.
type SearchResult struct {
	Chunk
	Score float32
}

// Store abstracts the vector database (e.g. Pinecone, PGVector, Qdrant).
type Store interface {
	Upsert(ctx context.Context, tenantID, workspaceID string, chunks []Chunk) error
	Search(ctx context.Context, tenantID, workspaceID string, queryVector []float32, topK int) ([]SearchResult, error)
	DeleteByDocument(ctx context.Context, tenantID, workspaceID, documentID string) error
}

// PineconeStore is a stub implementation for Pinecone API.
type PineconeStore struct {
	indexName string
	// client *pinecone.Client
}

func NewPineconeStore(indexName string) *PineconeStore {
	return &PineconeStore{
		indexName: indexName,
	}
}

func (s *PineconeStore) Upsert(ctx context.Context, tenantID, workspaceID string, chunks []Chunk) error {
	// 1. Map []Chunk to Pinecone Vectors
	// 2. Inject tenantID and workspaceID into Pinecone metadata for Namespaces/Filtering
	// 3. Execute Upsert RPC
	return nil
}

func (s *PineconeStore) Search(ctx context.Context, tenantID, workspaceID string, queryVector []float32, topK int) ([]SearchResult, error) {
	// Mock returning a search result
	return []SearchResult{
		{
			Chunk: Chunk{
				ID:         "chunk-1",
				DocumentID: "doc-123",
				Text:       "The legacy service frequently exhausted connection pools during peak load.",
				Metadata: map[string]any{
					"source": "Q3 Enterprise Architecture Review",
					"page":   14,
				},
			},
			Score: 0.92,
		},
	}, nil
}

func (s *PineconeStore) DeleteByDocument(ctx context.Context, tenantID, workspaceID, documentID string) error {
	return nil
}
