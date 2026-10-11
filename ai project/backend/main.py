from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
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
def get_performance_data():
    """
    Calculates the Global Performance Score based on mocked historical data
    from the CV module, Diet module, and Habit tracker.
    """
    # Mock data simulating a week of progress
    history = [
        {"day": "Mon", "pose_accuracy": 85, "diet_adherence": 90, "consistency": 100},
        {"day": "Tue", "pose_accuracy": 88, "diet_adherence": 85, "consistency": 100},
        {"day": "Wed", "pose_accuracy": 82, "diet_adherence": 80, "consistency": 50},
        {"day": "Thu", "pose_accuracy": 91, "diet_adherence": 95, "consistency": 100},
        {"day": "Fri", "pose_accuracy": 89, "diet_adherence": 90, "consistency": 100},
        {"day": "Sat", "pose_accuracy": 94, "diet_adherence": 85, "consistency": 100},
        {"day": "Sun", "pose_accuracy": 95, "diet_adherence": 90, "consistency": 100},
    ]
    
    # Calculate global score
    avg_pose = sum(d["pose_accuracy"] for d in history) / len(history)
    avg_diet = sum(d["diet_adherence"] for d in history) / len(history)
    avg_consistency = sum(d["consistency"] for d in history) / len(history)
    
    global_score = (avg_pose * 0.4) + (avg_diet * 0.3) + (avg_consistency * 0.3)
    
    return {
        "global_score": round(global_score, 1),
        "metrics": {
            "pose_accuracy": round(avg_pose, 1),
            "diet_adherence": round(avg_diet, 1),
            "consistency": round(avg_consistency, 1)
        },
        "history": history
    }

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Gym & Fitness Assistant API!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
