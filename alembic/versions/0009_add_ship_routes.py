# File: alembic/versions/0009_add_ship_routes.py

"""add ship_routes table for admin-configured ferry routes with per-age pricing

Revision ID: 0009_add_ship_routes
Revises: 0008_add_flight_booking_tables
Create Date: 2026-07-24

يضيف جدول ship_routes: خطوط بواخر يُعدّها المدير (مدينة انطلاق/وصول،
سعر البالغ/الطفل/الرضيع بالدولار)، تُعرض للزوار في واجهة حجز تذاكر
البواخر العامة.
"""

import sqlalchemy as sa
from alembic import op

revision = "0009_add_ship_routes"
down_revision = "0008_add_flight_booking_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ship_routes",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("origin_city", sa.String(100), nullable=False),
        sa.Column("destination_city", sa.String(100), nullable=False),
        sa.Column("adult_price_usd", sa.DECIMAL(10, 2), nullable=False, server_default="0"),
        sa.Column("child_price_usd", sa.DECIMAL(10, 2), nullable=False, server_default="0"),
        sa.Column("infant_price_usd", sa.DECIMAL(10, 2), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("ship_routes")
