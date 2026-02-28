from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

from urllib.parse import urlparse, urlunparse
parsed = urlparse(settings.DATABASE_URL)
# Reconstruct without query params, asyncpg kwargs handle SSL/Prepared statements
_db_url = urlunparse((parsed.scheme, parsed.netloc, parsed.path, "", "", parsed.fragment))

import uuid
from sqlalchemy.pool import NullPool

# Supabase / remote PostgreSQL requires SSL
_is_remote = "supabase.co" in settings.DATABASE_URL or "ssl" in settings.DATABASE_URL.lower()

engine = create_async_engine(
    _db_url,
    echo=settings.APP_DEBUG,
    poolclass=NullPool,
    connect_args={
        "ssl": "require" if _is_remote else None,
        "server_settings": {"jit": "off"},
        "prepared_statement_name_func": lambda: f"__asyncpg_{uuid.uuid4().hex}__",
        "statement_cache_size": 0,
    },
)

# Crucial for PgBouncer / Supabase Transaction Mode:
# Disable SQLAlchemy statement caching which conflicts with asyncpg's Prepared Statements
engine.sync_engine.execution_options(compiled_cache=None)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
