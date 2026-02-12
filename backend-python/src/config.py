# src/config.py

import os                           # ← add this line (very important!)
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY   = os.getenv("SECRET_KEY")

if not DATABASE_URL or not SECRET_KEY:
    raise ValueError("DATABASE_URL and SECRET_KEY must be set in .env file")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Optional debug prints (you can remove them later)
print("DATABASE_URL:", DATABASE_URL)
print("SECRET_KEY  :", SECRET_KEY[:10] + "..." if SECRET_KEY else "None")