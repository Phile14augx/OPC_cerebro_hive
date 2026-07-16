package ai_test

import (
	"context"
	"errors"
	"log/slog"
	"os"
	"testing"

	"github.com/cerebro/cerebroarchive/apps/api/internal/ai"
	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/vector"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// --- Mocks ---

type MockEmbedder struct {
	mock.Mock
}

func (m *MockEmbedder) GenerateEmbeddings(ctx context.Context, texts []string) ([][]float32, error) {
	args := m.Called(ctx, texts)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([][]float32), args.Error(1)
}

type MockGenerator struct {
	mock.Mock
}

func (m *MockGenerator) GenerateResponse(ctx context.Context, systemPrompt, userMessage string) (string, error) {
	args := m.Called(ctx, systemPrompt, userMessage)
	return args.String(0), args.Error(1)
}

type MockVectorStore struct {
	mock.Mock
}

func (m *MockVectorStore) Upsert(ctx context.Context, tenantID, workspaceID string, chunks []vector.Chunk) error {
	args := m.Called(ctx, tenantID, workspaceID, chunks)
	return args.Error(0)
}

func (m *MockVectorStore) Search(ctx context.Context, tenantID, workspaceID string, queryVector []float32, topK int) ([]vector.SearchResult, error) {
	args := m.Called(ctx, tenantID, workspaceID, queryVector, topK)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]vector.SearchResult), args.Error(1)
}

func (m *MockVectorStore) DeleteByDocument(ctx context.Context, tenantID, workspaceID, documentID string) error {
	args := m.Called(ctx, tenantID, workspaceID, documentID)
	return args.Error(0)
}

// --- Tests ---

func TestService_Ask(t *testing.T) {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	tests := []struct {
		name          string
		query         string
		tenantID      string
		workspaceID   string
		setupMocks    func(embedder *MockEmbedder, vectorStore *MockVectorStore, generator *MockGenerator)
		expectedError string
		expectedResp  *ai.ChatResponse
	}{
		{
			name:        "Success RAG Flow",
			query:       "What is the latency?",
			tenantID:    "t-1",
			workspaceID: "w-1",
			setupMocks: func(embedder *MockEmbedder, vectorStore *MockVectorStore, generator *MockGenerator) {
				dummyVector := []float32{0.1, 0.2}
				
				// 1. Embedder generates vector
				embedder.On("GenerateEmbeddings", mock.Anything, []string{"What is the latency?"}).
					Return([][]float32{dummyVector}, nil)

				// 2. VectorStore searches
				searchResults := []vector.SearchResult{
					{
						Chunk: vector.Chunk{
							DocumentID: "doc-1",
							Text:       "Latency is 400ms.",
							Metadata:   map[string]any{"source": "Architecture Doc"},
						},
						Score: 0.95,
					},
				}
				vectorStore.On("Search", mock.Anything, "t-1", "w-1", dummyVector, 5).
					Return(searchResults, nil)

				// 3. Generator synthesizes
				generator.On("GenerateResponse", mock.Anything, mock.AnythingOfType("string"), mock.AnythingOfType("string")).
					Return("The latency is 400ms.", nil)
			},
			expectedResp: &ai.ChatResponse{
				Answer: "The latency is 400ms.",
				Citations: []ai.Citation{
					{
						DocumentID: "doc-1",
						Source:     "Architecture Doc",
						Text:       "Latency is 400ms.",
						Score:      0.95,
					},
				},
			},
		},
		{
			name:        "Embedding Failure",
			query:       "What is the latency?",
			tenantID:    "t-1",
			workspaceID: "w-1",
			setupMocks: func(embedder *MockEmbedder, vectorStore *MockVectorStore, generator *MockGenerator) {
				embedder.On("GenerateEmbeddings", mock.Anything, []string{"What is the latency?"}).
					Return(nil, errors.New("API rate limit exceeded"))
			},
			expectedError: "failed to embed query: API rate limit exceeded",
		},
		{
			name:        "Vector Search Failure",
			query:       "What is the latency?",
			tenantID:    "t-1",
			workspaceID: "w-1",
			setupMocks: func(embedder *MockEmbedder, vectorStore *MockVectorStore, generator *MockGenerator) {
				dummyVector := []float32{0.1, 0.2}
				embedder.On("GenerateEmbeddings", mock.Anything, []string{"What is the latency?"}).
					Return([][]float32{dummyVector}, nil)
				
				vectorStore.On("Search", mock.Anything, "t-1", "w-1", dummyVector, 5).
					Return(nil, errors.New("pinecone timeout"))
			},
			expectedError: "vector search failed: pinecone timeout",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			embedder := new(MockEmbedder)
			vectorStore := new(MockVectorStore)
			generator := new(MockGenerator)

			tt.setupMocks(embedder, vectorStore, generator)

			service := ai.NewService(embedder, vectorStore, generator, logger)

			req := ai.ChatRequest{Query: tt.query}
			resp, err := service.Ask(context.Background(), tt.tenantID, tt.workspaceID, req)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedError, err.Error())
				assert.Nil(t, resp)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedResp, resp)
			}

			embedder.AssertExpectations(t)
			vectorStore.AssertExpectations(t)
			generator.AssertExpectations(t)
		})
	}
}
