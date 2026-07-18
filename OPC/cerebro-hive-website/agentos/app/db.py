from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings

settings = get_settings()


def _normalize_database_url(url: str) -> str:
    """Railway/Render/Heroku-style managed Postgres all hand you a
    `postgres://...` DATABASE_URL. SQLAlchemy 2.x + psycopg2 needs the
    `postgresql://` (or `postgresql+psycopg2://`) scheme, so this rewrites it
    rather than requiring everyone deploying this to remember that gotcha.
    """
    if url.startswith("postgres://"):
        return "postgresql+psycopg2://" + url[len("postgres://") :]
    return url


database_url = _normalize_database_url(settings.database_url)
connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
engine = create_engine(database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    # Import models so they register on Base.metadata before create_all.
    from app.models import (  # noqa: F401
        execution,
        governance,
        identity,
        knowledge,
        marketplace,
        memory,
        observability,
        registry,
        tools,
    )

    Base.metadata.create_all(bind=engine)
