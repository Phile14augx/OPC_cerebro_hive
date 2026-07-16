package ai

type ChatRequest struct {
	Query string `json:"query" validate:"required"`
	// Future: ConversationID, Filters, etc.
}

type Citation struct {
	DocumentID string `json:"document_id"`
	Source     string `json:"source"`
	Text       string `json:"text"`
	Score      float32 `json:"score"`
}

type ChatResponse struct {
	Answer    string     `json:"answer"`
	Citations []Citation `json:"citations"`
}
