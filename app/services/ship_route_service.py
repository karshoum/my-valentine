# File: app/services/ship_route_service.py

from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.ship_route import ShipRoute
from app.models.user import User
from app.schemas.ship_route import ShipRouteCreateRequest, ShipRouteUpdateRequest
from app.services import audit_service


def list_ship_routes(db: Session, only_active: bool = True) -> list[ShipRoute]:
    """يُعيد قائمة خطوط البواخر، مع إمكانية تصفية حسب حالة التفعيل."""
    query = db.query(ShipRoute)
    if only_active:
        query = query.filter(ShipRoute.is_active.is_(True))
    return query.order_by(ShipRoute.origin_city, ShipRoute.destination_city).all()


def get_ship_route_or_404(db: Session, route_id: int) -> ShipRoute:
    """يجلب خط باخرة بمعرّفه أو يرفع استثناء 404."""
    route = db.query(ShipRoute).filter(ShipRoute.id == route_id).first()
    if not route:
        raise AppException("خط الباخرة غير موجود", status_code=404)
    return route


def create_ship_route(db: Session, payload: ShipRouteCreateRequest, created_by: User) -> ShipRoute:
    """ينشئ خط باخرة جديد (admin فقط)."""
    route = ShipRoute(
        origin_city=payload.origin_city,
        destination_city=payload.destination_city,
        adult_price_usd=payload.adult_price_usd,
        child_price_usd=payload.child_price_usd,
        infant_price_usd=payload.infant_price_usd,
    )
    db.add(route)
    audit_service.log_action(
        db,
        user_id=created_by.id,
        action="create_ship_route",
        details={"origin": payload.origin_city, "destination": payload.destination_city},
    )
    db.commit()
    db.refresh(route)
    return route


def update_ship_route(db: Session, route_id: int, payload: ShipRouteUpdateRequest, changed_by: User) -> ShipRoute:
    """يحدّث حقول خط باخرة جزئياً (admin فقط)."""
    route = get_ship_route_or_404(db, route_id)
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(route, field, value)
    audit_service.log_action(
        db,
        user_id=changed_by.id,
        action="update_ship_route",
        details={"route_id": route.id, **{k: str(v) for k, v in updates.items()}},
    )
    db.commit()
    db.refresh(route)
    return route


def delete_ship_route(db: Session, route_id: int, deleted_by: User) -> None:
    """يحذف خط باخرة نهائياً (admin فقط)."""
    route = get_ship_route_or_404(db, route_id)
    audit_service.log_action(
        db,
        user_id=deleted_by.id,
        action="delete_ship_route",
        details={"route_id": route.id, "origin": route.origin_city, "destination": route.destination_city},
    )
    db.delete(route)
    db.commit()
