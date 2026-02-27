# # src/models/user.py
# # ────────────────────────────────────────────────
# # Minimal correct User model – overwrite entire file with this

# from typing import Optional
# from datetime import datetime
# from sqlmodel import SQLModel, Field

# class User(SQLModel, table=True):
#     id: Optional[int] = Field(default=None, primary_key=True)
#     name: str
#     email: str = Field(unique=True, index=True)
#     hashed_password: str
#     role: str = Field(default="user")
#     created_at: datetime = Field(default_factory=datetime.utcnow)
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    hashed_password: str
    role: str = Field(default="user")

    is_verified: bool = Field(default=False)
    verification_code: Optional[str] = None
    verification_expires: Optional[datetime] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)