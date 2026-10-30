"""
Minimal additive schema migration.

`Base.metadata.create_all` creates missing tables but never adds new columns to
an existing table. This helper adds any column defined in the ORM models that
is missing from the live database (SQLite and PostgreSQL), so an older
aicte_complaints.db keeps working after an upgrade. For production, replace
this with Alembic.
"""
import logging
from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

from backend.app.core.database import Base

log = logging.getLogger(__name__)


def ensure_schema(engine: Engine) -> list:
    import backend.app.models.models  # noqa: F401  (register models)

    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    added = []
    with engine.begin() as conn:
        for table in Base.metadata.sorted_tables:
            if not inspector.has_table(table.name):
                continue
            existing = {c["name"] for c in inspector.get_columns(table.name)}
            for column in table.columns:
                if column.name in existing:
                    continue
                col_type = column.type.compile(dialect=engine.dialect)
                conn.execute(text(f'ALTER TABLE {table.name} ADD COLUMN {column.name} {col_type}'))
                added.append(f"{table.name}.{column.name}")
    if added:
        log.info("Schema upgraded, added columns: %s", ", ".join(added))
    return added
