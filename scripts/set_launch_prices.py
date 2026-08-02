# File: scripts/set_launch_prices.py

"""
سكربت لمرة واحدة فقط: يضبط سعر كل الخدمات (الـ39 خدمة بكل تصنيفاتها،
بما فيها "تذاكر طيران"/"تذاكر بواخر") وكل خطوط البواخر (لكل فئة عمرية)
على 20 دولاراً، كسعر إطلاق مؤقت ريثما يُدخل المدير الأسعار الفعلية
لاحقاً حسب كل خدمة.

**لماذا سجل تدقيق كعلامة تنفيذ**: هذا التعديل يجب أن يُنفَّذ مرة واحدة
فقط ولا يتكرر أبداً — إن أُعيد تشغيله (كل سكربتات entrypoint.sh تُنفَّذ
تلقائياً بكل نشر جديد) بعد ما يُدخل المدير أسعاراً فعلية مختلفة، سيمحو
تعديلاته صامتاً. لذا يتحقق أولاً من وجود سجل تدقيق بنفس اسم الحركة قبل
أي تعديل، ويتوقف فوراً إن وُجد.
"""

import logging
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.audit import AuditLog
from app.models.service import Service
from app.models.ship_route import ShipRoute
from app.services import audit_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

_MARKER_ACTION = "set_launch_prices_2026_07_24"
_LAUNCH_PRICE_USD = Decimal("20.00")


def run(db: Session) -> None:
    """ينفّذ ضبط أسعار الإطلاق مرة واحدة فقط، متجاوزاً أي تنفيذ لاحق."""
    already_ran = db.query(AuditLog).filter(AuditLog.action == _MARKER_ACTION).first()
    if already_ran:
        logger.info("سعر الإطلاق ($20) طُبِّق مسبقاً — تخطّي (السماح للمدير بأسعاره الفعلية).")
        return

    services_updated = db.query(Service).update({Service.base_price_usd: _LAUNCH_PRICE_USD})
    ship_routes_updated = db.query(ShipRoute).update(
        {
            ShipRoute.adult_price_usd: _LAUNCH_PRICE_USD,
            ShipRoute.child_price_usd: _LAUNCH_PRICE_USD,
            ShipRoute.infant_price_usd: _LAUNCH_PRICE_USD,
        }
    )

    audit_service.log_action(
        db,
        user_id=None,
        action=_MARKER_ACTION,
        details={"services_updated": services_updated, "ship_routes_updated": ship_routes_updated},
    )
    db.commit()
    logger.info(
        "تم ضبط سعر الإطلاق (%s$) لـ %d خدمة و%d خط باخرة.", _LAUNCH_PRICE_USD, services_updated, ship_routes_updated
    )


if __name__ == "__main__":
    db = SessionLocal()
    try:
        run(db)
    finally:
        db.close()
