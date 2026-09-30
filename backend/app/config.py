from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./vpn_analyzer.db"
    pcap_storage_dir: str = "./pcap_storage"
    model_path: str = "./ml_models/protocol_classifier.joblib"

    # Allowed CORS origins.
    # Override via CORS_ORIGINS env var as a JSON array string, e.g.:
    #   CORS_ORIGINS='["https://vpn-sentine.vercel.app","http://localhost:5173"]'
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://vpn-sentine.vercel.app",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        protected_namespaces=("settings_",),
        extra="ignore",
    )


settings = Settings()