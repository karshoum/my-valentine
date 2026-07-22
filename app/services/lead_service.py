from sqlalchemy.orm import Session

from app.models.enums import LeadServiceType
from app.models.lead import LeadRequest
from app.schemas.lead import LeadCreateRequest


def create_lead(db: Session, payload: LeadCreateRequest) -> LeadRequest:
    lead = LeadRequest(**payload.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


def list_leads(db: Session, service_type: LeadServiceType | None = None) -> list[LeadRequest]:
    query = db.query(LeadRequest)
    if service_type:
        query = query.filter(LeadRequest.service_type == service_type)
    return query.order_by(LeadRequest.created_at.desc()).all()
