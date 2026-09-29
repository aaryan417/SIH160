from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.models import VPNConfiguration

router = APIRouter(prefix="/testbed", tags=["testbed"])


@router.post("/configurations", response_model=schemas.VPNConfigurationOut)
def create_configuration(payload: schemas.VPNConfigurationCreate, db: Session = Depends(get_db)):
    config = VPNConfiguration(**payload.model_dump())
    db.add(config)
    db.commit()
    db.refresh(config)
    return config


@router.get("/configurations", response_model=list[schemas.VPNConfigurationOut])
def list_configurations(db: Session = Depends(get_db)):
    return db.query(VPNConfiguration).all()
