# File: app/routers/ship_routes.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_admin
from app.models.user import User
from app.schemas.ship_route import ShipRouteCreateRequest, ShipRouteOut, ShipRouteUpdateRequest
from app.services import ship_route_service

router = APIRouter(prefix="/api/v1/ship-routes", tags=["خطوط البواخر"])


@router.get("/", response_model=list[ShipRouteOut])
def list_routes(db: Session = Depends(get_db)) -> list[ShipRouteOut]:
    """يُعيد قائمة خطوط البواخر المفعَّلة (عام، بلا حاجة لتسجيل دخول)."""
    return ship_route_service.list_ship_routes(db, only_active=True)


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
