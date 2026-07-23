# File: app/routers/flight_bookings.py

from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_admin
from app.core.security import get_current_user
from app.models.flight_booking import FlightBookingFeeSetting
from app.models.user import User
from app.schemas.flight_booking import (
    FlightBookingFeeSettingOut,
    FlightBookingFeeUpdateRequest,
    FlightOfferOut,
)
from app.services import flight_booking_service, flight_search_service

router = APIRouter(prefix="/api/v1/flight-bookings", tags=["حجوزات الطيران"])


@router.get("/search", response_model=list[FlightOfferOut])
def search_flights(
    origin: str,
    destination: str,
    departure_date: date,
    return_date: date | None = None,
    adults: int = 1,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[FlightOfferOut]:
    """يبحث عن رحلات طيران حقيقية بين مدينتين (يتطلّب تسجيل دخول لحماية حصة الاستخدام المدفوعة لدى المزوّد)."""
    return flight_search_service.search_flights(db, origin, destination, departure_date, return_date, adults)


@router.get("/fee-setting", response_model=FlightBookingFeeSettingOut)
def get_fee_setting(db: Session = Depends(get_db), _: User = Depends(get_current_user)) -> FlightBookingFeeSetting:
    """يُعيد إعداد رسوم حجز الطيران الحالي."""
    return flight_booking_service.get_current_fee_setting(db)


@router.patch("/fee-setting", response_model=FlightBookingFeeSettingOut)
def update_fee_setting(
    payload: FlightBookingFeeUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> FlightBookingFeeSetting:
    """يحدّث رسوم حجز الطيران الحالية (admin فقط)."""
    return flight_booking_service.update_fee_setting(db, payload, admin_user)
