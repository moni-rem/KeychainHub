# # 
# # ────────────────────────────────────────────────────────────────
# # src/main.py
# # ────────────────────────────────────────────────────────────────

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# # Only import what you actually use — avoid importing multiprocessing unless needed
# # from multiprocessing import Process, Pool   ← REMOVE unless you really use it

# from .database import create_db
# from src.routers import auth
# from src.routers import products

# app = FastAPI(
#     title="KeychainHub",
#     description="KeychainHub API - Manage keychains and more",
#     version="0.1.0",
#     docs_url="/docs",
#     redoc_url="/redoc",
#     openapi_url="/openapi.json",
# )

# # ── CORS (very permissive — tighten in production!)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],           # ← change to real domains later
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ── Startup event (recommended style in FastAPI ≥ 0.95)
# @app.on_event("startup")
# async def startup_event():
#     # This runs once when the app starts (even with multiple workers)
#     create_db()                    # assuming this is fast / idempotent
#     # You can add: await some_async_init(), load cache, etc. here

# # ── Include routers
# app.include_router(auth.router, prefix="/api")
# app.include_router(products.router, prefix="/api")

# # ── Simple root endpoint
# @app.get("/")
# async def root():
#     return {
#         "message": "Welcome to KeychainHub API 🚀",
#         "status": "online",
#         "docs": "/docs",
#         "version": "0.1.0"
#     }

# # Optional: health check (very useful for monitoring / docker)
# @app.get("/health")
# async def health_check():
#     return {"status": "healthy"}
# src/main.py
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from .database import engine  # assuming create_db() creates tables
from src.routers import auth
from src.routers import products


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan:
    - Runs once at startup (create tables, etc.)
    - Runs once at shutdown (cleanup if needed)
    """
    # Startup: create tables if they don't exist
    SQLModel.metadata.create_all(engine)   # ← safe to call multiple times
    # or use your create_db() function if it does more (migrations, seed data)
    # create_db()

    yield  # ← application runs here

    # Shutdown: optional cleanup (close connections, etc.)
    # engine.dispose()  # usually not needed with SQLModel


app = FastAPI(
    title="KeychainHub",
    description="API for managing keychains, authentication, and purchases",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,                    # ← modern way instead of @app.on_event
)


# CORS – very permissive for local dev / frontend testing
# Tighten allow_origins in production!
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],                    # ← later: ["http://localhost:3000", "https://your-frontend.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers (with /api prefix)
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(products.router, prefix="/api", tags=["products"])


@app.get("/", summary="API welcome / status")
async def root():
    return {
        "message": "Welcome to KeychainHub API 🚀",
        "status": "online",
        "version": "0.1.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health"
    }


@app.get("/health", summary="Health check (used by monitoring / Docker)")
@app.get("/healthz")  # common alias
async def health_check():
    return {
        "status": "healthy",
        "service": "keychainhub-api",
        "version": "0.1.0"
    }


# Optional: global exception handler for nicer 422 validation errors (uncomment if you want)
# from fastapi import Request
# from fastapi.exceptions import RequestValidationError
# from fastapi.responses import JSONResponse
#
# @app.exception_handler(RequestValidationError)
# async def validation_exception_handler(request: Request, exc: RequestValidationError):
#     errors = [
#         {
#             "field": " → ".join(str(loc) for loc in error["loc"]),
#             "message": error["msg"],
#             "type": error["type"]
#         }
#         for error in exc.errors()
#     ]
#     return JSONResponse(
#         status_code=422,
#         content={"status": "error", "message": "Invalid input", "errors": errors}
#     )
# Fancy startup banner (add this right after app = FastAPI(...))
print("\n" + "="*50)
print("🚀 Server running on port 8000")
print("📁 Environment: development")
print("🔗 Health check: http://localhost:8000/health")
print("🛍 Products: http://localhost:8000/api/products")
print("🔐 Register: POST http://localhost:8000/api/auth/register")
print("🔐 Login: POST http://localhost:8000/api/auth/login")
print("📚 Interactive docs (Swagger): http://localhost:8000/docs")
print("📚 Alternative docs (ReDoc): http://localhost:8000/redoc")
print("="*50 + "\n")