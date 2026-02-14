from datetime import datetime, timedelta
import secrets, hashlib, random
from jose import jwt
from argon2 import PasswordHasher
from sqlmodel import select

from ..config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
from ..models.refresh_token import RefreshToken
from ..models.user import User

pwd = PasswordHasher()

def hash_password(password):
    return pwd.hash(password)

def verify_password(plain, hashed):
    try:
        return pwd.verify(hashed, plain)
    except:
        return False

def create_access_token(user: User):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user.email, "role": user.role, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def generate_otp():
    return str(random.randint(100000, 999999))

def hash_token(token: str):
    return hashlib.sha256(token.encode()).hexdigest()

def create_refresh_token(user, session):
    raw = secrets.token_urlsafe(64)
    token_hash = hash_token(raw)

    db_token = RefreshToken(
        token_hash=token_hash,
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )

    session.add(db_token)
    session.commit()

    return raw
