from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    bmi: Optional[float] = None
    weight_goal: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class WorkoutSessionCreate(BaseModel):
    exercise_name: str = "Bicep Curl"
    reps: int
    pose_accuracy: float
    duration_seconds: int

class WorkoutSessionResponse(WorkoutSessionCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
