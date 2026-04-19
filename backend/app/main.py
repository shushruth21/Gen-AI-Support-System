from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from app.api import api_router

app = FastAPI(
    title="Gen AI Support System API",
    description="Backend API for the AI-powered support ticketing system",
    version="1.0.0",
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", include_in_schema=False)
async def root():
    # Gracefully redirect anyone visiting the bare root URL to our Swagger UI
    return RedirectResponse(url='/docs')

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Gen AI Support API is running successfully."}

# Future routes will be included down here
app.include_router(api_router, prefix="/api/v1")
