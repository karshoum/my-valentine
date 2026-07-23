# File: alembic/versions/0004_add_service_discount_fields.py

"""add discount_percentage and discount_valid_until to services

Revision ID: 0004_add_service_discount_fields
Revises: 0003_expand_service_category
Create Date: 2026-07-23

يضيف حقلي discount_percentage وdiscount_valid_until لجدول services،
لدعم عروض خصم محدودة المدة يُدرجها admin على أي خدمة. الحقلان اختياريان
(nullable) — غياب أحدهما أو كليهما يعني عدم وجود عرض حالي على الخدمة.
"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "0004_add_service_discount_fields"
down_revision = "0003_expand_service_category"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("services", sa.Column("discount_percentage", sa.DECIMAL(5, 2), nullable=True))
    op.add_column("services", sa.Column("discount_valid_until", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("services", "discount_valid_until")
    op.drop_column("services", "discount_percentage")
