import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.models import Report, SecurityAssessment
from app.services.report_generator import build_report_payload

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("/{session_id}", response_model=schemas.ReportOut)
def generate_report(session_id: uuid.UUID, report_type: str = "executive", db: Session = Depends(get_db)):
    assessment = db.query(SecurityAssessment).filter(SecurityAssessment.session_id == session_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Run the assessment for this session first")

    # payload is built for the future renderer (PDF/HTML) — not persisted
    # as a column here, so wire it into your renderer of choice when ready
    build_report_payload(assessment.session.classification_result, assessment, report_type)

    report = Report(assessment_id=assessment.assessment_id, report_type=report_type)
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/{report_id}", response_model=schemas.ReportOut)
def get_report(report_id: uuid.UUID, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.report_id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report
