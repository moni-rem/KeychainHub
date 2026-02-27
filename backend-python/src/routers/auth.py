# # 🔐 login/register/refresh/logout
# from fastapi import APIRouter, Depends, HTTPException
# from sqlmodel import Session, select
# from datetime import datetime, timedelta

# from ..database import get_session
# from ..schemas.auth import Register, Login, VerifyOTP
# from ..models.user import User
# from ..services.auth_service import *
# from ..services.email_service import send_verification_email

# router = APIRouter()

# @router.post("/register")
# async def register(data: Register, session: Session = Depends(get_session)):
#     otp = generate_otp()

#     user = User(
#         name=data.name,
#         email=data.email,
#         hashed_password=hash_password(data.password),
#         verification_code=otp,
#         verification_expires=datetime.utcnow() + timedelta(minutes=10)
#     )

#     session.add(user)
#     session.commit()

#     await send_verification_email(user.email, otp)

#     return {"message": "User created. Verify email."}


# @router.post("/verify")
# def verify(data: VerifyOTP, session: Session = Depends(get_session)):
#     user = session.exec(select(User).where(User.email == data.email)).first()

#     if not user or user.verification_code != data.code:
#         raise HTTPException(400, "Invalid code")

#     user.is_verified = True
#     user.verification_code = None
#     session.commit()

#     return {"message": "Verified"}


# @router.post("/login")
# def login(data: Login, session: Session = Depends(get_session)):
#     user = session.exec(select(User).where(User.email == data.email)).first()

#     if not user or not verify_password(data.password, user.hashed_password):
#         raise HTTPException(401, "Invalid credentials")

#     if not user.is_verified:
#         raise HTTPException(403, "Email not verified")

#     access = create_access_token(user)
#     refresh = create_refresh_token(user, session)

#     return {"access_token": access, "refresh_token": refresh}
# @router.post("/refresh")
# def refresh(token: str, session: Session = Depends(get_session)):
#     from ..services.auth_service import rotate_refresh_token   # ← import HERE only when needed
#     return rotate_refresh_token(token, session)
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import select

from src.database import get_session               # ← absolute import (safer)
from src.models.user import User
from src.config import ALGORITHM, SECRET_KEY
from src.redis_client import redis_client          # ← absolute import recommended

from jose import JWTError, jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session = Depends(get_session)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # ─── Check if token is blacklisted (revoked) ──────────────────────
    if redis_client.get(f"blacklist:{token}"):
        raise credentials_exception

    # ─── Validate JWT ─────────────────────────────────────────────────
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # ─── Find user ────────────────────────────────────────────────────
    user = session.exec(select(User).where(User.email == email)).first()
    if user is None:
        raise credentials_exception

    return user


# ─── Logout endpoint ──────────────────────────────────────────────────
# Should be in routers/auth.py or similar, not mixed with dependencies
from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/logout")
def logout(
    current_user = Depends(get_current_user),           # enforces valid token
    token: str = Depends(oauth2_scheme)                 # get token from header
):
    """
    Blacklist the current access token (logout)
    """
    # Set token to blacklisted (expire after typical access token lifetime)
    redis_client.set(f"blacklist:{token}", "revoked", ex=3600)  # 1 hour

    return {"message": "Logged out successfully"}
# In src/routers/auth.py  (add at the end or in a logical place)

from fastapi import Depends, APIRouter
from ..dependencies import get_current_user, oauth2_scheme   # or from src.dependencies import ...

router = APIRouter(prefix="/auth", tags=["auth"])   # if not already defined

@router.post("/logout")
def logout(
    token: str = Depends(oauth2_scheme),
    current_user = Depends(get_current_user)   # optional: ensures user is valid
):
    redis_client.set(f"blacklist:{token}", "revoked", ex=3600)  # 1 hour
    return {"message": "Logged out successfully"}
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from datetime import datetime, timedelta

from src.database import get_session
from src.schemas.auth import Register, Login, VerifyOTP
from src.models.user import User
from src.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    generate_otp,
    hash_token
)
from src.services.email_service import send_verification_email
from src.redis_client import redis_client
from jose import JWTError, jwt
from src.config import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


@router.post("/register")
async def register(data: Register, session: Session = Depends(get_session)):
    # Check if email already exists
    existing = session.exec(select(User).where(User.email == data.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    otp = generate_otp()
    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        verification_code=otp,
        verification_expires=datetime.utcnow() + timedelta(minutes=10)
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    await send_verification_email(user.email, otp)
    return {"message": "User created. Check your email for verification code."}


@router.post("/verify")
def verify(data: VerifyOTP, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == data.email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.verification_code != data.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    if user.verification_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification code expired")

    user.is_verified = True
    user.verification_code = None
    user.verification_expires = None
    session.add(user)
    session.commit()

    return {"message": "Email verified successfully. You can now log in."}


@router.post("/login")
def login(data: Login, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == data.email)).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified. Please verify first.")

    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user, session)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/logout")
def logout(token: str = Depends(oauth2_scheme)):
    """
    Blacklist the current access token (logout)
    """
    redis_client.set(f"blacklist:{token}", "revoked", ex=3600)  # 1 hour expiration
    return {"message": "Logged out successfully"}
@router.post("/register")
async def register(data: Register, session: Session = Depends(get_session)):
    # simple version without email check for quick test
    otp = generate_otp()
    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        verification_code=otp,
        verification_expires=datetime.utcnow() + timedelta(minutes=10)
    )
    session.add(user)
    session.commit()
    # await send_verification_email(...)   ← comment this if email fails
    return {"message": "User created (verification skipped for test)"}


@router.post("/login")
def login(data: Login, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == data.email)).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    # if not user.is_verified: raise ...   ← comment if verification not done
    access = create_access_token(user)
    refresh = create_refresh_token(user, session)
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}