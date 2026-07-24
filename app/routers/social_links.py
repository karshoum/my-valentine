# File: app/routers/social_links.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_admin, require_staff
from app.models.social_link import SocialLink
from app.models.user import User
from app.schemas.social_link import SocialLinkCreateRequest, SocialLinkOut, SocialLinkUpdateRequest
from app.services import social_link_service

router = APIRouter(prefix="/api/v1/social-links", tags=["روابط التواصل الاجتماعي"])


@router.get("", response_model=list[SocialLinkOut])
def list_public_social_links(db: Session = Depends(get_db)) -> list[SocialLink]:
    """يُعيد روابط التواصل المُفعَّلة فقط (عام، بلا تسجيل دخول) لعرضها في الصفحة العامة."""
    return social_link_service.list_active_social_links(db)


@router.get("/all", response_model=list[SocialLinkOut])
def list_all_social_links(db: Session = Depends(get_db), _: User = Depends(require_staff)) -> list[SocialLink]:
    """يُعيد كل روابط التواصل (مفعّلة وموقوفة) لإدارتها من لوحة التحكم (موظف أو مدير فقط)."""
    return social_link_service.list_all_social_links(db)


@router.post("", response_model=SocialLinkOut, status_code=status.HTTP_201_CREATED)
def create_social_link(
    payload: SocialLinkCreateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> SocialLink:
    """يضيف رابط تواصل اجتماعي جديداً (admin فقط)."""
    return social_link_service.create_social_link(db, payload, admin_user)


@router.patch("/{link_id}", response_model=SocialLinkOut)
def update_social_link(
    link_id: int,
    payload: SocialLinkUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> SocialLink:
    """يعدّل حقول رابط تواصل موجود جزئياً (admin فقط)."""
    return social_link_service.update_social_link(db, link_id, payload, admin_user)


@router.delete("/{link_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
def delete_social_link(
    link_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> None:
    """يحذف رابط تواصل نهائياً (admin فقط)."""
    social_link_service.delete_social_link(db, link_id, admin_user)
