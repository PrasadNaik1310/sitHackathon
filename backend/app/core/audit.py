"""Audit logging helper — called from service layer."""
import json
from typing import Any, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import AuditLog


async def log_audit(
    db: AsyncSession,
    actor_id: Optional[UUID],
    action: str,
    entity_type: str,
    entity_id: Optional[str] = None,
    old_value: Any = None,
    new_value: Any = None,
) -> None:
    def _serialize(v: Any) -> Optional[str]:
        if v is None:
            return None
        if isinstance(v, str):
            return v
        return json.dumps(v, default=str)

    entry = AuditLog(
        actor_id=actor_id,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id else None,
        old_value=_serialize(old_value),
        new_value=_serialize(new_value),
    )
    db.add(entry)
    await db.flush()
