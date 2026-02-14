# from fastapi import APIRouter, Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordRequestForm
# from sqlmodel import Session, select
# from datetime import datetime, timedelta

# from ..database import get_session
# from ..models.user import User
# from ..models.refresh_token import RefreshToken
# from ..schemas.token import TokenWithRefresh
# from ..security import verify_password, create_access_token, create_refresh_token, hash_password
# from ..config import REFRESH_TOKEN_EXPIRE_DAYS

# router = APIRouter(prefix="/api/auth", tags=["auth"])

# @router.post("/register")
# def register(
#     email: str,
#     password: str,
#     session: Session = Depends(get_session)
# ):
#     # Check if user exists
#     existing_user = session.exec(select(User).where(User.email == email)).first()
#     if existing_user:
#         raise HTTPException(status_code=400, detail="Email already registered")

#     # Hash password and create user
#     hashed_password = hash_password(password)
#     user = User(email=email, hashed_password=hashed_password)
#     session.add(user)
#     session.commit()
#     session.refresh(user)
#     return {"message": "User registered successfully"}

# @router.post("/login", response_model=TokenWithRefresh)
# def login(
#     form_data: OAuth2PasswordRequestForm = Depends(),
#     session: Session = Depends(get_session)
# ):
#     user = session.exec(select(User).where(User.email == form_data.username)).first()
#     if not user or not verify_password(form_data.password, user.hashed_password):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Incorrect email or password",
#             headers={"WWW-Authenticate": "Bearer"},
#         )

#     access_token = create_access_token({"sub": user.email})
#     refresh_token_str = create_refresh_token({"sub": user.email})

#     # Store refresh token in DB
#     refresh_token_hash = hash_password(refresh_token_str)  # Hash for storage
#     refresh_token = RefreshToken(
#         user_id=user.id,
#         token_hash=refresh_token_hash,
#         expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
#     )
#     session.add(refresh_token)
#     session.commit()

#     return {
#         "access_token": access_token,
#         "refresh_token": refresh_token_str,
#         "token_type": "bearer"
#     }
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime

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
