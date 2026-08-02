# File: scripts/seed_service_requirements.py

"""
يُدخل بنود متطلبات المستندات (scripts/service_requirements_catalog.py)
لكل خدمة موجودة مسبقاً في قاعدة البيانات، متجاوزاً أي خدمة لديها بنود
متطلبات مُدرَجة مسبقاً (idempotent - آمن التشغيل أكثر من مرة).

التشغيل: python -m scripts.seed_service_requirements
"""

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.service import Service
from app.models.service_requirement import ServiceRequirement
from scripts.service_requirements_catalog import SERVICE_REQUIREMENTS


def _seed_requirements_for_service(db: Session, service: Service, requirement_texts: list[str]) -> None:
    """
    يضيف بنود المتطلبات لخدمة واحدة إذا لم يكن لديها أي بند مُدرَج مسبقاً.

    Args:
        db: جلسة قاعدة البيانات.
        service: الخدمة المستهدَفة.
        requirement_texts: نصوص بنود المتطلبات مرتّبة بترتيب عرضها.
    """
    has_existing_requirements = (
        db.query(ServiceRequirement).filter(ServiceRequirement.service_id == service.id).first() is not None
    )
    if has_existing_requirements:
        print(f"تجاوَزت (لديها متطلبات مسبقاً): {service.title}")
        return

    for order, text in enumerate(requirement_texts):
        db.add(ServiceRequirement(service_id=service.id, requirement_text=text, display_order=order))
    print(f"أُضيفت {len(requirement_texts)} بند(بنود) متطلبات لـ: {service.title}")


def seed_service_requirements() -> None:
    """يُدخل متطلبات كل خدمة موجودة في القاعدة حسب الكتالوج، ويطبع تقريراً بما أُضيف وما تم تجاوزه."""
    db = SessionLocal()
    try:
        for title, requirement_texts in SERVICE_REQUIREMENTS.items():
            service = db.query(Service).filter(Service.title == title).first()
            if not service:
                print(f"تحذير: لا توجد خدمة بعنوان '{title}' في قاعدة البيانات، تم التجاوز.")
                continue
            _seed_requirements_for_service(db, service, requirement_texts)
        db.commit()
        print(f"اكتملت معالجة متطلبات {len(SERVICE_REQUIREMENTS)} خدمة.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_service_requirements()
