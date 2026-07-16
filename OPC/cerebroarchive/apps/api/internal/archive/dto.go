package archive

import "mime/multipart"

type IngestDocumentRequest struct {
	Title       string                `form:"title" validate:"required,min=2"`
	Description string                `form:"description"`
	Categories  []string              `form:"categories"`
	File        *multipart.FileHeader `form:"-"` // Handled manually
}

type DocumentDTO struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Status    string `json:"status"` // e.g. "uploaded", "scanning", "parsing"
	Checksum  string `json:"checksum"`
	Size      int64  `json:"size_bytes"`
	CreatedAt string `json:"created_at"`
}
