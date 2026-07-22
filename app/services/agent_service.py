from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.core.security import hash_password
from app.models.agent import AgentProfile
from app.models.enums import UserRole
from app.models.service import B2BServiceRate, Service
from app.models.user import User
from app.schemas.agent import AgentCreateRequest, AgentUpdateRequest, CustomRateCreateRequest
from app.services import audit_service


def create_agent(db: Session, payload: AgentCreateRequest, created_by: User) -> AgentProfile:
    existing_filters = [User.phone == payload.phone]
    if payload.email:
        existing_filters.append(User.email == payload.email)

    existing = db.query(User).filter(or_(*existing_filters)).first()
    if existing:
        raise AppException("البريد الإلكتروني أو رقم الهاتف مسجل مسبقاً", status_code=409)

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=UserRole.agent,
    )
    db.add(user)
    db.flush()  # للحصول على user.id قبل إنشاء ملف الوكيل

    agent = AgentProfile(
        user_id=user.id,
        agency_name=payload.agency_name,
        payment_mode=payload.payment_mode,
        credit_limit=payload.credit_limit,
        discount_rate=payload.discount_rate,
    )
    db.add(agent)

    audit_service.log_action(
        db,
        user_id=created_by.id,
        action="create_agent",
        details={"agency_name": payload.agency_name, "payment_mode": payload.payment_mode.value},
    )
    db.commit()
    db.refresh(agent)
    return agent


def list_agents(db: Session) -> list[AgentProfile]:
    return db.query(AgentProfile).order_by(AgentProfile.created_at.desc()).all()


def get_agent_or_404(db: Session, agent_id: int) -> AgentProfile:
    agent = db.query(AgentProfile).filter(AgentProfile.id == agent_id).first()
    if not agent:
        raise AppException("الوكيل غير موجود", status_code=404)
    return agent


def get_agent_by_user_or_404(db: Session, user_id: int) -> AgentProfile:
    agent = db.query(AgentProfile).filter(AgentProfile.user_id == user_id).first()
    if not agent:
        raise AppException("لا يوجد ملف وكيل مرتبط بهذا الحساب", status_code=404)
    return agent


def update_agent(db: Session, agent_id: int, payload: AgentUpdateRequest, changed_by: User) -> AgentProfile:
    agent = get_agent_or_404(db, agent_id)

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(agent, field, value)

    audit_service.log_action(
        db,
        user_id=changed_by.id,
        action="update_agent",
        details={"agent_id": agent.id, **{k: str(v) for k, v in updates.items()}},
    )
    db.commit()
    db.refresh(agent)
    return agent


def set_custom_rate(db: Session, agent_id: int, payload: CustomRateCreateRequest, changed_by: User) -> B2BServiceRate:
    agent = get_agent_or_404(db, agent_id)
    service = db.query(Service).filter(Service.id == payload.service_id).first()
    if not service:
        raise AppException("الخدمة غير موجودة", status_code=404)

    rate = (
        db.query(B2BServiceRate)
        .filter(B2BServiceRate.agent_id == agent.id, B2BServiceRate.service_id == service.id)
        .first()
    )
    if rate:
        rate.custom_price_usd = payload.custom_price_usd
    else:
        rate = B2BServiceRate(
            agent_id=agent.id, service_id=service.id, custom_price_usd=payload.custom_price_usd
        )
        db.add(rate)

    audit_service.log_action(
        db,
        user_id=changed_by.id,
        action="set_b2b_custom_rate",
        details={"agent_id": agent.id, "service_id": service.id, "price": str(payload.custom_price_usd)},
    )
    db.commit()
    db.refresh(rate)
    return rate


def get_effective_price_usd(db: Session, service: Service, agent: AgentProfile | None):
    if agent:
        custom_rate = (
            db.query(B2BServiceRate)
            .filter(B2BServiceRate.agent_id == agent.id, B2BServiceRate.service_id == service.id)
            .first()
        )
        if custom_rate:
            return custom_rate.custom_price_usd

        discount_multiplier = (100 - agent.discount_rate) / 100
        return (service.base_price_usd * discount_multiplier).quantize(service.base_price_usd)

    return service.base_price_usd
