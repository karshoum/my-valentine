# File: alembic/versions/0011_add_user_whatsapp_number.py

"""add whatsapp_number column to users

Revision ID: 0011_add_user_whatsapp
Revises: 0010_add_ship_booking_fee
Create Date: 2026-07-24

يضيف عمود whatsapp_number لجدول users، منفصل عن phone (رقم تسجيل
الدخول)، ليتمكّن المستخدم من إضافة/تعديل رقم واتساب مختلف من شاشة
"حسابي" يُستخدَم للتواصل معه.
"""

import sqlalchemy as sa
from alembic import op

revision = "0011_add_user_whatsapp"
down_revision = "0010_add_ship_booking_fee"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("whatsapp_number", sa.String(20), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "whatsapp_number")
