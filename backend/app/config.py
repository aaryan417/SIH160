from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./vpn_analyzer.db"
    pcap_storage_dir: str = "./pcap_storage"
    model_path: str = "./ml_models/protocol_classifier.joblib"

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