# File: alembic/versions/0006_add_service_requirements.py

"""add service_requirements table

Revision ID: 0006_add_service_requirements
Revises: 0005_add_order_deliverable_file
Create Date: 2026-07-23

يضيف جدول service_requirements: قائمة بنود المستندات/المتطلبات
المطلوبة لكل خدمة (جواز سفر، صورة شخصية، تأمين طبي...)، قابلة للتعديل
الكامل من المدير عبر واجهة إدارة الخدمات، وتظهر للعميل عند إنشاء طلب.
"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "0006_add_service_requirements"
down_revision = "0005_add_order_deliverable_file"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "service_requirements",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "service_id",
            sa.Integer(),
            sa.ForeignKey("services.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("requirement_text", sa.String(length=500), nullable=False),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_table("service_requirements")
