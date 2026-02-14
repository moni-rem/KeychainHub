from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import create_db
from src.routers import auth
from src.routers import products

app = FastAPI(title="KeychainHub")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db()

app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
