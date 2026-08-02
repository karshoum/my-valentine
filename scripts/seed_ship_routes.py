# File: scripts/seed_ship_routes.py

"""
يزرع خطوط بواخر افتراضية (قابل للتكرار بأمان — يتخطّى أي خط موجود بنفس
المدينتين). يُشغَّل تلقائياً عبر entrypoint.sh عند بدء التطبيق.
"""

import logging

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.ship_route import ShipRoute

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

INITIAL_ROUTES = [
    {"origin_city": "بورتسودان", "destination_city": "جدة", "adult_price_usd": 0, "child_price_usd": 0, "infant_price_usd": 0},
    {"origin_city": "جدة", "destination_city": "بورتسودان", "adult_price_usd": 0, "child_price_usd": 0, "infant_price_usd": 0},
    {"origin_city": "بورتسودان", "destination_city": "سواكن", "adult_price_usd": 0, "child_price_usd": 0, "infant_price_usd": 0},
    {"origin_city": "سواكن", "destination_city": "جدة", "adult_price_usd": 0, "child_price_usd": 0, "infant_price_usd": 0},
]


def seed(db: Session) -> None:
    """يزرع خطوط بواخر افتراضية إن لم تكن موجودة."""
    for route_data in INITIAL_ROUTES:
        exists = (
            db.query(ShipRoute)
            .filter(
                ShipRoute.origin_city == route_data["origin_city"],
                ShipRoute.destination_city == route_data["destination_city"],
            )
            .first()
        )
        if exists:
            logger.info("خط باخرة موجود مسبقاً: %s → %s — تخطّي", route_data["origin_city"], route_data["destination_city"])
            continue
        db.add(ShipRoute(**route_data))
        logger.info("أُضيف خط باخرة: %s → %s", route_data["origin_city"], route_data["destination_city"])
    db.commit()


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
