import os
from dotenv import load_dotenv

load_dotenv()  # loads .env from project root

DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

# Required vars check (good practice)
required = {
    "DATABASE_URL": DATABASE_URL,
    "SECRET_KEY": SECRET_KEY,
    "EMAIL_USER": EMAIL_USER,
    "EMAIL_PASS": EMAIL_PASS,
}

missing = [key for key, val in required.items() if not val]
if missing:
    raise ValueError(f"Missing required env variables: {', '.join(missing)}")