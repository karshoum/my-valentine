from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import AppException
from app.core.permissions import require_admin, require_staff
from app.core.security import get_current_user
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.agent import (
    AgentCreateRequest,
    AgentOut,
    AgentUpdateRequest,
    CustomRateCreateRequest,
    CustomRateOut,
    WalletDepositRequest,
)
from app.services import agent_service, wallet_service

router = APIRouter(prefix="/api/v1/agents", tags=["الوكلاء (B2B)"])


@router.post("", response_model=AgentOut, status_code=status.HTTP_201_CREATED)
def create_agent(
    payload: AgentCreateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    return agent_service.create_agent(db, payload, admin_user)


@router.get("", response_model=list[AgentOut])
def list_agents(db: Session = Depends(get_db), _: User = Depends(require_staff)):
    return agent_service.list_agents(db)


@router.get("/me", response_model=AgentOut)
def get_my_agent_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.agent:
        raise AppException("هذه الشاشة مخصصة لحسابات الوكلاء فقط", status_code=403)
    return agent_service.get_agent_by_user_or_404(db, current_user.id)


@router.patch("/{agent_id}", response_model=AgentOut)
def update_agent(
    agent_id: int,
    payload: AgentUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    return agent_service.update_agent(db, agent_id, payload, admin_user)


@router.post("/{agent_id}/wallet/deposit", status_code=status.HTTP_201_CREATED)
def deposit_to_wallet(
    agent_id: int,
    payload: WalletDepositRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_staff),
):
    agent = agent_service.get_agent_or_404(db, agent_id)
    return wallet_service.deposit(db, agent, payload.amount, admin_user, payload.notes)


@router.get("/{agent_id}/wallet/logs")
def get_wallet_logs(
    agent_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_staff),
):
    agent = agent_service.get_agent_or_404(db, agent_id)
    return wallet_service.list_wallet_logs(db, agent)


@router.post("/{agent_id}/rates", response_model=CustomRateOut, status_code=status.HTTP_201_CREATED)
def set_custom_rate(
    agent_id: int,
    payload: CustomRateCreateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    return agent_service.set_custom_rate(db, agent_id, payload, admin_user)
