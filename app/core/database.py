# File: app/core/database.py

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker, declarative_base

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    تبعية FastAPI (Dependency) توفّر جلسة SQLAlchemy واحدة لكل طلب،
    وتغلقها تلقائياً بعد انتهاء معالجة الطلب سواء نجح أم فشل.

    Yields:
        Session: جلسة قاعدة بيانات جاهزة للاستخدام داخل الـ Endpoint.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
