# File: alembic/versions/0010_add_ship_booking_fee_setting.py

"""add ship_booking_fee_settings table for the ship ticket booking fee

Revision ID: 0010_add_ship_booking_fee
Revises: 0009_add_ship_routes
Create Date: 2026-07-24

يضيف جدول ship_booking_fee_settings (صف واحد فقط): رسم حجز تذاكر
البواخر الحالي (فلات أو نسبة)، يُطبَّق فوق سعر خط الباخرة الحقيقي.
يستخدم نوع postgresql.ENUM موجود مسبقاً (flight_booking_fee_type) بدل
إنشاء نوع مطابق جديد، تفادياً لتكرار نفس قيم التعداد (flat/percentage).
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0010_add_ship_booking_fee"
down_revision = "0009_add_ship_routes"
branch_labels = None
depends_on = None

_FEE_TYPE_ENUM_NAME = "ship_booking_fee_type"


def upgrade() -> None:
    op.execute(
        f"""
        DO $$ BEGIN
            CREATE TYPE {_FEE_TYPE_ENUM_NAME} AS ENUM ('flat', 'percentage');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
        """
    )

    op.create_table(
        "ship_booking_fee_settings",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column(
            "fee_type",
            postgresql.ENUM("flat", "percentage", name=_FEE_TYPE_ENUM_NAME, create_type=False),
            nullable=False,
        ),
        sa.Column("fee_value", sa.DECIMAL(10, 2), nullable=False, server_default="0"),
        sa.Column("updated_by", sa.Integer, sa.ForeignKey("users.id"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("ship_booking_fee_settings")
    op.execute(f"DROP TYPE IF EXISTS {_FEE_TYPE_ENUM_NAME}")
