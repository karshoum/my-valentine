# File: app/routers/auth.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import GoogleLoginRequest, LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserOut
from app.services import auth_service

router = APIRouter(prefix="/api/v1/auth", tags=["المصادقة"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> UserOut:
    """يسجّل حساب عميل (B2C) جديد ويُعيد بياناته الأساسية."""
    return auth_service.register_customer(db, payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """يتحقق من بيانات الدخول ويُصدر توكن JWT عند النجاح."""
    return auth_service.authenticate(db, payload)


@router.post("/google", response_model=TokenResponse)
def login_with_google(payload: GoogleLoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """يتحقق من توكن قوقل ويُصدر توكن JWT، منشئاً حساب عميل جديد عند أول دخول."""
    return auth_service.authenticate_with_google(db, payload)
