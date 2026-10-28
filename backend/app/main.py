from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.core.config import settings
from backend.app.core.database import engine, Base
import backend.app.models.models  # Ensure models are loaded for table creation
from backend.app.api.routes import (
    health_router,
    dashboard_router,
    institutions_router,
    cases_router,
    overlaps_router,
    matching_router,
    alerts_router,
    reports_router,
    imports_router,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Centralized AICTE Institution Complaint Monitoring, Workflow, SLA Tracking, and Cross-Bureau Overlap Detection Dashboard",
    lifespan=lifespan
)

# CORS setup for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root health check
app.include_router(health_router)

# API v1 routes
v1_prefix = settings.API_V1_STR
app.include_router(health_router, prefix=v1_prefix)
app.include_router(dashboard_router, prefix=v1_prefix)
app.include_router(institutions_router, prefix=v1_prefix)
app.include_router(cases_router, prefix=v1_prefix)
app.include_router(overlaps_router, prefix=v1_prefix)
app.include_router(matching_router, prefix=v1_prefix)
app.include_router(alerts_router, prefix=v1_prefix)
app.include_router(reports_router, prefix=v1_prefix)
app.include_router(imports_router, prefix=v1_prefix)

@app.get("/")
def root():
    return {
        "message": "AICTE Integrated Institution Complaint Monitoring System API",
        "documentation": "/docs",
        "version": settings.VERSION,
        "mode": "SYNTHETIC_DEMO_ENVIRONMENT"
    }
