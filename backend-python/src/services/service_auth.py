# from datetime import datetime
# from sqlmodel import select
# from fastapi import HTTPException
# from jose import jwt, JWTError

# from ..models.refresh_token import RefreshToken
# from ..models.user import User
# from ..security import create_access_token, create_refresh_token, hash_token
# from ..config import SECRET_KEY, ALGORITHM
# from ..redis_client import redis_client
# def rotate_refresh_token(refresh_token: str, session):

#     try:
#         payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
#         user_id = payload.get("user_id")
#     except JWTError:
#         raise HTTPException(401, "Invalid refresh token")

#     token_hash = hash_token(refresh_token)

#     db_token = session.exec(
#         select(RefreshToken).where(
#             RefreshToken.token_hash == token_hash
#         )
#     ).first()

#     if not db_token:
#         raise HTTPException(401, "Token reuse detected")

#     if db_token.revoked:
#         raise HTTPException(401, "Token already revoked")

#     if db_token.expires_at < datetime.utcnow():
#         raise HTTPException(401, "Token expired")

#     # revoke old token
#     db_token.revoked = True
#     session.add(db_token)

#     # create new tokens
#     user = session.get(User, user_id)

#     new_access = create_access_token({"sub": user.email})
#     new_refresh = create_refresh_token({"user_id": user.id})

#     new_token_hash = hash_token(new_refresh)

#     new_db_token = RefreshToken(
#         user_id=user.id,
#         token_hash=new_token_hash,
#         expires_at=datetime.utcnow() + timedelta(days=7),
#     )

#     session.add(new_db_token)
#     session.commit()

#     # Store active token in Redis
#     redis_client.set(
#         f"refresh:{new_token_hash}",
#         "valid",
#         ex=60 * 60 * 24 * 7
#     )

#     return {
#         "access_token": new_access,
#         "refresh_token": new_refresh
#     }
# import hashlib

# def hash_token(token: str) -> str:
#     return hashlib.sha256(token.encode()).hexdigest()
# from datetime import datetime
# from sqlmodel import select
# from fastapi import HTTPException
# from jose import jwt, JWTError

# from ..models.refresh_token import RefreshToken
# from ..models.user import User
# from ..security import create_access_token, create_refresh_token, hash_token
# from ..config import SECRET_KEY, ALGORITHM
# from ..redis_client import redis_client


# def rotate_refresh_token(refresh_token: str, session):

#     try:
#         payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
#         user_id = payload.get("user_id")
#     except JWTError:
#         raise HTTPException(401, "Invalid refresh token")

#     token_hash = hash_token(refresh_token)

#     db_token = session.exec(
#         select(RefreshToken).where(
#             RefreshToken.token_hash == token_hash
#         )
#     ).first()

#     if not db_token:
#         raise HTTPException(401, "Token reuse detected")

#     if db_token.revoked:
#         raise HTTPException(401, "Token already revoked")

#     if db_token.expires_at < datetime.utcnow():
#         raise HTTPException(401, "Token expired")

#     # revoke old token
#     db_token.revoked = True
#     session.add(db_token)

#     # create new tokens
#     user = session.get(User, user_id)

#     new_access = create_access_token({"sub": user.email})
#     new_refresh = create_refresh_token({"user_id": user.id})

#     new_token_hash = hash_token(new_refresh)

#     new_db_token = RefreshToken(
#         user_id=user.id,
#         token_hash=new_token_hash,
#         expires_at=datetime.utcnow() + timedelta(days=7),
#     )

#     session.add(new_db_token)
#     session.commit()

#     # Store active token in Redis
#     redis_client.set(
#         f"refresh:{new_token_hash}",
#         "valid",
#         ex=60 * 60 * 24 * 7
#     )

#     return {
#         "access_token": new_access,
#         "refresh_token": new_refresh
#     }
from datetime import datetime, timedelta
from jose import jwt
from src.config import settings


def rotate_refresh_token(user_id: str):
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }

    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
