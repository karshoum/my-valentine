# File: scripts/seed_initial_data.py

"""
تهيئة البيانات الأساسية لمنصة وكالة برادايس بعد تشغيل الترحيلات
(alembic upgrade head) على قاعدة بيانات فارغة: العملات الأساسية وحساب
مدير افتراضي واحد.

الاستخدام:
    ADMIN_EMAIL=... ADMIN_PHONE=... ADMIN_PASSWORD=... \
        python -m scripts.seed_initial_data

قيم المدير قابلة للتخصيص عبر متغيرات البيئة، وإلا تُستخدم قيم افتراضية
يجب تغييرها فوراً بعد أول تسجيل دخول.
"""

import os

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.currency import Currency
from app.models.enums import UserRole
from app.models.user import User

DEFAULT_CURRENCIES = [
    {"code": "USD", "name": "الدولار الأمريكي", "rate_to_usd": 1},
    {"code": "SDG", "name": "الجنيه السوداني", "rate_to_usd": 600},
    {"code": "SAR", "name": "الريال السعودي", "rate_to_usd": 3.75},
    {"code": "AED", "name": "الدرهم الإماراتي", "rate_to_usd": 3.6725},
    {"code": "TRY", "name": "الليرة التركية", "rate_to_usd": 34},
]


def seed_currencies(db: Session) -> None:
    """يضيف العملات الأساسية إن لم تكن موجودة مسبقاً (لا يُكرِّر الإدخال)."""
    for entry in DEFAULT_CURRENCIES:
        exists = db.query(Currency).filter(Currency.code == entry["code"]).first()
        if exists:
            continue
        db.add(Currency(code=entry["code"], name=entry["name"], rate_to_usd=entry["rate_to_usd"], is_manual=True))
        print(f"تمت إضافة العملة: {entry['code']}")


def seed_admin(db: Session) -> None:
    """ينشئ حساب مدير افتراضياً واحداً إذا لم يوجد أي حساب admin بعد."""
    email = os.getenv("ADMIN_EMAIL", "admin@wakalat-paradise.com")
    phone = os.getenv("ADMIN_PHONE", "0900000000")
    password = os.getenv("ADMIN_PASSWORD", "ChangeMe@2026")

    exists = db.query(User).filter(User.role == UserRole.admin).first()
    if exists:
        print("يوجد حساب مدير بالفعل، تم تخطي هذه الخطوة.")
        return

    admin = User(
        full_name="مدير النظام",
        email=email,
        phone=phone,
        password_hash=hash_password(password),
        role=UserRole.admin,
    )
    db.add(admin)
    print(f"تم إنشاء حساب المدير: {email} — يرجى تغيير كلمة المرور فوراً بعد أول دخول.")


def main() -> None:
    """نقطة الدخول: يفتح جلسة قاعدة بيانات وينفّذ كل خطوات التهيئة."""
    db = SessionLocal()
    try:
        seed_currencies(db)
        seed_admin(db)
        db.commit()
        print("اكتملت تهيئة البيانات الأساسية بنجاح.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
