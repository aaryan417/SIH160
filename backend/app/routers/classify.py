import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.models import CaptureSession, ClassificationResult
from app.services.packet_parser import parse_pcap
from app.services.protocol_classifier import classify

router = APIRouter(prefix="/classify", tags=["classify"])


@router.post("/{session_id}", response_model=schemas.ClassificationResultOut)
def run_classification(session_id: uuid.UUID, local_ip: str, db: Session = Depends(get_db)):
    session = db.query(CaptureSession).filter(CaptureSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Capture session not found")

    capture = parse_pcap(session.pcap_path, local_ip=local_ip)
    if not capture.packets:
        raise HTTPException(status_code=422, detail="No IPsec traffic found in this capture")

    output = classify(capture)

    result = ClassificationResult(
        session_id=session_id,
        predicted_cipher=output.predicted_cipher,
        predicted_mode=output.predicted_mode,
        predicted_dh_group=output.predicted_dh_group,
        confidence_score=output.confidence_score,
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result
