"""
Authentication dependency and role-based access rules.

Visibility: every signed-in officer can VIEW all institutions and cases. That is
the point of the PS (cross-bureau visibility). Changes are scoped:

| Role              | Can change                                                       |
|-------------------|------------------------------------------------------------------|
| SUPER_ADMIN       | everything                                                       |
| SENIOR_MANAGEMENT | any case, overlap decisions, matching review, imports            |
| BUREAU_OFFICER    | cases currently with their own bureau; register/import complaints|
|                   | into their own bureau; overlap alerts involving their bureau;    |
|                   | institution matching review                                      |
| REGIONAL_OFFICER  | read-only (dashboards, reports, export)                          |
| SYSTEM_INTEGRATION| only the external intake API (X-API-Key)                         |
"""
from typing import Iterable, List, Optional

import jwt
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.core.security import decode_access_token
from backend.app.models.models import User

ADMIN_ROLES = {"SUPER_ADMIN", "SENIOR_MANAGEMENT"}

ROLE_PERMISSIONS = {
    "SUPER_ADMIN": ["view", "case:act:any", "case:register:any", "import:any", "overlap:decide:any",
                    "matching:review", "sla:run", "export"],
    "SENIOR_MANAGEMENT": ["view", "case:act:any", "case:register:any", "import:any", "overlap:decide:any",
                          "matching:review", "sla:run", "export"],
    "BUREAU_OFFICER": ["view", "case:act:own_bureau", "case:register:own_bureau", "import:own_bureau",
                       "overlap:decide:involved", "matching:review", "export"],
    "REGIONAL_OFFICER": ["view", "export"],
    "SYSTEM_INTEGRATION": ["case:register:any"],
}


class _SystemUser:
    """Pseudo-user for API-key integrations and for AUTH_ENABLED=false demos."""

    def __init__(self, user_id: str, role: str, display_name: str):
        self.user_id = user_id
        self.role = role
        self.display_name = display_name
        self.bureau_id = None
        self.email = None
        self.active = True


def permissions_for(user) -> List[str]:
    return ROLE_PERMISSIONS.get(user.role, [])


def get_current_user(
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    if not settings.AUTH_ENABLED:
        user = db.query(User).filter(User.role == "SUPER_ADMIN").first()
        return user or _SystemUser("USR-SUPER-01", "SUPER_ADMIN", "Demo Administrator")

    if x_api_key and settings.INTAKE_API_KEY and x_api_key == settings.INTAKE_API_KEY:
        return _SystemUser("USR-SYS-INTEGRATION", "SYSTEM_INTEGRATION", "External Intake Integration")

    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated",
                            headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = decode_access_token(authorization.split(" ", 1)[1])
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired or invalid token",
                            headers={"WWW-Authenticate": "Bearer"})
    user = db.query(User).filter(User.user_id == payload.get("sub"), User.active == True).first()  # noqa: E712
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user


def get_viewer(user=Depends(get_current_user)):
    """Any signed-in human officer (integration keys cannot browse data)."""
    if "view" not in permissions_for(user):
        raise HTTPException(status_code=403, detail="This account cannot view dashboard data")
    return user


def require_roles(*roles: str):
    def checker(user=Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(status_code=403, detail=f"Requires role: {', '.join(roles)}")
        return user
    return checker


def _forbid(message: str):
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=message)


def ensure_can_act_on_case(user, case) -> None:
    perms = permissions_for(user)
    if "case:act:any" in perms:
        return
    if "case:act:own_bureau" in perms and user.bureau_id and case.current_bureau_id == user.bureau_id:
        return
    _forbid(f"Only {case.current_bureau_id} officers or senior management can act on {case.case_id}")


def ensure_can_register(user, bureau_id: str) -> None:
    perms = permissions_for(user)
    if "case:register:any" in perms:
        return
    if "case:register:own_bureau" in perms and user.bureau_id == bureau_id:
        return
    _forbid(f"You can only register complaints for your own bureau ({user.bureau_id or 'none'})")


def ensure_can_import(user, bureau_id: Optional[str]) -> None:
    perms = permissions_for(user)
    if "import:any" in perms:
        return
    if "import:own_bureau" in perms and (bureau_id is None or user.bureau_id == bureau_id):
        return
    _forbid("You can only import complaints into your own bureau")


def ensure_can_decide_overlap(user, involved_bureaus: Iterable[str]) -> None:
    perms = permissions_for(user)
    if "overlap:decide:any" in perms:
        return
    if "overlap:decide:involved" in perms and user.bureau_id in set(involved_bureaus):
        return
    _forbid("Only officers of an involved bureau or senior management can act on this overlap alert")


def ensure_permission(user, permission: str) -> None:
    if permission not in permissions_for(user):
        _forbid(f"Missing permission: {permission}")
