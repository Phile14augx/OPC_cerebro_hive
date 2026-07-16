package document

import (
	"context"
	"io"
)

// ParsedDocument represents the rich structural output of the extraction pipeline.
type ParsedDocument struct {
	Pages []Page
	// Future: Headings, Tables, Figures, ReadingOrder
}

type Page struct {
	PageNumber int
	Text       string
}

// ChunkedText represents a text block annotated with its structural provenance.
type ChunkedText struct {
	Text       string
	PageNumber int
	StartIndex int
}

// Parser abstracts the extraction of structured data from raw file bytes.
type Parser interface {
	Parse(ctx context.Context, reader io.Reader) (*ParsedDocument, error)
}

// Chunker abstracts the logic for splitting parsed documents into vector-friendly blocks.
type Chunker interface {
	Split(ctx context.Context, doc *ParsedDocument) ([]ChunkedText, error)
}
