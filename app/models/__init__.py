"""
تجميع كل النماذج في مكان واحد حتى تكون معروفة لـ Base.metadata
(مطلوب من أجل Alembic autogenerate و create_all في بيئة التطوير).
"""

from app.models.user import User  # noqa: F401
from app.models.agent import AgentProfile  # noqa: F401
from app.models.currency import Currency  # noqa: F401
from app.models.service import Service, VisaResidencyDetail, B2BServiceRate  # noqa: F401
from app.models.service_requirement import ServiceRequirement  # noqa: F401
from app.models.order import Order, OrderPassenger, OrderStatusLog  # noqa: F401
from app.models.payment import Payment  # noqa: F401
from app.models.refund import Refund  # noqa: F401
from app.models.wallet import AgentWalletLog  # noqa: F401
from app.models.lead import LeadRequest  # noqa: F401
from app.models.audit import AuditLog  # noqa: F401
