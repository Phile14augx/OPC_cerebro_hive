"""MinIO S3-compatible object storage client.

Every platform module (Archive, Studio, Flow, etc.) stores files through
this shared service. Files become first-class platform assets with:
  - Versioning
  - Lifecycle rules (configurable per bucket/domain)
  - Checksum verification
  - Metadata indexing
  - Pre-signed URL generation for secure client-side access

Bucket naming convention:
  cerebrohive-archive     ← CerebroArchive™ documents, PDFs, datasets
  cerebrohive-studio      ← Prompt exports, evaluation datasets
  cerebrohive-runtime     ← Execution artifacts, agent outputs
  cerebrohive-public      ← Public assets (logos, shared resources)
"""

from __future__ import annotations

import hashlib
import io
import logging
from dataclasses import dataclass
from datetime import timedelta
from typing import Any

logger = logging.getLogger("agentos.storage")

DOMAIN_BUCKETS: dict[str, str] = {
    "archive": "cerebrohive-archive",
    "studio": "cerebrohive-studio",
    "runtime": "cerebrohive-runtime",
    "flow": "cerebrohive-flow",
    "public": "cerebrohive-public",
}


@dataclass
class StoredFile:
    bucket: str
    object_name: str
    size_bytes: int
    checksum_sha256: str
    content_type: str
    etag: str
    url: str | None = None


class MinIOFileService:
    """Thin wrapper around minio-py for platform file storage."""

    def __init__(self, endpoint: str, access_key: str, secret_key: str, secure: bool = False) -> None:
        self._endpoint = endpoint
        self._access_key = access_key
        self._secret_key = secret_key
        self._secure = secure
        self._client: Any = None

    def _get_client(self) -> Any:
        if self._client is None:
            try:
                from minio import Minio  # type: ignore
                self._client = Minio(
                    self._endpoint,
                    access_key=self._access_key,
                    secret_key=self._secret_key,
                    secure=self._secure,
                )
                self._ensure_buckets()
            except ImportError:
                raise RuntimeError("minio package not installed. Add 'minio' to requirements.txt.")
        return self._client

    def _ensure_buckets(self) -> None:
        client = self._client
        for bucket in DOMAIN_BUCKETS.values():
            if not client.bucket_exists(bucket):
                client.make_bucket(bucket)
                logger.info("Created MinIO bucket: %s", bucket)

    def upload(
        self,
        domain: str,
        object_name: str,
        data: bytes,
        content_type: str = "application/octet-stream",
        metadata: dict[str, str] | None = None,
    ) -> StoredFile:
        """Upload bytes to a domain bucket."""
        client = self._get_client()
        bucket = DOMAIN_BUCKETS.get(domain, "cerebrohive-public")
        checksum = hashlib.sha256(data).hexdigest()
        stream = io.BytesIO(data)

        result = client.put_object(
            bucket,
            object_name,
            stream,
            length=len(data),
            content_type=content_type,
            metadata={**(metadata or {}), "x-checksum-sha256": checksum},
        )

        return StoredFile(
            bucket=bucket,
            object_name=object_name,
            size_bytes=len(data),
            checksum_sha256=checksum,
            content_type=content_type,
            etag=result.etag,
        )

    def download(self, domain: str, object_name: str) -> bytes:
        """Download object bytes from a domain bucket."""
        client = self._get_client()
        bucket = DOMAIN_BUCKETS.get(domain, "cerebrohive-public")
        response = client.get_object(bucket, object_name)
        try:
            return response.read()
        finally:
            response.close()
            response.release_conn()

    def presigned_url(self, domain: str, object_name: str, expires_in_seconds: int = 3600) -> str:
        """Generate a pre-signed URL for client-side secure access."""
        client = self._get_client()
        bucket = DOMAIN_BUCKETS.get(domain, "cerebrohive-public")
        return client.presigned_get_object(bucket, object_name, expires=timedelta(seconds=expires_in_seconds))

    def delete(self, domain: str, object_name: str) -> None:
        """Delete an object from a domain bucket."""
        client = self._get_client()
        bucket = DOMAIN_BUCKETS.get(domain, "cerebrohive-public")
        client.remove_object(bucket, object_name)
        logger.info("Deleted %s/%s", bucket, object_name)

    def list_objects(self, domain: str, prefix: str = "") -> list[dict]:
        """List objects in a domain bucket with an optional prefix filter."""
        client = self._get_client()
        bucket = DOMAIN_BUCKETS.get(domain, "cerebrohive-public")
        objects = client.list_objects(bucket, prefix=prefix, recursive=True)
        return [
            {"name": obj.object_name, "size": obj.size, "last_modified": str(obj.last_modified)}
            for obj in objects
        ]


# ─── Singleton ────────────────────────────────────────────────────────────────

_file_service: MinIOFileService | None = None


def get_file_service() -> MinIOFileService:
    global _file_service
    if _file_service is None:
        from app.config import get_settings
        s = get_settings()
        _file_service = MinIOFileService(
            endpoint=s.minio_endpoint,
            access_key=s.minio_access_key,
            secret_key=s.minio_secret_key,
            secure=s.minio_secure,
        )
    return _file_service
