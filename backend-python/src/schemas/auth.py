from pydantic import BaseModel, EmailStr

class Register(BaseModel):
    name: str
    email: EmailStr
    password: str

class Login(BaseModel):
    email: EmailStr
    password: str
class VerifyOTP(BaseModel):
    email: EmailStr
    code: str
from src.services.auth_service import rotate_refresh_token
@router.post("/refresh")
def refresh(token: str, session: Session = Depends(get_session)):
    return rotate_refresh_token(token, session)