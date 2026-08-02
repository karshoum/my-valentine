# File: app/models/review.py

from sqlalchemy import CheckConstraint, Column, DateTime, ForeignKey, Integer, SmallInteger, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Review(Base):
    """رأي/تقييم عميل واحد يظهر علناً في صفحة الزوار (تقييم من 1 إلى 5 مع تعليق نصي)."""

    __tablename__ = "reviews"
    __table_args__ = (CheckConstraint("rating >= 1 AND rating <= 5", name="ck_reviews_rating_range"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(SmallInteger, nullable=False)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")

    @property
    def customer_name(self) -> str:
        """اسم صاحب الرأي المعروض علناً، مأخوذ من حساب المستخدم المرتبط."""
        return self.user.full_name
