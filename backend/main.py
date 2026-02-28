"""
FastAPI Application Entrypoint

Government-Integrated Banking Credit Lifecycle System
GST-Based Invoice Discounting Platform
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import engine, Base
from app.logging_config import setup_logging, logger
from app.jobs.scheduler import setup_scheduler, scheduler

# Import all models to ensure they register with Base.metadata
import app.models  # noqa: F401

from app.routers import auth, kyc, offers, loans, repayments, admin, identity
from app.routers import invoices, businesses, recovery as recovery_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info("startup.begin", env=settings.APP_ENV)

    # Auto-create tables — non-fatal if DB unreachable at startup
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("startup.db_tables_ready")
    except Exception as e:
        logger.warning("startup.db_unavailable", error=str(e))
        logger.warning("startup.db_note", msg="Server starting anyway — DB will connect on first request")

    # Start APScheduler
    setup_scheduler(app)
    scheduler.start()
    logger.info("startup.scheduler_started", job_count=4)

    yield

    # Graceful shutdown
    scheduler.shutdown(wait=False)
    await engine.dispose()
    logger.info("shutdown.complete")


app = FastAPI(
    title="GST Banking Credit Lifecycle System",
    description=(
        "Production-ready Government-Integrated Banking Credit Lifecycle System "
        "for GST-based Invoice Discounting. Covers KYC → Risk Assessment → "
        "Credit Decision → Sanction → Disbursement → Repayment → Default → Recovery."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global error handler ──────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("unhandled_exception", path=str(request.url), error=str(exc), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(kyc.router)
app.include_router(businesses.router)
app.include_router(invoices.router)
app.include_router(offers.router)
app.include_router(loans.router)
app.include_router(repayments.router)
app.include_router(recovery_router.router)
app.include_router(admin.router)
app.include_router(identity.router)


# ── Health / Meta ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Meta"])
async def health_check():
    return {
        "status": "ok",
        "service": "gst-credit-lifecycle",
        "version": "1.0.0",
        "env": settings.APP_ENV,
    }


@app.get("/", tags=["Meta"])
async def root():
    return {
        "message": "GST Banking Credit Lifecycle API",
        "docs": "/docs",
        "health": "/health",
    }
