from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)
    bmi = Column(Float, nullable=True)
    weight_goal = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
