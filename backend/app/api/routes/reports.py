from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from backend.app.core.database import get_db
from backend.app.services.report_service import (
    get_dashboard_summary, get_bureau_workload, get_status_distribution,
    get_region_distribution, get_ageing_analysis, get_monthly_trends,
    generate_excel_report, get_model_metrics
)
from backend.app.api.deps import get_current_user, ensure_permission

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

@router.get("/summary")
def get_reports_summary(db: Session = Depends(get_db)):
    summary = get_dashboard_summary(db)
    bureau_workload = get_bureau_workload(db)
    status_dist = get_status_distribution(db)
    region_dist = get_region_distribution(db)
    ageing = get_ageing_analysis(db)
    trends = get_monthly_trends(db)
    
    # Disposal rate calculation: Disposed / Total
    total = summary["total_cases"]
    disposed = summary["disposed_cases"]
    disposal_rate = round((disposed / total * 100), 1) if total > 0 else 0.0

    return {
        "summary": summary,
        "disposal_rate_percentage": disposal_rate,
        "bureau_workload": bureau_workload,
        "status_distribution": status_dist,
        "region_distribution": region_dist,
        "ageing_analysis": ageing,
        "monthly_trends": trends
    }

@router.get("/model-metrics")
def model_metrics():
    """Measured accuracy of matching, classification and duplicate detection."""
    return get_model_metrics()


@router.get("/export")
def export_excel_report(db: Session = Depends(get_db), user=Depends(get_current_user)):
    ensure_permission(user, "export")
    excel_stream = generate_excel_report(db)
    filename = f"AICTE_Institution_Complaint_Report_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    return Response(
        content=excel_stream.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
