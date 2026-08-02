# File: alembic/versions/0016_add_offices.py

"""add offices table for admin-managed branch addresses

Revision ID: 0016_add_offices
Revises: 0015_add_payment_settings
Create Date: 2026-08-02

يضيف جدول offices: مكاتب/فروع الوكالة (دولة + عنوان تفصيلي)، يديرها
المدير وتظهر مباشرة في الصفحة العامة تحت قسم "مكاتبنا".
"""

import sqlalchemy as sa
from alembic import op

revision = "0016_add_offices"
down_revision = "0015_add_payment_settings"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "offices",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("country", sa.String(length=50), nullable=False),
        sa.Column("address_line", sa.String(length=255), nullable=False),
        sa.Column("display_order", sa.Integer, nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("offices")
