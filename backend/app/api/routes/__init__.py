from backend.app.api.routes.health import router as health_router
from backend.app.api.routes.dashboard import router as dashboard_router
from backend.app.api.routes.institutions import router as institutions_router
from backend.app.api.routes.cases import router as cases_router
from backend.app.api.routes.overlaps import router as overlaps_router
from backend.app.api.routes.matching import router as matching_router
from backend.app.api.routes.alerts import router as alerts_router
from backend.app.api.routes.reports import router as reports_router
from backend.app.api.routes.imports import router as imports_router

__all__ = [
    "health_router",
    "dashboard_router",
    "institutions_router",
    "cases_router",
    "overlaps_router",
    "matching_router",
    "alerts_router",
    "reports_router",
    "imports_router"
]
