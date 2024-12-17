package ai_client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/kouprlabs/voltaserve/api/log"
)

type Client struct {
	httpClient *http.Client
	apiKey     string
	baseURL    string
}

type ChatRequest struct {
	Model       string        `json:"model"`
	Messages    []ChatMessage `json:"messages"`
	Temperature float64       `json:"temperature"`
}

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatResponse struct {
	Choices []struct {
		Message ChatMessage `json:"message"`
	} `json:"choices"`
}

func NewClient() *Client {
	return &Client{
		httpClient: &http.Client{},
		apiKey:     os.Getenv("OPENAI_API_KEY"),
		baseURL:    "https://api.openai.com/v1",
	}
}

var logger = log.GetLogger()

func (c *Client) Chat(context, question string) (string, error) {
	messages := []ChatMessage{
		{
			Role:    "system",
			Content: fmt.Sprintf("You are a helpful assistant. Use the following context to answer questions: %s", context),
		},
		{
			Role:    "user",
			Content: question,
		},
	}

	logger.Debugf("messages: %v", messages)

	reqBody := ChatRequest{
		Model:       "gpt-4o-mini",
		Messages:    messages,
		Temperature: 0,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %v", err)
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/chat/completions", c.baseURL), bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.apiKey))

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API request failed with status: %d", resp.StatusCode)
	}

	logger.Debugf("resp: %v", resp)

	var chatResp ChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&chatResp); err != nil {
		return "", fmt.Errorf("failed to decode response: %v", err)
	}

	logger.Debugf("chatResp: %v", chatResp)

	if len(chatResp.Choices) == 0 {
		return "", fmt.Errorf("no response from AI")
	}

	logger.Debugf("chatResp.Choices[0].Message.Content: %v", chatResp.Choices[0].Message.Content)

	return chatResp.Choices[0].Message.Content, nil
}
