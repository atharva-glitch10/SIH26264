#!/bin/sh
set -e
# Seed synthetic demo data only when the database has no cases yet (never wipes real data).
python - <<'PY'
from sqlalchemy import inspect, text
from backend.app.core.database import engine
needs_seed = True
if inspect(engine).has_table("cases"):
    with engine.connect() as c:
        needs_seed = c.execute(text("SELECT COUNT(*) FROM cases")).scalar() == 0
if needs_seed:
    print("Empty database - seeding synthetic demo data")
    from scripts.generate_demo_data import generate_synthetic_dataset
    generate_synthetic_dataset()
PY
exec uvicorn backend.app.main:app --host 0.0.0.0 --port 8080
