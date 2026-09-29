import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.models import ClassificationResult, SecurityAssessment
from app.services.assessment_engine import assess

router = APIRouter(prefix="/assess", tags=["assess"])


@router.post("/{session_id}", response_model=schemas.SecurityAssessmentOut)
def run_assessment(session_id: uuid.UUID, db: Session = Depends(get_db)):
    classification = (
        db.query(ClassificationResult).filter(ClassificationResult.session_id == session_id).first()
    )
    if not classification:
        raise HTTPException(status_code=404, detail="Run classification for this session first")

    config = classification.session.configuration
    output = assess(
        predicted_cipher=classification.predicted_cipher,
        pfs_enabled=config.pfs_enabled,
        dh_group=classification.predicted_dh_group,
    )

    assessment = SecurityAssessment(
        session_id=session_id,
        risk_score=output.risk_score,
        compliance_status=output.compliance_status,
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # threat_matrix isn't persisted as a column — it's cheap to recompute
    # from stored fields, so we attach it here rather than adding a JSON
    # column for something derivable on read.
    return schemas.SecurityAssessmentOut(
        assessment_id=assessment.assessment_id,
        session_id=assessment.session_id,
        risk_score=assessment.risk_score,
        compliance_status=assessment.compliance_status,
        threat_matrix=output.threat_matrix,
    )
