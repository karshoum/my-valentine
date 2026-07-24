# File: app/services/service_service.py

from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.enums import ServiceCategory
from app.models.order import Order
from app.models.service import Service, VisaResidencyDetail
from app.models.user import User
from app.schemas.service import ServiceCreateRequest, ServiceDiscountUpdateRequest, ServiceUpdateRequest
from app.services import audit_service


def list_services(db: Session, category: ServiceCategory | None = None, only_active: bool = True) -> list[Service]:
    """
    يُعيد قائمة الخدمات، مع إمكانية التصفية حسب التصنيف وحالة التفعيل.

    Args:
        db: جلسة قاعدة البيانات.
        category: تصنيف اختياري للتصفية به.
        only_active: إذا كانت True (الافتراضي) يُستبعد كل ما هو غير مفعَّل.

    Returns:
        list[Service]: قائمة الخدمات مرتبة تنازلياً حسب تاريخ الإنشاء.
    """
    query = db.query(Service)
    if only_active:
        query = query.filter(Service.is_active.is_(True))
    if category:
        query = query.filter(Service.category == category)
    return query.order_by(Service.created_at.desc()).all()


def get_service_or_404(db: Session, service_id: int) -> Service:
    """يجلب خدمة بمعرّفها أو يرفع استثناء 404 إذا لم توجد."""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise AppException("الخدمة غير موجودة", status_code=404)
    return service


def create_service(db: Session, payload: ServiceCreateRequest, created_by: User) -> Service:
    """
    ينشئ خدمة جديدة، مع تفاصيل فيزا/إقامة اختيارية إن كان التصنيف مطابقاً.

    Args:
        db: جلسة قاعدة البيانات.
        payload: بيانات الخدمة الأساسية وتفاصيل الفيزا/الإقامة إن وُجدت.
        created_by: الموظف/المدير الذي ينفّذ الإنشاء.

    Returns:
        Service: الخدمة المُنشَأة حديثاً.

    Raises:
        AppException: 400 إذا أُرفقت تفاصيل فيزا/إقامة لخدمة من تصنيف آخر.
    """
    service = Service(
        category=payload.category,
        title=payload.title,
        description=payload.description,
        base_price_usd=payload.base_price_usd,
    )
    db.add(service)
    db.flush()

    if payload.visa_residency_detail:
        if payload.category not in (ServiceCategory.visa, ServiceCategory.residency):
            raise AppException("تفاصيل الفيزا/الإقامة تُضاف فقط لخدمات من نوع فيزا أو إقامة", status_code=400)
        detail = VisaResidencyDetail(service_id=service.id, **payload.visa_residency_detail.model_dump())
        db.add(detail)

    audit_service.log_action(
        db, user_id=created_by.id, action="create_service", details={"title": payload.title}
    )
    db.commit()
    db.refresh(service)
    return service


def update_service(db: Session, service_id: int, payload: ServiceUpdateRequest, changed_by: User) -> Service:
    """
    يحدّث حقول خدمة جزئياً (العنوان، الوصف، السعر الأساسي، حالة التفعيل).

    Args:
        db: جلسة قاعدة البيانات.
        service_id: معرّف الخدمة المستهدَفة.
        payload: الحقول المُراد تعديلها (المُرسَلة فقط تُطبَّق).
        changed_by: الموظف/المدير الذي ينفّذ التعديل.

    Returns:
        Service: الخدمة بعد التحديث.
    """
    service = get_service_or_404(db, service_id)
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(service, field, value)

    audit_service.log_action(
        db,
        user_id=changed_by.id,
        action="update_service",
        details={"service_id": service.id, **{k: str(v) for k, v in updates.items()}},
    )
    db.commit()
    db.refresh(service)
    return service


def delete_service(db: Session, service_id: int, deleted_by: User) -> None:
    """
    يحذف خدمة نهائياً من الكتالوج، بشرط ألا تكون مرتبطة بأي طلب سابق —
    حفاظاً على سلامة سجل الطلبات التاريخي. خدمة مرتبطة بطلبات يجب
    تعطيلها (is_active=False عبر update_service) بدلاً من حذفها.

    Args:
        db: جلسة قاعدة البيانات.
        service_id: معرّف الخدمة المستهدَفة.
        deleted_by: الموظف/المدير الذي ينفّذ الحذف.

    Raises:
        AppException: 404 إذا لم توجد الخدمة، أو 409 إذا كانت مرتبطة بطلبات سابقة.
    """
    service = get_service_or_404(db, service_id)

    has_prior_orders = db.query(Order).filter(Order.service_id == service_id).first() is not None
    if has_prior_orders:
        raise AppException(
            "لا يمكن حذف خدمة مرتبطة بطلبات سابقة؛ عطّلها بدلاً من ذلك (is_active) للحفاظ على سجل الطلبات",
            status_code=409,
        )

    audit_service.log_action(
        db, user_id=deleted_by.id, action="delete_service", details={"service_id": service.id, "title": service.title}
    )
    db.delete(service)
    db.commit()


def set_service_discount(db: Session, service_id: int, payload: ServiceDiscountUpdateRequest, changed_by: User) -> Service:
    """
    يحدّد أو يلغي عرض خصم محدود المدة على خدمة (admin فقط).

    Args:
        db: جلسة قاعدة البيانات.
        service_id: معرّف الخدمة المستهدَفة.
        payload: نسبة الخصم وتاريخ الانتهاء (كلاهما None لإلغاء العرض).
        changed_by: المدير الذي ينفّذ العملية.

    Returns:
        Service: الخدمة بعد تطبيق/إلغاء الخصم.
    """
    service = get_service_or_404(db, service_id)
    service.discount_percentage = payload.discount_percentage
    service.discount_valid_until = payload.discount_valid_until

    audit_service.log_action(
        db,
        user_id=changed_by.id,
        action="set_service_discount",
        details={
            "service_id": service.id,
            "discount_percentage": str(payload.discount_percentage) if payload.discount_percentage else None,
            "discount_valid_until": payload.discount_valid_until.isoformat() if payload.discount_valid_until else None,
        },
    )
    db.commit()
    db.refresh(service)
    return service


def get_ticket_discount_percentage(db: Session, category: ServiceCategory) -> Decimal | None:
    """
    يُعيد نسبة الخصم الساري على خدمة "تذاكر طيران"/"تذاكر بواخر" (حسب
    التصنيف)، أو None إن لم يوجد عرض ساري. يُستخدَم لتطبيق الخصم على رسم
    الحجز فقط دون المساس بالسعر الحقيقي (سعر Duffel أو سعر خط الباخرة).

    Args:
        db: جلسة قاعدة البيانات.
        category: تصنيف الخدمة (flight أو ship_ticket).

    Returns:
        Decimal | None: نسبة الخصم الحالية إن كانت سارية، وإلا None.
    """
    service = db.query(Service).filter(Service.category == category).first()
    if service and service.has_active_discount:
        return service.discount_percentage
    return None
