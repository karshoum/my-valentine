# File: alembic/versions/0012_add_social_links.py

"""add social_links table for admin-managed contact/social links

Revision ID: 0012_add_social_links
Revises: 0011_add_user_whatsapp
Create Date: 2026-07-24

يضيف جدول social_links: كل صف يمثّل رابط تواصل واحد (واتساب/فيسبوك/
إنستغرام/...) يضيفه المدير من لوحة التحكم ويظهر مباشرة لكل زوّار
الصفحة العامة، مرتّباً حسب display_order.
"""

import sqlalchemy as sa
from alembic import op

revision = "0012_add_social_links"
down_revision = "0011_add_user_whatsapp"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "social_links",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("platform_name", sa.String(50), nullable=False),
        sa.Column("url", sa.String(500), nullable=False),
        sa.Column("display_order", sa.Integer, nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("social_links")
