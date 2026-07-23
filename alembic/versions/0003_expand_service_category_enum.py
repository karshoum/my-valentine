# File: alembic/versions/0003_expand_service_category_enum.py

"""expand service_category enum with new agency service sections

Revision ID: 0003_expand_service_category_enum
Revises: 0002_add_user_token_version
Create Date: 2026-07-23

يضيف 7 قيم جديدة لنوع service_category الحالي في PostgreSQL، تغطي أقسام
خدمات جديدة قدّمتها الوكالة (تذاكر بواخر، تجديد/تمديد، موافقات أمنية،
بكجات تخليص إجراءات، بكجات سياحية، استخراج مستندات، توثيق). PostgreSQL
لا يدعم حذف قيمة من نوع Enum موجود (لا يوجد DROP VALUE)، لذا downgrade
لهذا الترحيل غير قابل للتنفيذ فعلياً — أي صف يستخدم القيم الجديدة يمنع
أي محاولة تراجع حقيقية بغض النظر عن هذا الملف.
"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "0003_expand_service_category_enum"
down_revision = "0002_add_user_token_version"
branch_labels = None
depends_on = None

NEW_ENUM_VALUES = (
    "ship_ticket",
    "renewal_extension",
    "security_approval",
    "procedure_package",
    "tourism_package",
    "document_extraction",
    "attestation",
)


def upgrade() -> None:
    for value in NEW_ENUM_VALUES:
        op.execute(f"ALTER TYPE service_category ADD VALUE IF NOT EXISTS '{value}'")


def downgrade() -> None:
    raise NotImplementedError(
        "PostgreSQL لا يدعم إزالة قيمة من نوع Enum. للتراجع، أنشئ نوعاً "
        "جديداً بالقيم القديمة فقط وانقل الأعمدة إليه يدوياً بعد التأكد "
        "من عدم وجود صفوف تستخدم القيم الجديدة."
    )
