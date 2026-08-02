# File: alembic/versions/0008_add_flight_booking_tables.py

"""add flight booking fee setting, flight booking details, order contact_whatsapp

Revision ID: 0008_add_flight_booking_tables
Revises: 0007_add_google_login_support
Create Date: 2026-07-23

يضيف: (1) flight_booking_fee_settings - صف إعداد وحيد يحدّد رسم حجز
الطيران الحالي (فلات أو نسبة)، يعدّله المدير في أي وقت، (2)
flight_booking_details - تفاصيل رحلة الطيران/الباخرة المختارة لكل طلب
(مسار، تواريخ، السعر الحقيقي من مزوّد البيانات، والرسوم المضافة)، (3)
عمود orders.contact_whatsapp لتسهيل تواصل الموظف مع العميل عند وجود
مستجدات.
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0008_add_flight_booking_tables"
down_revision = "0007_add_google_login_support"
branch_labels = None
depends_on = None

flight_booking_fee_type = postgresql.ENUM(
    "flat", "percentage", name="flight_booking_fee_type", create_type=False
)


def upgrade() -> None:
    op.execute(
        """
        DO $$ BEGIN
            CREATE TYPE flight_booking_fee_type AS ENUM ('flat', 'percentage');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
        """
    )

    op.create_table(
        "flight_booking_fee_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("fee_type", flight_booking_fee_type, nullable=False),
        sa.Column("fee_value", sa.DECIMAL(10, 2), nullable=False, server_default="0"),
        sa.Column("updated_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "flight_booking_details",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "order_id", sa.Integer(), sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, unique=True
        ),
        sa.Column("origin", sa.String(length=10), nullable=False),
        sa.Column("destination", sa.String(length=10), nullable=False),
        sa.Column("departure_date", sa.Date(), nullable=False),
        sa.Column("return_date", sa.Date(), nullable=True),
        sa.Column("airline_name", sa.String(length=100), nullable=False),
        sa.Column("base_fare_usd", sa.DECIMAL(10, 2), nullable=False),
        sa.Column("fee_amount_usd", sa.DECIMAL(10, 2), nullable=False),
    )

    op.add_column("orders", sa.Column("contact_whatsapp", sa.String(length=20), nullable=True))


def downgrade() -> None:
    op.drop_column("orders", "contact_whatsapp")
    op.drop_table("flight_booking_details")
    op.drop_table("flight_booking_fee_settings")
    op.execute("DROP TYPE IF EXISTS flight_booking_fee_type")
