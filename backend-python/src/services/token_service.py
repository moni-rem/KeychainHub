# src/services/token_service.py
from datetime import datetime, timedelta
import secrets
import hashlib

from ..config import REFRESH_TOKEN_EXPIRE_DAYS
from ..models.refresh_token import RefreshToken

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def rotate_refresh_token(old_refresh_token: str, session) -> dict:
    """
    Validates old refresh token, invalidates it, issues new access + refresh tokens.
    Returns something like {"access_token": "...", "refresh_token": "...", ...}
    """
    token_hash = hash_token(old_refresh_token)
    
    stmt = select(RefreshToken).where(
        RefreshToken.token_hash == token_hash,
        RefreshToken.expires_at > datetime.utcnow()
    )
    db_token = session.exec(stmt).first()
    
    if not db_token:
        raise ValueError("Invalid or expired refresh token")
    
    # Invalidate old token (you can delete or set expires_at to past)
    session.delete(db_token)
    session.commit()
    
    # Get user (assuming you have user_id on RefreshToken)
    user = session.get(User, db_token.user_id)
    if not user:
        raise ValueError("User not found")
    
    # Create new refresh token
    new_raw_refresh = secrets.token_urlsafe(64)
    new_refresh_hash = hash_token(new_raw_refresh)
    
    new_db_token = RefreshToken(
        token_hash=new_refresh_hash,
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    session.add(new_db_token)
    session.commit()
    
    # Create new access token
    new_access = create_access_token(user)
    
    return {
        "access_token": new_access,
        "refresh_token": new_raw_refresh,
        "token_type": "bearer"
    }