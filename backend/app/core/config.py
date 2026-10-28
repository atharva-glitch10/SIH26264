import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent

from pydantic import ConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AICTE Integrated Institution Complaint Monitoring System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{BASE_DIR}/backend/aicte_complaints.db"
    )
    
    # Config paths
    CONFIG_DIR: Path = BASE_DIR / "config"
    WORKFLOW_RULES_PATH: Path = CONFIG_DIR / "workflow_rules.json"
    SLA_RULES_PATH: Path = CONFIG_DIR / "sla_rules.json"
    OVERLAP_RULES_PATH: Path = CONFIG_DIR / "overlap_rules.json"
    DATA_DIR: Path = BASE_DIR / "data"

    model_config = ConfigDict(case_sensitive=True)

settings = Settings()
