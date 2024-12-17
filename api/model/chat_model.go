package model

type ChatMessage struct {
	ID        string `json:"id"`
	Role      string `json:"role"`      // "user" or "assistant"
	Content   string `json:"content"`
	Timestamp int64  `json:"timestamp"`
}

type ChatRequest struct {
	FileID   string `json:"fileId"`
	Question string `json:"question"`
}

type ChatResponse struct {
	Message ChatMessage `json:"message"`
}
