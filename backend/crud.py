from sqlalchemy.orm import Session
import models
import schemas
import auth

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, name=user.name, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_workout_session(db: Session, workout: schemas.WorkoutSessionCreate):
    db_workout = models.WorkoutSession(
        exercise_name=workout.exercise_name,
        reps=workout.reps,
        pose_accuracy=workout.pose_accuracy,
        duration_seconds=workout.duration_seconds,
    )
    db.add(db_workout)
    db.commit()
    db.refresh(db_workout)
    return db_workout

def get_recent_workout_sessions(db: Session, limit: int = 50):
    return (
        db.query(models.WorkoutSession)
        .order_by(models.WorkoutSession.created_at.desc())
        .limit(limit)
        .all()
    )
