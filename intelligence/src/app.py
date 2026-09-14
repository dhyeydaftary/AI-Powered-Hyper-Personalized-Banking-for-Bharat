"""FastAPI application factory for the Intelligence Service."""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from intelligence.src.api.routes import router


def create_app() -> FastAPI:
    """Creates and configures the FastAPI intelligence application."""
    app = FastAPI(
        title="AI-Powered Hyper-Personalized Banking for Bharat — Intelligence Service",
        description="Explainable, testable financial intelligence and policy microservice.",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Enable CORS for local cross-origin backend integration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Exception handler for unhandled exceptions to prevent process crash
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred during intelligence evaluation.",
            },
        )

    # Mount API routes
    app.include_router(router)

    return app
