package service

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/kouprlabs/voltaserve/api/client/ai_client"
	"github.com/kouprlabs/voltaserve/api/log"
	"github.com/kouprlabs/voltaserve/api/model"
	"github.com/kouprlabs/voltaserve/api/repo"
)

type ChatService struct {
	fileRepo    repo.FileRepo
	aiClient    *ai_client.Client
	insightsSvc *InsightsService
}

func NewChatService() *ChatService {
	return &ChatService{
		fileRepo:    repo.NewFileRepo(),
		aiClient:    ai_client.NewClient(),
		insightsSvc: NewInsightsService(),
	}
}

func (s *ChatService) Chat(fileID string, userID string, question string) (*model.ChatMessage, error) {
	// Get file content
	buf, _, _, err := s.insightsSvc.DownloadTextBuffer(fileID, userID)
	log.GetLogger().Info("file content: %v", buf.String())
	if err != nil {
		return nil, fmt.Errorf("failed to get file content: %v", err)
	}

	// Get AI response
	answer, err := s.aiClient.Chat(buf.String(), question)
	if err != nil {
		return nil, fmt.Errorf("failed to get AI response: %v", err)
	}

	log.GetLogger().Debugf("answer: %v", answer)

	// Create chat message
	message := &model.ChatMessage{
		ID:        uuid.New().String(),
		Role:      "assistant",
		Content:   answer,
		Timestamp: time.Now().Unix(),
	}

	return message, nil
}
