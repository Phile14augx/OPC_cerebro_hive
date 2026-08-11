"""Archive domain router — aggregates all sub-routers under /api/archive."""

from fastapi import APIRouter

from app.archive.documents.router import router as documents_router
from app.archive.prompts.router import router as prompts_router
from app.archive.search.router import router as search_router

router = APIRouter(prefix="/api/v1/modules/archive")

router.include_router(documents_router)
router.include_router(search_router)
router.include_router(prompts_router)
