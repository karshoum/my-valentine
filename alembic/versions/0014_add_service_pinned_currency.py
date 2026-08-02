# File: alembic/versions/0014_add_service_pinned_currency.py

"""add pinned currency price fields to services

Revision ID: 0014_add_service_pinned_currency
Revises: 0013_add_reviews
Create Date: 2026-07-25

يضيف حقلين اختياريين لجدول services: pinned_currency_code وpinned_price_amount،
يسمحان للمدير بتثبيت سعر خدمة معينة بعملة محدَّدة (مثال: تأشيرة سعودية
بالريال فقط) بحيث لا يتغير هذا السعر أبداً مهما بدّل الزائر عملة العرض.
"""

import sqlalchemy as sa
from alembic import op

revision = "0014_add_service_pinned_currency"
down_revision = "0013_add_reviews"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("services", sa.Column("pinned_currency_code", sa.String(length=5), nullable=True))
    op.add_column("services", sa.Column("pinned_price_amount", sa.DECIMAL(10, 2), nullable=True))


def downgrade() -> None:
    op.drop_column("services", "pinned_price_amount")
    op.drop_column("services", "pinned_currency_code")
