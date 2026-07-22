# File: app/services/lead_service.py

from sqlalchemy.orm import Session

from app.models.enums import LeadServiceType
from app.models.lead import LeadRequest
from app.schemas.lead import LeadCreateRequest


def create_lead(db: Session, payload: LeadCreateRequest) -> LeadRequest:
    """
    يسجّل طلب اهتمام عام (Lead) بخدمة مستقبلية، بلا حاجة لتسجيل دخول.

    Args:
        db: جلسة قاعدة البيانات.
        payload: نوع الخدمة، بيانات التواصل، وتفاصيل إضافية.

    Returns:
        LeadRequest: طلب الاهتمام المُنشَأ حديثاً.
    """
    lead = LeadRequest(**payload.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


def list_leads(db: Session, service_type: LeadServiceType | None = None) -> list[LeadRequest]:
    """
    يُعيد طلبات الاهتمام (بصلاحية موظف/مدير فقط)، مع إمكانية التصفية.

    Args:
        db: جلسة قاعدة البيانات.
        service_type: نوع الخدمة الاختياري للتصفية به.

    Returns:
        list[LeadRequest]: قائمة الطلبات مرتبة تنازلياً حسب التاريخ.
    """
    query = db.query(LeadRequest)
    if service_type:
        query = query.filter(LeadRequest.service_type == service_type)
    return query.order_by(LeadRequest.created_at.desc()).all()
