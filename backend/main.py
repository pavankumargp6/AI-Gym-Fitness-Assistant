from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime, date
import base64

import models, schemas, crud, auth, database

# Create tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="AI Gym & Fitness Assistant API",
    description="Backend API for the AI-powered fitness ecosystem",
    version="1.0.0",
)

# Configure CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws/trainer")
async def websocket_trainer(websocket: WebSocket):
    await websocket.accept()
    counter = 0
    stage = "down"
    try:
        while True:
            data = await websocket.receive_text()
            # The frontend sends a base64 encoded jpeg image.
            # Strip the data url prefix if present.
            if "," in data:
                data = data.split(",")[1]
            image_bytes = base64.b64decode(data)
            
            # Process frame using CV module (lazy import to avoid blocking startup)
            import cv_module
            result = cv_module.process_frame(image_bytes, stage, counter)
            
            # Update state
            counter = result["counter"]
            stage = result["stage"]
            
            # Send result back
            await websocket.send_json(result)
            
    except WebSocketDisconnect:
        print("Client disconnected from trainer")
    except Exception as e:
        print(f"Error in trainer websocket: {e}")
        try:
            await websocket.send_json({"error": str(e)})
        except:
            pass

@app.post("/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

from pydantic import BaseModel
from typing import List, Dict
import ai_module
import habit_tracker

class DietRequest(BaseModel):
    bmi: float
    weight_goal: str
    preferences: str

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

class HabitRequest(BaseModel):
    days_since_last_workout: int
    current_sentiment: str

@app.post("/api/diet")
async def get_diet_plan(request: DietRequest):
    try:
        plan = await ai_module.generate_diet_plan(request.bmi, request.weight_goal, request.preferences)
        return {"plan": plan}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat_with_buddy(request: ChatRequest):
    try:
        response = await habit_tracker.analyze_sentiment_and_reply(request.message, request.history)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/habit/predict")
def predict_habit(request: HabitRequest):
    try:
        prediction = habit_tracker.predict_skip(request.days_since_last_workout, request.current_sentiment)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/workouts", response_model=schemas.WorkoutSessionResponse)
def save_workout_session(workout: schemas.WorkoutSessionCreate, db: Session = Depends(database.get_db)):
    if workout.reps < 0:
        raise HTTPException(status_code=400, detail="Reps cannot be negative")
    if workout.pose_accuracy < 0 or workout.pose_accuracy > 100:
        raise HTTPException(status_code=400, detail="Pose accuracy must be between 0 and 100")
    if workout.duration_seconds < 0:
        raise HTTPException(status_code=400, detail="Duration cannot be negative")
    return crud.create_workout_session(db, workout)

import asyncio
import random
import recommendation_engine

class RecommendRequest(BaseModel):
    goal: str
    location: str

@app.post("/api/recommend")
def get_recommendations(request: RecommendRequest):
    try:
        return recommendation_engine.get_recommendations(request.goal, request.location)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/iot")
async def websocket_iot(websocket: WebSocket):
    await websocket.accept()
    # Mock IoT Device Simulation
    heart_rate = 75
    resistance = 5
    rpm = 60
    try:
        while True:
            # Simulate slight fluctuations in sensor data
            heart_rate += random.randint(-2, 3)
            resistance += random.randint(-1, 1)
            rpm += random.randint(-5, 5)
            
            # Keep within logical bounds
            heart_rate = max(60, min(180, heart_rate))
            resistance = max(1, min(20, resistance))
            rpm = max(30, min(120, rpm))
            
            data = {
                "heart_rate": heart_rate,
                "resistance_level": resistance,
                "rpm": rpm,
                "calories_burned_per_min": round((heart_rate * 0.1) + (resistance * 0.5), 1),
                "machine_status": "Optimal"
            }
            
            await websocket.send_json(data)
            await asyncio.sleep(1) # Send data every second
            
    except WebSocketDisconnect:
        print("Client disconnected from IoT simulator")

@app.get("/api/performance")
def get_performance_data(db: Session = Depends(database.get_db)):
    """
    Calculates performance from real workout sessions saved by the trainer.
    If the database has no workouts yet, the frontend receives an empty state.
    """
    sessions = crud.get_recent_workout_sessions(db, limit=200)

    if not sessions:
        return {
            "has_data": False,
            "global_score": 0,
            "metrics": {
                "pose_accuracy": 0,
                "consistency": 0,
                "total_reps": 0,
                "total_sessions": 0,
                "avg_reps_per_session": 0,
                "avg_duration_minutes": 0,
            },
            "history": [],
        }

    today = date.today()
    last_7_days = [today - timedelta(days=offset) for offset in range(6, -1, -1)]
    sessions_by_day = {day: [] for day in last_7_days}

    for session in sessions:
        session_day = session.created_at.date()
        if session_day in sessions_by_day:
            sessions_by_day[session_day].append(session)

    history = []
    active_days = 0
    for day, day_sessions in sessions_by_day.items():
        if day_sessions:
            active_days += 1
            avg_pose = sum(s.pose_accuracy for s in day_sessions) / len(day_sessions)
            total_reps = sum(s.reps for s in day_sessions)
        else:
            avg_pose = 0
            total_reps = 0

        history.append({
            "day": day.strftime("%a"),
            "pose_accuracy": round(avg_pose, 1),
            "reps": total_reps,
            "sessions": len(day_sessions),
        })

    avg_pose_all = sum(s.pose_accuracy for s in sessions) / len(sessions)
    total_reps_all = sum(s.reps for s in sessions)
    total_duration_all = sum(s.duration_seconds for s in sessions)
    consistency = (active_days / 7) * 100
    global_score = (avg_pose_all * 0.6) + (consistency * 0.4)

    return {
        "has_data": True,
        "global_score": round(global_score, 1),
        "metrics": {
            "pose_accuracy": round(avg_pose_all, 1),
            "consistency": round(consistency, 1),
            "total_reps": total_reps_all,
            "total_sessions": len(sessions),
            "avg_reps_per_session": round(total_reps_all / len(sessions), 1),
            "avg_duration_minutes": round((total_duration_all / len(sessions)) / 60, 1),
        },
        "history": history,
    }

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Gym & Fitness Assistant API!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
