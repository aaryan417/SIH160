import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, String, Uuid
from sqlalchemy.orm import relationship

from app.database import Base


class VPNConfiguration(Base):
    __tablename__ = "vpn_configuration"

    config_id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mode = Column(String, nullable=False)  # tunnel | transport
    cipher_suite = Column(String, nullable=False)  # AES-128 | AES-256 | AES-GCM | AES-CBC+HMAC
    dh_group = Column(String, nullable=False)
    pfs_enabled = Column(Boolean, default=False)
    ip_version = Column(String, nullable=False)  # IPv4 | IPv6
    created_at = Column(DateTime, default=datetime.utcnow)

    capture_sessions = relationship("CaptureSession", back_populates="configuration")


class CaptureSession(Base):
    __tablename__ = "capture_session"

    session_id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    config_id = Column(Uuid(as_uuid=True), ForeignKey("vpn_configuration.config_id"), nullable=False)
    pcap_path = Column(String, nullable=False)
    captured_at = Column(DateTime, default=datetime.utcnow)

    configuration = relationship("VPNConfiguration", back_populates="capture_sessions")
    packets = relationship("PacketRecord", back_populates="session", cascade="all, delete-orphan")
    classification_result = relationship("ClassificationResult", back_populates="session", uselist=False)
    security_assessment = relationship("SecurityAssessment", back_populates="session", uselist=False)


class PacketRecord(Base):
    __tablename__ = "packet_record"

    packet_id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(Uuid(as_uuid=True), ForeignKey("capture_session.session_id"), nullable=False)
    protocol = Column(String, nullable=False)  # IKE | ESP | AH
    ike_version = Column(String, nullable=True)
    direction = Column(String, nullable=False)  # inbound | outbound

    session = relationship("CaptureSession", back_populates="packets")


class ClassificationResult(Base):
    __tablename__ = "classification_result"

    result_id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(Uuid(as_uuid=True), ForeignKey("capture_session.session_id"), unique=True, nullable=False)
    predicted_cipher = Column(String, nullable=False)
    predicted_mode = Column(String, nullable=False)
    predicted_dh_group = Column(String, nullable=True)
    confidence_score = Column(Float, nullable=False)

    session = relationship("CaptureSession", back_populates="classification_result")


class SecurityAssessment(Base):
    __tablename__ = "security_assessment"

    assessment_id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(Uuid(as_uuid=True), ForeignKey("capture_session.session_id"), unique=True, nullable=False)
    risk_score = Column(Float, nullable=False)
    compliance_status = Column(String, nullable=False)  # compliant | non_compliant | needs_review

    session = relationship("CaptureSession", back_populates="security_assessment")
    reports = relationship("Report", back_populates="assessment", cascade="all, delete-orphan")


class Report(Base):
    __tablename__ = "report"

    report_id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(Uuid(as_uuid=True), ForeignKey("security_assessment.assessment_id"), nullable=False)
    report_type = Column(String, nullable=False)  # executive | technical
    generated_at = Column(DateTime, default=datetime.utcnow)

    assessment = relationship("SecurityAssessment", back_populates="reports")
