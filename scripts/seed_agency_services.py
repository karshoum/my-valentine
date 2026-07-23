# File: scripts/seed_agency_services.py

"""
يُدخل كتالوج خدمات الوكالة الفعلي (scripts/agency_services_catalog.py)
في قاعدة البيانات، خدمة خدمة، متجاوزاً أي خدمة عنوانها موجود مسبقاً
(idempotent - آمن التشغيل أكثر من مرة). كل خدمة تُضاف بسعر أساسي مؤقت
0.00 دولار لأن الوكالة لم تحدّد بعد الأسعار الفعلية؛ يجب على الإدارة
تحديثها عبر PATCH /api/v1/services/{id} قبل عرضها فعلياً للعملاء.

التشغيل: python -m scripts.seed_agency_services
"""

from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.enums import ServiceCategory
from app.models.service import Service, VisaResidencyDetail
from scripts.agency_services_catalog import AGENCY_SERVICES

PLACEHOLDER_PRICE_USD = Decimal("0.00")


def _create_service_if_missing(db: Session, entry: dict) -> Service | None:
    """
    ينشئ خدمة واحدة من الكتالوج إن لم يوجد عنوانها مسبقاً في قاعدة
    البيانات، مع إرفاق تفاصيل الفيزا/الإقامة إن كانت الخدمة من هذين
    النوعين وحدِّد لها بلد.

    Args:
        db: جلسة قاعدة البيانات.
        entry: عنصر واحد من AGENCY_SERVICES.

    Returns:
        Service | None: الخدمة المُنشأة حديثاً، أو None إذا كانت موجودة مسبقاً.
    """
    title = entry["title"]
    if db.query(Service).filter(Service.title == title).first():
        print(f"تجاوَزت (موجودة مسبقاً): {title}")
        return None

    service = Service(
        category=entry["category"],
        title=title,
        base_price_usd=PLACEHOLDER_PRICE_USD,
        is_active=True,
    )
    db.add(service)
    db.flush()

    country = entry.get("country")
    if country and entry["category"] in (ServiceCategory.visa, ServiceCategory.residency):
        db.add(
            VisaResidencyDetail(
                service_id=service.id,
                country=country,
                type=entry.get("visa_type", "غير محدد"),
            )
        )

    print(f"تمت الإضافة: {title}")
    return service


def seed_agency_services() -> None:
    """يُدخل كل خدمات كتالوج الوكالة دفعة واحدة، ويطبع تقريراً بما أُضيف وما تم تجاوزه."""
    db = SessionLocal()
    try:
        for entry in AGENCY_SERVICES:
            _create_service_if_missing(db, entry)
        db.commit()
        print(f"اكتملت معالجة {len(AGENCY_SERVICES)} خدمة من كتالوج الوكالة.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_agency_services()
