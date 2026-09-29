from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://vpnanalyzer:vpnanalyzer@localhost:5432/vpn_analyzer"
    pcap_storage_dir: str = "./pcap_storage"
    model_path: str = "./ml_models/protocol_classifier.joblib"
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
