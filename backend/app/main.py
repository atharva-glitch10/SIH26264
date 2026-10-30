import asyncio
import logging
from contextlib import asynccontextmanager, suppress

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.deps import get_viewer
from backend.app.api.routes import (
    alerts_router,
    auth_router,
    cases_router,
    dashboard_router,
    health_router,
    imports_router,
    institutions_router,
    intake_router,
    matching_router,
    overlaps_router,
    public_router,
    reports_router,
)
from backend.app.core.config import settings
from backend.app.core.database import SessionLocal, engine
from backend.app.core.migrations import ensure_schema
from backend.app.core.security import hash_password
from backend.app.models.models import User
from backend.app.services.sla_monitor_service import sla_monitor_loop

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("aicte")


def _ensure_demo_passwords() -> None:
    """Older databases have officers without passwords; give them the demo password (demo mode only)."""
    if not settings.DEMO_MODE:
        return
    db = SessionLocal()
    try:
        missing = db.query(User).filter(User.password_hash.is_(None)).all()
        for u in missing:
            u.password_hash = hash_password(settings.DEMO_PASSWORD)
        if missing:
            db.commit()
            log.info("Assigned demo password to %d officer account(s)", len(missing))
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    added = ensure_schema(engine)
    if added:
        log.info("Database upgraded with new columns: %s", ", ".join(added))
    _ensure_demo_passwords()
    task = None
    if settings.SLA_MONITOR_ENABLED:
        task = asyncio.create_task(sla_monitor_loop(SessionLocal))
        log.info("SLA monitor running every %d minute(s)", settings.SLA_SCAN_INTERVAL_MINUTES)
    yield
    if task:
        task.cancel()
        with suppress(asyncio.CancelledError):
            await task


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Centralized AICTE institution complaint monitoring with smart intake (auto-linking, "
        "classification, duplicate detection), cross-bureau overlap detection, SLA monitoring, "
        "role-based access and analytics."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

v1 = settings.API_V1_STR
protected = [Depends(get_viewer)]  # every data endpoint requires a signed-in officer

app.include_router(health_router)
app.include_router(health_router, prefix=v1)
app.include_router(auth_router, prefix=v1)
app.include_router(intake_router, prefix=v1)  # handles its own auth (supports X-API-Key)
app.include_router(public_router, prefix=v1)  # public complaint tracker: no login, minimal fields
app.include_router(dashboard_router, prefix=v1, dependencies=protected)
app.include_router(institutions_router, prefix=v1, dependencies=protected)
app.include_router(cases_router, prefix=v1, dependencies=protected)
app.include_router(overlaps_router, prefix=v1, dependencies=protected)
app.include_router(matching_router, prefix=v1, dependencies=protected)
app.include_router(alerts_router, prefix=v1, dependencies=protected)
app.include_router(reports_router, prefix=v1, dependencies=protected)
app.include_router(imports_router, prefix=v1, dependencies=protected)


@app.get("/")
def root():
    return {
        "message": "AICTE Integrated Institution Complaint Monitoring System API",
        "documentation": "/docs",
        "version": settings.VERSION,
        "mode": "SYNTHETIC_DEMO_ENVIRONMENT" if settings.DEMO_MODE else "PRODUCTION",
    }
