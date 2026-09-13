from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api.v1 import api_v1_router
import app.models  # ensure models loaded


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables if they do not exist
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: nothing needed


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Build CORS origins list
cors_origins: list = []
if settings.CORS_ORIGINS:
    origins_raw = settings.CORS_ORIGINS
    if isinstance(origins_raw, str):
        cors_origins = [o.strip() for o in origins_raw.split(",") if o.strip()]
    else:
        cors_origins = list(origins_raw)

# Add production frontend origin if configured
if settings.PRODUCTION_ORIGIN and settings.PRODUCTION_ORIGIN not in cors_origins:
    cors_origins.append(settings.PRODUCTION_ORIGIN.strip())

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }
