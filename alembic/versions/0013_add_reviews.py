# File: alembic/versions/0013_add_reviews.py

"""add reviews table for public customer testimonials

Revision ID: 0013_add_reviews
Revises: 0012_add_social_links
Create Date: 2026-07-25

يضيف جدول reviews: رأي/تقييم عميل واحد (تقييم 1-5 + تعليق نصي)، يُنشئه
أي مستخدم مسجَّل دخوله ويظهر مباشرة للزوار في الصفحة العامة، مع إمكانية
حذفه نهائياً من قِبَل المدير فقط.
"""

import sqlalchemy as sa
from alembic import op

revision = "0013_add_reviews"
down_revision = "0012_add_social_links"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "reviews",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("rating", sa.SmallInteger, nullable=False),
        sa.Column("comment", sa.Text, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.CheckConstraint("rating >= 1 AND rating <= 5", name="ck_reviews_rating_range"),
    )


def downgrade() -> None:
    op.drop_table("reviews")
