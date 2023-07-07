package builder

import (
	"os"
	"path/filepath"
	"voltaserve/client"
	"voltaserve/core"
	"voltaserve/helper"
	"voltaserve/identifier"
	"voltaserve/infra"
	"voltaserve/processor"
)

type pdfBuilder struct {
	pipelineIdentifier *identifier.PipelineIdentifier
	pdfProc            *processor.PDFProcessor
	s3                 *infra.S3Manager
	apiClient          *client.APIClient
}

func NewPDFBuilder() core.Builder {
	return &pdfBuilder{
		pipelineIdentifier: identifier.NewPipelineIdentifier(),
		pdfProc:            processor.NewPDFProcessor(),
		s3:                 infra.NewS3Manager(),
		apiClient:          client.NewAPIClient(),
	}
}

func (p *pdfBuilder) Build(opts core.PipelineOptions) error {
	inputPath := filepath.FromSlash(os.TempDir() + "/" + helper.NewID() + filepath.Ext(opts.Key))
	if err := p.s3.GetFile(opts.Key, inputPath, opts.Bucket); err != nil {
		return err
	}
	thumbnail, err := p.pdfProc.Base64Thumbnail(inputPath)
	if err != nil {
		return err
	}
	res := core.PipelineResponse{
		Options:   opts,
		Thumbnail: &thumbnail,
	}
	if err := p.apiClient.UpdateSnapshot(&res); err != nil {
		return err
	}
	if _, err := os.Stat(inputPath); err == nil {
		if err := os.Remove(inputPath); err != nil {
			return err
		}
	}
	return nil
}
