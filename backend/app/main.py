from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import assess, capture, classify, reports, testbed

app = FastAPI(
    title="AI-Powered IPsec VPN Protocol Analyzer",
    description="SIH26160 — NTRO: automated IPsec deployment analysis and security assessment",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(testbed.router)
app.include_router(capture.router)
app.include_router(classify.router)
app.include_router(assess.router)
app.include_router(reports.router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"status": "ok"}
