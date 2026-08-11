"""Documents API Router — CRUD, upload, and versioning for CerebroArchive."""

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.archive.models import Document
from app.archive.pipeline.indexer import ingest
from app.archive.schemas import DocumentCreate, DocumentList, DocumentOut, DocumentUpdate
from app.db import get_db
from app.platform.auth.keycloak import PlatformUser, get_platform_user

logger = logging.getLogger("agentos.archive.documents")

router = APIRouter(prefix="/documents", tags=["archive:documents"])


@router.post("", response_model=DocumentOut, status_code=201)
def create_document(
    payload: DocumentCreate,
    db: Session = Depends(get_db),
    user: PlatformUser = Depends(get_platform_user),
) -> Any:
    """Create a new document manually (no file upload)."""
    doc = Document(
        title=payload.title,
        description=payload.description,
        content=payload.content,
        source_url=payload.source_url,
        domain=payload.domain,
        resource_type=payload.resource_type,
        tags=payload.tags,
        meta=payload.meta,
        is_public=payload.is_public,
        org_id=user.org_id,
        workspace_id=payload.workspace_id,
        created_by=user.user_id,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    # Trigger ingestion synchronously (can be moved to background task)
    if doc.content or doc.source_url:
        doc = ingest(db, doc)
        
    return doc


@router.post("/upload", response_model=DocumentOut, status_code=201)
async def upload_document(
    file: UploadFile,
    title: str | None = None,
    domain: str = "general",
    db: Session = Depends(get_db),
    user: PlatformUser = Depends(get_platform_user),
) -> Any:
    """Upload and ingest a file into CerebroArchive."""
    from app.core.storage.file_service import get_file_service
    
    file_bytes = await file.read()
    file_type = file.filename.split(".")[-1] if file.filename else "unknown"
    doc_title = title or file.filename or "Untitled Document"
    
    # 1. Store raw file in MinIO
    storage = get_file_service()
    object_name = f"{user.org_id or 'public'}/{domain}/{file.filename}"
    try:
        stored_file = storage.upload(
            domain="archive",
            object_name=object_name,
            data=file_bytes,
            content_type=file.content_type or "application/octet-stream",
            metadata={"uploader_id": user.user_id},
        )
    except Exception as exc:
        logger.error("File upload failed: %s", exc)
        raise HTTPException(500, f"Storage error: {exc}")
    
    # 2. Create Document record
    doc = Document(
        title=doc_title,
        file_path=stored_file.object_name,
        file_type=file_type,
        file_size_bytes=stored_file.size_bytes,
        domain=domain,
        org_id=user.org_id,
        created_by=user.user_id,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    # 3. Ingest (parse -> chunk -> embed -> index)
    doc = ingest(db, doc, raw_content=file_bytes)
    
    return doc


@router.get("", response_model=DocumentList)
def list_documents(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    domain: str | None = None,
    db: Session = Depends(get_db),
    user: PlatformUser = Depends(get_platform_user),
) -> Any:
    """List documents in the archive."""
    q = db.query(Document)
    if user.org_id:
        q = q.filter(Document.org_id == user.org_id)
    if domain:
        q = q.filter(Document.domain == domain)
        
    total = q.count()
    items = q.order_by(Document.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.get("/{document_id}", response_model=DocumentOut)
def get_document(
    document_id: str,
    db: Session = Depends(get_db),
    user: PlatformUser = Depends(get_platform_user),
) -> Any:
    """Get a specific document."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(404, "Document not found")
    if doc.org_id and doc.org_id != user.org_id:
        raise HTTPException(403, "Access denied")
    return doc


@router.patch("/{document_id}", response_model=DocumentOut)
def update_document(
    document_id: str,
    payload: DocumentUpdate,
    db: Session = Depends(get_db),
    user: PlatformUser = Depends(get_platform_user),
) -> Any:
    """Update document metadata or content. Triggers re-ingestion if content changes."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(404, "Document not found")
    if doc.org_id and doc.org_id != user.org_id:
        raise HTTPException(403, "Access denied")
        
    reindex_needed = False
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(doc, k, v)
        if k == "content":
            reindex_needed = True
            
    doc.version += 1
    db.commit()
    db.refresh(doc)
    
    if reindex_needed and doc.content:
        doc = ingest(db, doc)
        
    return doc


@router.delete("/{document_id}", status_code=204)
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    user: PlatformUser = Depends(get_platform_user),
) -> None:
    """Delete a document and its chunks."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(404, "Document not found")
    if doc.org_id and doc.org_id != user.org_id:
        raise HTTPException(403, "Access denied")
        
    # Delete from MinIO if exists
    if doc.file_path:
        from app.core.storage.file_service import get_file_service
        try:
            get_file_service().delete(domain="archive", object_name=doc.file_path)
        except Exception as exc:
            logger.warning("Failed to delete file from storage: %s", exc)
            
    # OpenSearch deletion omitted for brevity, but would happen here
    
    db.delete(doc)
    db.commit()
