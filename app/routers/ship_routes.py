# File: app/routers/ship_routes.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_admin
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.ship_booking_fee import ShipBookingFeeSettingOut, ShipBookingFeeUpdateRequest, ShipRouteQuoteOut
from app.schemas.ship_route import ShipRouteCreateRequest, ShipRouteOut, ShipRouteUpdateRequest
from app.services import ship_booking_fee_service, ship_route_service

router = APIRouter(prefix="/api/v1/ship-routes", tags=["خطوط البواخر"])


@router.get("/", response_model=list[ShipRouteOut])
def list_routes(db: Session = Depends(get_db)) -> list[ShipRouteOut]:
    """يُعيد قائمة خطوط البواخر المفعَّلة (عام، بلا حاجة لتسجيل دخول)."""
    return ship_route_service.list_ship_routes(db, only_active=True)


@router.get("/fee-setting", response_model=ShipBookingFeeSettingOut)
def get_fee_setting(db: Session = Depends(get_db), _: User = Depends(get_current_user)) -> ShipBookingFeeSettingOut:
    """يُعيد إعداد رسم حجز البواخر الحالي."""
    return ship_booking_fee_service.get_current_fee_setting(db)


@router.patch("/fee-setting", response_model=ShipBookingFeeSettingOut)
def update_fee_setting(
    payload: ShipBookingFeeUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> ShipBookingFeeSettingOut:
    """يحدّث رسم حجز البواخر الحالي (admin فقط)."""
    return ship_booking_fee_service.update_fee_setting(db, payload, admin_user)


@router.get("/{route_id}/quote", response_model=ShipRouteQuoteOut)
def get_route_quote(
    route_id: int,
    adults: int = 1,
    children: int = 0,
    infants: int = 0,
    db: Session = Depends(get_db),
) -> ShipRouteQuoteOut:
    """يحسب تفصيل سعر حجز خط باخرة لعدد مسافرين مُحدَّد (عام، بلا حاجة لتسجيل دخول)."""
    route = ship_route_service.get_ship_route_or_404(db, route_id)
    return ship_booking_fee_service.calculate_route_quote(db, route, adults, children, infants)


@router.get("/manage/all", response_model=list[ShipRouteOut])
def list_all_routes(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> list[ShipRouteOut]:
    """يُعيد كل خطوط البواخر (مفعَّلة وغير مفعَّلة) لأغراض الإدارة (admin فقط)."""
    return ship_route_service.list_ship_routes(db, only_active=False)


@router.post("/", response_model=ShipRouteOut, status_code=201)
def create_route(
    payload: ShipRouteCreateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> ShipRouteOut:
    """ينشئ خط باخرة جديد (admin فقط)."""
    return ship_route_service.create_ship_route(db, payload, admin_user)


@router.patch("/{route_id}", response_model=ShipRouteOut)
def update_route(
    route_id: int,
    payload: ShipRouteUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> ShipRouteOut:
    """يحدّث خط باخرة جزئياً (admin فقط)."""
    return ship_route_service.update_ship_route(db, route_id, payload, admin_user)


@router.delete("/{route_id}", status_code=204)
def delete_route(
    route_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> None:
    """يحذف خط باخرة (admin فقط)."""
    ship_route_service.delete_ship_route(db, route_id, admin_user)
