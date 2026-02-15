# src/services/email_service.py

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from ..config import EMAIL_USER, EMAIL_PASS  # These must exist in config.py

# Connection config (Gmail SMTP with STARTTLS on port 587)
conf = ConnectionConfig(
    MAIL_USERNAME=EMAIL_USER,
    MAIL_PASSWORD=EMAIL_PASS,
    MAIL_FROM=EMAIL_USER,               # sender email (same as username)
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,                 # Preferred in recent docs (STARTTLS)
    MAIL_SSL_TLS=False,                 # Not needed for 587
    MAIL_DEBUG=1,                       # Set to 1 for troubleshooting (logs)
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_verification_email(email: str, otp: str):
    """
    Sends OTP verification email asynchronously.
    """
    try:
        message = MessageSchema(
            subject="Verify Your KeychainHub Account",
            recipients=[email],
            body=f"""
            Hello,

            Your verification code (OTP) is: **{otp}**

            This code expires in 10 minutes.
            Please do not share it with anyone.

            If you didn't request this, ignore this email.
            """,
            subtype="plain"  # or "html" if you make body HTML
        )

        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"OTP email sent successfully to {email} with code {otp}")

    except Exception as e:
        print(f"Failed to send email to {email}: {str(e)}")
        raise  # or handle gracefully depending on your needs