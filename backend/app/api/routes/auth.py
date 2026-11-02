from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from backend.app.api.deps import get_current_user, permissions_for
from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.core.security import create_access_token, verify_password
from backend.app.models.models import User
from backend.app.schemas.schemas import LoginRequest, TokenOut, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenOut)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    ident = data.username.strip()
    user = db.query(User).filter(
        or_(User.user_id == ident, User.email == ident.lower()), User.active == True  # noqa: E712
    ).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_access_token(user.user_id, {"role": user.role, "bureau_id": user.bureau_id})
    return {
        "access_token": token,
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": UserOut.model_validate(user),
        "permissions": permissions_for(user),
    }


@router.get("/me")
def me(user=Depends(get_current_user)):
    return {
        "user_id": user.user_id, "display_name": user.display_name, "role": user.role,
        "bureau_id": user.bureau_id, "email": getattr(user, "email", None),
        "terms_accepted_at": user.terms_accepted_at,
        "permissions": permissions_for(user),
    }


@router.post("/accept-terms")
def accept_terms(user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Record that the signed-in officer accepted the Terms of Use and Privacy Notice."""
    # get_current_user may come from another session; re-load so the update is persisted by this one.
    row = db.query(User).filter(User.user_id == user.user_id).first()
    if row is None:
        raise HTTPException(status_code=404, detail="User not found")
    row.terms_accepted_at = datetime.now(timezone.utc)
    db.commit()
    return {"terms_accepted_at": row.terms_accepted_at}


@router.get("/demo-accounts")
def demo_accounts(db: Session = Depends(get_db)):
    """Seeded demo officers for the hackathon login screen (synthetic data only)."""
    if not settings.DEMO_MODE:
        raise HTTPException(status_code=404, detail="Not available")
    users = db.query(User).filter(User.active == True, User.password_hash.isnot(None)).all()  # noqa: E712
    return {
        "demo_password": settings.DEMO_PASSWORD,
        "accounts": [{"user_id": u.user_id, "display_name": u.display_name, "role": u.role,
                      "bureau_id": u.bureau_id} for u in users],
    }
