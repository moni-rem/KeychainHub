async def send_verification_email(email: str, otp: str):
    print(f"Send OTP {otp} to {email}")
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from ..config import EMAIL_USER, EMAIL_PASS

conf = ConnectionConfig(
    MAIL_USERNAME=EMAIL_USER,
    MAIL_PASSWORD=EMAIL_PASS,
    MAIL_FROM=EMAIL_USER,
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_TLS=True,
    MAIL_SSL=False,
    USE_CREDENTIALS=True
)

async def send_verification_email(email: str, otp: str):
    message = MessageSchema(
        subject="Verify your account",
        recipients=[email],
        body=f"Your OTP is {otp}",
        subtype="plain"
    )
    fm = FastMail(conf)
    await fm.send_message(message)
