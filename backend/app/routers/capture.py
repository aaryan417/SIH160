import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app import schemas
from app.config import settings
from app.database import get_db
from app.models import CaptureSession, VPNConfiguration

router = APIRouter(prefix="/capture", tags=["capture"])


@router.get("/sessions", response_model=list[schemas.CaptureSessionOut])
def list_captures(db: Session = Depends(get_db)):
    return db.query(CaptureSession).order_by(CaptureSession.captured_at.desc()).all()


@router.post("/sessions/{config_id}", response_model=schemas.CaptureSessionOut)
def upload_capture(config_id: uuid.UUID, file: UploadFile, db: Session = Depends(get_db)):
    config = db.query(VPNConfiguration).filter(VPNConfiguration.config_id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="VPN configuration not found")

    os.makedirs(settings.pcap_storage_dir, exist_ok=True)
    stored_name = f"{uuid.uuid4()}.pcap"
    stored_path = os.path.join(settings.pcap_storage_dir, stored_name)
    with open(stored_path, "wb") as f:
        f.write(file.file.read())

    session = CaptureSession(config_id=config_id, pcap_path=stored_path)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/sessions/{session_id}", response_model=schemas.CaptureSessionOut)
def get_capture(session_id: uuid.UUID, db: Session = Depends(get_db)):
    session = db.query(CaptureSession).filter(CaptureSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Capture session not found")
    return session
