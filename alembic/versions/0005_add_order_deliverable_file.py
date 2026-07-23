# File: alembic/versions/0005_add_order_deliverable_file.py

"""add deliverable_file_url to orders

Revision ID: 0005_add_order_deliverable_file
Revises: 0004_add_service_discount_fields
Create Date: 2026-07-23

يضيف عمود deliverable_file_url لجدول orders، لتخزين مسار المستند
النهائي (تذكرة/فيزا/أي مخرج آخر للخدمة) الذي يرفعه الموظف بعد إتمام
الحجز الفعلي خارج النظام (عادة عند نقل الطلب لحالة in_system أو completed).
"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "0005_add_order_deliverable_file"
down_revision = "0004_add_service_discount_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("deliverable_file_url", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("orders", "deliverable_file_url")
