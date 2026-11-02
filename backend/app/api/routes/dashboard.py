from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from backend.app.core.database import get_db
from backend.app.schemas.schemas import (
    DashboardSummaryOut, BureauWorkloadItem, StatusDistributionItem,
    RegionDistributionItem, AgeingBucketItem, MonthlyTrendItem
)
from backend.app.services.report_service import (
    get_dashboard_summary, get_bureau_workload, get_status_distribution,
    get_region_distribution, get_ageing_analysis, get_monthly_trends,
    get_automation_stats, get_hotspots
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryOut)
def summary(db: Session = Depends(get_db)):
    return get_dashboard_summary(db)

@router.get("/bureau-workload", response_model=List[BureauWorkloadItem])
def bureau_workload(db: Session = Depends(get_db)):
    return get_bureau_workload(db)

@router.get("/status-distribution", response_model=List[StatusDistributionItem])
def status_distribution(db: Session = Depends(get_db)):
    return get_status_distribution(db)

@router.get("/region-distribution", response_model=List[RegionDistributionItem])
def region_distribution(db: Session = Depends(get_db)):
    return get_region_distribution(db)

@router.get("/ageing", response_model=List[AgeingBucketItem])
def ageing(db: Session = Depends(get_db)):
    return get_ageing_analysis(db)

@router.get("/trends", response_model=List[MonthlyTrendItem])
def trends(db: Session = Depends(get_db)):
    return get_monthly_trends(db)


@router.get("/automation")
def automation_stats(db: Session = Depends(get_db)):
    """Smart-automation activity: auto-linking, auto-categorisation, duplicates, SLA alerts."""
    return get_automation_stats(db)


@router.get("/hotspots")
def hotspots(limit: int = 8, db: Session = Depends(get_db)):
    """Top-risk / repeat-offender institutions and state-wise complaint hotspots."""
    return get_hotspots(db, limit=limit)
