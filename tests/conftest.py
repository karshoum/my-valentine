# File: tests/conftest.py

import os

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key")
os.environ.setdefault("SIGNED_URL_SECRET", "test-signed-url-secret")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import hash_password
from app.main import app
from app.models.agent import AgentProfile
from app.models.currency import Currency
from app.models.enums import PaymentMode, UserRole
from app.models.service import Service
from app.models.user import User

engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db_session():
    """ينشئ كل الجداول على SQLite في الذاكرة، ويوفّر جلسة نظيفة لكل اختبار."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    """يوفّر TestClient لتطبيق FastAPI مع استبدال get_db بجلسة الاختبار."""

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def usd_currency(db_session):
    """يضيف عملة الدولار الأمريكي (سعر أساس = 1) لاستخدامها في اختبارات التسعير."""
    currency = Currency(code="USD", name="US Dollar", rate_to_usd=1, is_manual=True)
    db_session.add(currency)
    db_session.commit()
    db_session.refresh(currency)
    return currency


@pytest.fixture()
def sdg_currency(db_session):
    """يضيف عملة الجنيه السوداني بسعر 600 مقابل الدولار لاختبار التحويل اليدوي."""
    currency = Currency(code="SDG", name="Sudanese Pound", rate_to_usd=600, is_manual=True)
    db_session.add(currency)
    db_session.commit()
    db_session.refresh(currency)
    return currency


@pytest.fixture()
def admin_user(db_session):
    """ينشئ حساب مدير (admin) جاهزاً للاستخدام في اختبارات الصلاحيات."""
    user = User(
        full_name="مدير النظام",
        email="admin@baradis.example",
        phone="0900000001",
        password_hash=hash_password("Admin@12345"),
        role=UserRole.admin,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def employee_user(db_session):
    """ينشئ حساب موظف (employee) جاهزاً لاختبارات المراجعة اليدوية."""
    user = User(
        full_name="موظف الاستقبال",
        email="employee@baradis.example",
        phone="0900000002",
        password_hash=hash_password("Employee@12345"),
        role=UserRole.employee,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def customer_user(db_session):
    """ينشئ حساب عميل (customer) جاهزاً لاختبارات الطلبات."""
    user = User(
        full_name="عميل تجريبي",
        email="customer@baradis.example",
        phone="0900000003",
        password_hash=hash_password("Customer@12345"),
        role=UserRole.customer,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def sample_service(db_session):
    """ينشئ خدمة تذكرة طيران أساسية (300 دولار) لاستخدامها في اختبارات الطلبات."""
    service = Service(
        category="flight",
        title="تذكرة الخرطوم - جدة",
        base_price_usd=300,
        is_active=True,
    )
    db_session.add(service)
    db_session.commit()
    db_session.refresh(service)
    return service


def make_agent(db_session, payment_mode: PaymentMode, credit_limit=0, discount_rate=0, wallet_balance=0):
    """
    دالة مساعدة (وليست fixture) تنشئ حساب وكيل B2B بوضع دفع محدَّد،
    لاستخدامها في اختبارات محفظة الوكلاء بالأوضاع الثلاثة.

    Args:
        db_session: جلسة قاعدة بيانات الاختبار.
        payment_mode: وضع الدفع المطلوب اختباره.
        credit_limit: الحد الائتماني الابتدائي.
        discount_rate: نسبة الخصم الابتدائية.
        wallet_balance: رصيد المحفظة الابتدائي.

    Returns:
        tuple[User, AgentProfile]: حساب المستخدم وملف الوكيل المرتبط به.
    """
    user = User(
        full_name="وكيل تجريبي",
        email=f"agent-{payment_mode.value}@baradis.example",
        phone=f"09000{hash(payment_mode.value) % 100000:05d}",
        password_hash=hash_password("Agent@12345"),
        role=UserRole.agent,
    )
    db_session.add(user)
    db_session.flush()

    agent = AgentProfile(
        user_id=user.id,
        agency_name=f"وكالة {payment_mode.value}",
        payment_mode=payment_mode,
        credit_limit=credit_limit,
        discount_rate=discount_rate,
        wallet_balance=wallet_balance,
    )
    db_session.add(agent)
    db_session.commit()
    db_session.refresh(agent)
    return user, agent
