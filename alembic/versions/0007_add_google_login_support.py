# File: alembic/versions/0007_add_google_login_support.py

"""add google login support to users

Revision ID: 0007_add_google_login_support
Revises: 0006_add_service_requirements
Create Date: 2026-07-23

يضيف عمود google_id لجدول users (لربط الحساب بمعرّف قوقل)، ويجعل
phone وpassword_hash اختياريين لأن حساب دخّل عبر قوقل قد لا يملك
رقم هاتف أو كلمة مرور محلية عند إنشائه.
"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "0007_add_google_login_support"
down_revision = "0006_add_service_requirements"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("google_id", sa.String(length=255), nullable=True))
    op.create_index("ix_users_google_id", "users", ["google_id"], unique=True)
    op.alter_column("users", "phone", existing_type=sa.String(length=20), nullable=True)
    op.alter_column("users", "password_hash", existing_type=sa.String(length=255), nullable=True)


def downgrade() -> None:
    op.alter_column("users", "password_hash", existing_type=sa.String(length=255), nullable=False)
    op.alter_column("users", "phone", existing_type=sa.String(length=20), nullable=False)
    op.drop_index("ix_users_google_id", table_name="users")
    op.drop_column("users", "google_id")
