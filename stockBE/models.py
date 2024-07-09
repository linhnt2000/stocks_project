from sqlalchemy import Column, Integer,Float, String, Text, ForeignKey,  DateTime, UniqueConstraint,Enum
from database import Base
from sqlalchemy.orm import relationship
import enum

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100),nullable=False, unique=True, index=True)
    password = Column(String(100),nullable=False)

class Guide(Base):
    __tablename__ = "guides"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100),nullable=False, unique=True, index=True)
    description = Column(String(100),nullable=False)
    content = Column(Text,nullable=False)
    link = Column(String(100),nullable=False)
    # user_id = Column(Integer, ForeignKey("users.id"))

class Companies(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100),nullable=False)
    ticker = Column(String(100),unique=True,nullable=False, index=True)
    group = Column(String(100),nullable=False)


class Groups(Base):
    __tablename__ = "group_tracking"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(100), nullable=False)

    # Thiết lập mối quan hệ với bảng tracking
    trackings = relationship("Tracking", back_populates="group", cascade="all, delete-orphan")

class Tracking(Base):
    __tablename__ = "tracking"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("group_tracking.id"))
    code = Column(String(100), nullable=False)  # No unique constraint here
    added_date = Column(DateTime, nullable=False)

    # Thiết lập mối quan hệ với bảng group_tracking
    group = relationship("Groups", back_populates="trackings")

    __table_args__ = (
        UniqueConstraint('group_id', 'code', name='_group_code_uc'),  # Unique constraint on the pair
    )

class EStatus(str, enum.Enum):
    SENT = "sent"
    PENDING = "pending"
    FAILED = "failed"
    READ = "read"

class NotificationType(Base):
    __tablename__ = "notification_type"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(100), nullable=False)

    notifications = relationship("Notification", back_populates="type")

class Notification(Base):
    __tablename__ = "notification"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type_id = Column(Integer, ForeignKey("notification_type.id"))
    message = Column(Text, nullable=False)
    created_date = Column(DateTime, nullable=False)
    status = Column(Enum(EStatus), nullable=False)


    # Thiết lập mối quan hệ với bảng notification_type
    type = relationship("NotificationType", back_populates="notifications")


class Stocks(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String(100), nullable=False)
    time = Column(DateTime, nullable=False)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Integer, nullable=False)

class ECondition(enum.Enum):
    PriceWithMA5 = "Giá so với SMA(5)"
    PriceWithMA20 = "Giá so với SMA(20)"
    VolumeWithMA5 = "Khối lượng so với SMA(5)"

class EComparison(enum.Enum):
    GE = ">="
    LE = "<="

class AlertConditions(Base):
    __tablename__ = "alert_conditions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    condition_type = Column(Enum(ECondition), nullable=False)
    comparison_operator = Column(Enum(EComparison), nullable=False)
    threshold_value = Column(Float, nullable=False)

    attentions = relationship("Attention", back_populates="alert_condition")

class Attention(Base):
    __tablename__ = "attention"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type_id = Column(Integer, ForeignKey("alert_conditions.id"))
    ticker = Column(String(10), nullable=False)
    time = Column(DateTime, nullable=False)

    alert_condition = relationship("AlertConditions", back_populates="attentions")

