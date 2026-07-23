# File: alembic/versions/0002_add_user_token_version.py

"""add token_version to users

Revision ID: 0002_add_user_token_version
Revises: 0001_initial_schema
Create Date: 2026-07-23

يضيف عمود token_version لجدول users، يُستخدم لإبطال كل توكنات JWT
الصادرة قبل تغيير كلمة المرور دون الحاجة لقائمة إبطال (blacklist)
منفصلة. القيمة الافتراضية 0 لكل المستخدمين الحاليين.
"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "0002_add_user_token_version"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("token_version", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("users", "token_version")
