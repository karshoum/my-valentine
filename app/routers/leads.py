# File: app/routers/leads.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_staff
from app.models.enums import LeadServiceType
from app.models.lead import LeadRequest
from app.models.user import User
from app.schemas.lead import LeadCreateRequest, LeadOut
from app.services import lead_service

router = APIRouter(prefix="/api/v1/leads", tags=["طلبات الاهتمام (لوجستيك / دعاية وإعلام)"])


@router.post("", response_model=LeadOut, status_code=status.HTTP_201_CREATED)
def create_lead(payload: LeadCreateRequest, db: Session = Depends(get_db)) -> LeadRequest:
    """يسجّل طلب اهتمام عام بخدمة مستقبلية (عام، بلا تسجيل دخول)."""
    return lead_service.create_lead(db, payload)


@router.get("", response_model=list[LeadOut])
def list_leads(
    service_type: LeadServiceType | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_staff),
) -> list[LeadRequest]:
    """يُعيد طلبات الاهتمام المسجَّلة (موظف أو مدير فقط)."""
    return lead_service.list_leads(db, service_type)
