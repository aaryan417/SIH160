from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class VPNConfigurationCreate(BaseModel):
    mode: str
    cipher_suite: str
    dh_group: str
    pfs_enabled: bool = False
    ip_version: str


class VPNConfigurationOut(VPNConfigurationCreate):
    config_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class CaptureSessionOut(BaseModel):
    session_id: UUID
    config_id: UUID
    pcap_path: str
    captured_at: datetime

    class Config:
        from_attributes = True


class ClassificationResultOut(BaseModel):
    result_id: UUID
    session_id: UUID
    predicted_cipher: str
    predicted_mode: str
    predicted_dh_group: str | None
    confidence_score: float

    class Config:
        from_attributes = True


class SecurityAssessmentOut(BaseModel):
    assessment_id: UUID
    session_id: UUID
    risk_score: float
    compliance_status: str
    threat_matrix: dict[str, str] | None = None

    class Config:
        from_attributes = True


class ReportOut(BaseModel):
    report_id: UUID
    assessment_id: UUID
    report_type: str
    generated_at: datetime

    class Config:
        from_attributes = True
