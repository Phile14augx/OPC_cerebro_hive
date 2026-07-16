package document

import (
	"context"
)

// RecursiveChunker splits text into fixed-size blocks with a configured overlap.
type RecursiveChunker struct {
	ChunkSize    int
	ChunkOverlap int
}

func NewRecursiveChunker(chunkSize, chunkOverlap int) *RecursiveChunker {
	return &RecursiveChunker{
		ChunkSize:    chunkSize,
		ChunkOverlap: chunkOverlap,
	}
}

func (c *RecursiveChunker) Split(ctx context.Context, doc *ParsedDocument) ([]ChunkedText, error) {
	var chunks []ChunkedText

	for _, page := range doc.Pages {
		// Mock simple chunking logic (without actual recursion/overlap for brevity)
		if len(page.Text) > 0 {
			chunks = append(chunks, ChunkedText{
				Text:       page.Text,
				PageNumber: page.PageNumber,
				StartIndex: 0,
			})
		}
	}

	return chunks, nil
}
