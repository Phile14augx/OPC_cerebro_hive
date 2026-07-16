package storage

import (
	"context"
	"io"
)

// BlobStorage exposes business operations for object storage, hiding the underlying provider (S3/MinIO/etc).
type BlobStorage interface {
	// StoreDocument securely uploads a file stream and returns the unique storage path/key.
	StoreDocument(ctx context.Context, tenantID, workspaceID, documentID string, reader io.Reader, size int64, contentType string) (string, error)
	
	// GetDocument returns a reader for the requested object key.
	GetDocument(ctx context.Context, objectKey string) (io.ReadCloser, error)
	
	// DeleteDocument removes the object from storage.
	DeleteDocument(ctx context.Context, objectKey string) error
	
	// GenerateDownloadURL creates a short-lived presigned URL for secure client access.
	GenerateDownloadURL(ctx context.Context, objectKey string, expiryMinutes int) (string, error)
}

// S3Storage is the AWS SDK v2 implementation of BlobStorage
type S3Storage struct {
	// client *s3.Client
	bucket string
}

func NewS3Storage(bucket string) *S3Storage {
	return &S3Storage{
		bucket: bucket,
	}
}

func (s *S3Storage) StoreDocument(ctx context.Context, tenantID, workspaceID, documentID string, reader io.Reader, size int64, contentType string) (string, error) {
	// Hierarchical key structure: tenant/workspace/document/original.pdf
	// key := fmt.Sprintf("%s/%s/%s/original.pdf", tenantID, workspaceID, documentID)
	
	// _, err := s.client.PutObject(ctx, &s3.PutObjectInput{
	// 	Bucket:        &s.bucket,
	// 	Key:           &key,
	// 	Body:          reader,
	// 	ContentLength: &size,
	// 	ContentType:   &contentType,
	// })
	
	return "mock-s3-key-path", nil
}

func (s *S3Storage) GetDocument(ctx context.Context, objectKey string) (io.ReadCloser, error) {
	return nil, nil
}

func (s *S3Storage) DeleteDocument(ctx context.Context, objectKey string) error {
	return nil
}

func (s *S3Storage) GenerateDownloadURL(ctx context.Context, objectKey string, expiryMinutes int) (string, error) {
	return "https://mock-presigned-url.com", nil
}
