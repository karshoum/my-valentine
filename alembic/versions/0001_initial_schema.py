# File: alembic/versions/0001_initial_schema.py

"""initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-07-22

يُنشئ هذا الترحيل جميع الجداول والأنواع التعدادية (Enums) المطابقة
لمخطط قاعدة البيانات المعتمد لمنصة وكالة براديس. كُتب يدوياً (وليس عبر
autogenerate) لأنه لا تتوفر قاعدة بيانات PostgreSQL حية وقت الكتابة؛
يُنفَّذ عبر `alembic upgrade head` فور توفر اتصال حقيقي.
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None

user_role = postgresql.ENUM("admin", "employee", "agent", "customer", name="user_role", create_type=False)
payment_mode = postgresql.ENUM("prepaid_wallet", "credit_limit", "pay_per_order", name="payment_mode", create_type=False)
service_category = postgresql.ENUM("flight", "visa", "residency", "insurance", name="service_category", create_type=False)
order_status = postgresql.ENUM(
    "pending", "processing", "in_system", "completed", "rejected", "refunded", name="order_status", create_type=False
)
payment_method = postgresql.ENUM("bankak", "visa", "agent_wallet", name="payment_method", create_type=False)
payment_status = postgresql.ENUM("pending", "verified", "rejected", name="payment_status", create_type=False)
refund_status = postgresql.ENUM("pending", "approved", "processed", "declined", name="refund_status", create_type=False)
wallet_transaction_type = postgresql.ENUM(
    "deposit", "deduction", "refund", name="wallet_transaction_type", create_type=False
)
lead_service_type = postgresql.ENUM("logistics", "media_ads", name="lead_service_type", create_type=False)


def upgrade() -> None:
    bind = op.get_bind()
    for enum_type in (
        user_role,
        payment_mode,
        service_category,
        order_status,
        payment_method,
        payment_status,
        refund_status,
        wallet_transaction_type,
        lead_service_type,
    ):
        enum_type.create(bind, checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("full_name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=100), nullable=True),
        sa.Column("phone", sa.String(length=20), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", user_role, nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "agent_profiles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True
        ),
        sa.Column("agency_name", sa.String(length=100), nullable=False),
        sa.Column("payment_mode", payment_mode, nullable=False),
        sa.Column("wallet_balance", sa.DECIMAL(12, 2), nullable=False, server_default="0"),
        sa.Column("credit_limit", sa.DECIMAL(12, 2), nullable=False, server_default="0"),
        sa.Column("discount_rate", sa.DECIMAL(5, 2), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "currencies",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("code", sa.String(length=5), nullable=False, unique=True),
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("rate_to_usd", sa.DECIMAL(12, 4), nullable=False),
        sa.Column("is_manual", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("updated_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_currencies_code", "currencies", ["code"])

    op.create_table(
        "services",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("category", service_category, nullable=False),
        sa.Column("title", sa.String(length=150), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("base_price_usd", sa.DECIMAL(10, 2), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "visa_residency_details",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("service_id", sa.Integer(), sa.ForeignKey("services.id", ondelete="CASCADE"), nullable=False),
        sa.Column("country", sa.String(length=50), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("requirements", sa.Text(), nullable=True),
        sa.Column("processing_time", sa.String(length=50), nullable=True),
        sa.Column("is_dynamic_price", sa.Boolean(), nullable=False, server_default=sa.false()),
    )

    op.create_table(
        "b2b_service_rates",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "agent_id", sa.Integer(), sa.ForeignKey("agent_profiles.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("service_id", sa.Integer(), sa.ForeignKey("services.id", ondelete="CASCADE"), nullable=False),
        sa.Column("custom_price_usd", sa.DECIMAL(10, 2), nullable=False),
    )

    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_number", sa.String(length=30), nullable=False, unique=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("service_id", sa.Integer(), sa.ForeignKey("services.id"), nullable=False),
        sa.Column("total_amount", sa.DECIMAL(12, 2), nullable=False),
        sa.Column("currency_code", sa.String(length=5), sa.ForeignKey("currencies.code"), nullable=False),
        sa.Column("status", order_status, nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_orders_order_number", "orders", ["order_number"])

    op.create_table(
        "order_passengers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_id", sa.Integer(), sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False),
        sa.Column("full_name", sa.String(length=100), nullable=False),
        sa.Column("passport_number", sa.String(length=30), nullable=True),
        sa.Column("passport_file_url", sa.String(length=255), nullable=True),
    )

    op.create_table(
        "order_status_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_id", sa.Integer(), sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False),
        sa.Column("old_status", order_status, nullable=True),
        sa.Column("new_status", order_status, nullable=False),
        sa.Column("changed_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "payments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_id", sa.Integer(), sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False),
        sa.Column("payment_method", payment_method, nullable=False),
        sa.Column("amount", sa.DECIMAL(12, 2), nullable=False),
        sa.Column("currency_code", sa.String(length=5), sa.ForeignKey("currencies.code"), nullable=True),
        sa.Column("receipt_image_url", sa.String(length=255), nullable=True),
        sa.Column("transaction_ref", sa.String(length=100), nullable=True),
        sa.Column("status", payment_status, nullable=False, server_default="pending"),
        sa.Column("verified_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "refunds",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_id", sa.Integer(), sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False),
        sa.Column("refund_amount", sa.DECIMAL(12, 2), nullable=False),
        sa.Column("currency_code", sa.String(length=5), sa.ForeignKey("currencies.code"), nullable=True),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("status", refund_status, nullable=False, server_default="pending"),
        sa.Column("processed_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "agent_wallet_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "agent_id", sa.Integer(), sa.ForeignKey("agent_profiles.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("transaction_type", wallet_transaction_type, nullable=False),
        sa.Column("amount", sa.DECIMAL(12, 2), nullable=False),
        sa.Column("order_id", sa.Integer(), sa.ForeignKey("orders.id", ondelete="SET NULL"), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "lead_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("service_type", lead_service_type, nullable=False),
        sa.Column("customer_name", sa.String(length=100), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=False),
        sa.Column("details", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("action", sa.String(length=100), nullable=False),
        sa.Column("details", postgresql.JSONB(), nullable=True),
        sa.Column("ip_address", sa.String(length=45), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("lead_requests")
    op.drop_table("agent_wallet_logs")
    op.drop_table("refunds")
    op.drop_table("payments")
    op.drop_table("order_status_logs")
    op.drop_table("order_passengers")
    op.drop_table("orders")
    op.drop_table("b2b_service_rates")
    op.drop_table("visa_residency_details")
    op.drop_table("services")
    op.drop_table("currencies")
    op.drop_table("agent_profiles")
    op.drop_table("users")

    bind = op.get_bind()
    for enum_type in (
        lead_service_type,
        wallet_transaction_type,
        refund_status,
        payment_status,
        payment_method,
        order_status,
        service_category,
        payment_mode,
        user_role,
    ):
        enum_type.drop(bind, checkfirst=True)
