import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")

if not DATABASE_URL or not SECRET_KEY:
    raise ValueError("Missing environment variables")
