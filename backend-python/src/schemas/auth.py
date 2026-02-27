# src/schemas/auth.py

from pydantic import BaseModel, EmailStr

class Register(BaseModel):
    name: str
    email: EmailStr
    password: str

class Login(BaseModel):
    email: EmailStr
    password: str          # ← fixed: removed ()

class VerifyOTP(BaseModel):
    email: EmailStr
    code: str

# If you're still using this line (from previous circular import discussion)
# Either keep it commented out or move the import inside the function as discussed before
# from src.services.auth_service import rotate_refresh_token
# ... your existing imports and get_current_user ...
