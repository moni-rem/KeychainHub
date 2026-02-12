from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    role: str = Field(default="user")  # e.g., "user" or "admin"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)
