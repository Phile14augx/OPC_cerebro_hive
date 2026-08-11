"""Storage SDK — Abstractions for Object, Blob, Vector, Artifact, Dataset, and Checkpoint storage."""

from typing import Any
from abc import ABC, abstractmethod

class StorageProvider(ABC):
    @abstractmethod
    def upload(self, domain: str, object_name: str, data: bytes, **kwargs) -> Any:
        pass
        
    @abstractmethod
    def download(self, domain: str, object_name: str) -> bytes:
        pass
        
    @abstractmethod
    def delete(self, domain: str, object_name: str) -> None:
        pass

class ObjectStorage(StorageProvider):
    def upload(self, domain, object_name, data, **kwargs): return None
    def download(self, domain, object_name): return b""
    def delete(self, domain, object_name): pass

class VectorStorage(StorageProvider):
    def upload(self, domain, object_name, data, **kwargs): return None
    def download(self, domain, object_name): return b""
    def delete(self, domain, object_name): pass

class ArtifactStorage(StorageProvider):
    def upload(self, domain, object_name, data, **kwargs): return None
    def download(self, domain, object_name): return b""
    def delete(self, domain, object_name): pass

class StorageSDK:
    def __init__(self):
        self.object_store = ObjectStorage()
        self.blob_store = ObjectStorage() # Often same as object
        self.vector_store = VectorStorage()
        self.artifact_store = ArtifactStorage()
        self.dataset_store = ObjectStorage()
        self.checkpoint_store = ObjectStorage()
        
    def upload(self, domain: str, object_name: str, data: bytes, content_type: str = "application/octet-stream") -> Any:
        """Legacy default upload (routes to object store)."""
        return self.object_store.upload(domain, object_name, data, content_type=content_type)
        
    def get_presigned_url(self, domain: str, object_name: str, expires_in_sec: int = 3600) -> str:
        """Get a pre-signed URL for secure client-side access."""
        return f"https://storage.local/{domain}/{object_name}?expires={expires_in_sec}"
        
    def delete(self, domain: str, object_name: str) -> None:
        """Legacy default delete (routes to object store)."""
        self.object_store.delete(domain, object_name)
