package document

import (
	"context"
	"io"
)

// PDFParser is a stub implementation representing a PDF text extraction tool.
type PDFParser struct{}

func NewPDFParser() *PDFParser {
	return &PDFParser{}
}

func (p *PDFParser) Parse(ctx context.Context, reader io.Reader) (*ParsedDocument, error) {
	// 1. Read bytes
	// 2. Extract text per page
	// 3. Return structured ParsedDocument

	// Mocking output
	return &ParsedDocument{
		Pages: []Page{
			{
				PageNumber: 1,
				Text:       "This is page 1 of the Q3 Enterprise Architecture Review.",
			},
			{
				PageNumber: 14,
				Text:       "The legacy service frequently exhausted connection pools during peak load.",
			},
		},
	}, nil
}
