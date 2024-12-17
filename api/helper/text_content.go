package helper

import (
	"bytes"
	"fmt"
)

func GetTextContent(fileID string, downloadTextBuffer func(string, string) (*bytes.Buffer, error)) (string, error) {
	buffer, err := downloadTextBuffer(fileID, "")
	if err != nil {
		return "", fmt.Errorf("failed to get file content: %v", err)
	}
	return buffer.String(), nil
}
