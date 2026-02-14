# 🔐 login/register/refresh/logout
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime, timedelta

from ..database import get_session
from ..schemas.auth import Register, Login, VerifyOTP
from ..models.user import User
from ..services.auth_service import *
from ..services.email_service import send_verification_email

router = APIRouter()

@router.post("/register")
async def register(data: Register, session: Session = Depends(get_session)):
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

    await send_verification_email(user.email, otp)

    return {"message": "User created. Verify email."}


@router.post("/verify")
def verify(data: VerifyOTP, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == data.email)).first()

    if not user or user.verification_code != data.code:
        raise HTTPException(400, "Invalid code")

    user.is_verified = True
    user.verification_code = None
    session.commit()

    return {"message": "Verified"}


@router.post("/login")
def login(data: Login, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == data.email)).first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")

    if not user.is_verified:
        raise HTTPException(403, "Email not verified")

    access = create_access_token(user)
    refresh = create_refresh_token(user, session)

    return {"access_token": access, "refresh_token": refresh}
from ..services.auth_service import rotate_refresh_token

@router.post("/refresh")
def refresh(token: str, session: Session = Depends(get_session)):
    return rotate_refresh_token(token, session)