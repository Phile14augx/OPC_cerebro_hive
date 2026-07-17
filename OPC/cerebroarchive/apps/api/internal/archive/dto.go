package archive

import "mime/multipart"

type IngestDocumentRequest struct {
	Title       string                `form:"title" validate:"required,min=2"`
	Description string                `form:"description"`
	File        *multipart.FileHeader `form:"-"` // Handled manually
}

type DocumentDTO struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Status    string `json:"status"`
	Checksum  string `json:"checksum,omitempty"`
	Size      int64  `json:"size_bytes,omitempty"`
	CreatedAt string `json:"created_at,omitempty"`
}

type ListDocumentsResponse struct {
	Documents []*DocumentDTO `json:"documents"`
	Total     int64          `json:"total"`
	Page      int            `json:"page"`
	PageSize  int            `json:"page_size"`
}

type DashboardStatsDTO struct {
	Total      int64 `json:"total"`
	Indexed    int64 `json:"indexed"`
	Processing int64 `json:"processing"`
	Failed     int64 `json:"failed"`
}
