# File: alembic/versions/0015_add_payment_settings.py

"""add payment_settings table for bankak account + visa whatsapp config

Revision ID: 0015_add_payment_settings
Revises: 0014_add_service_pinned_currency
Create Date: 2026-08-02

يضيف جدول payment_settings (صف واحد فقط): رقم واسم حساب بنكك الذي يظهر
للعميل عند اختيار الدفع عبر بنكك، ورقم واتساب لتأكيد الدفع بالفيزا
مباشرة، مع مفتاحي تفعيل/تعطيل مستقلَّين لكل وسيلة.
"""

import sqlalchemy as sa
from alembic import op

revision = "0015_add_payment_settings"
down_revision = "0014_add_service_pinned_currency"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "payment_settings",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("bankak_account_number", sa.String(length=50), nullable=True),
        sa.Column("bankak_account_name", sa.String(length=150), nullable=True),
        sa.Column("bankak_is_enabled", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("visa_whatsapp_number", sa.String(length=20), nullable=True),
        sa.Column("visa_is_enabled", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("updated_by", sa.Integer, sa.ForeignKey("users.id"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("payment_settings")
