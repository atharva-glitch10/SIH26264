import os
from pathlib import Path
from pydantic import ConfigDict
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "AICTE Integrated Institution Complaint Monitoring System"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"

    # Database (SQLite by default; set DATABASE_URL=postgresql+psycopg2://... for PostgreSQL)
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/backend/aicte_complaints.db")

    # Authentication
    AUTH_ENABLED: bool = True
    SECRET_KEY: str = "change-me-in-production-sih26264-demo-secret-key"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    DEMO_MODE: bool = True  # shows demo accounts on the login screen; set False for real deployments
    DEMO_PASSWORD: str = "Aicte@2026"  # assigned to seeded demo officers only
    INTAKE_API_KEY: str = ""  # if set, external systems may push complaints with header X-API-Key

    # Background SLA monitor
    SLA_MONITOR_ENABLED: bool = True
    SLA_SCAN_INTERVAL_MINUTES: int = 15

    # CORS (comma-separated origins)
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Config paths
    CONFIG_DIR: Path = BASE_DIR / "config"
    WORKFLOW_RULES_PATH: Path = CONFIG_DIR / "workflow_rules.json"
    SLA_RULES_PATH: Path = CONFIG_DIR / "sla_rules.json"
    OVERLAP_RULES_PATH: Path = CONFIG_DIR / "overlap_rules.json"
    DATA_DIR: Path = BASE_DIR / "data"

    model_config = ConfigDict(case_sensitive=True, env_file=".env", extra="ignore")


settings = Settings()
