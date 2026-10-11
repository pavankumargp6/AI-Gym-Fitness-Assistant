import random

def get_recommendations(goal: str, location: str):
    """
    Simulates a recommendation engine that returns gyms and workout programs
    based on the user's goals and location.
    """
    
    gyms = [
        {"name": "Iron Forge Gym", "type": "Bodybuilding & Powerlifting", "rating": 4.8, "distance": "1.2 km", "features": ["Heavy Weights", "Squat Racks"]},
        {"name": "Zenith Wellness Center", "type": "Holistic Health & Yoga", "rating": 4.9, "distance": "3.5 km", "features": ["Yoga Studio", "Sauna", "Smoothie Bar"]},
        {"name": "Velocity Crossfit", "type": "High Intensity Interval Training", "rating": 4.7, "distance": "2.1 km", "features": ["Kettlebells", "Rowing Machines"]},
        {"name": "Anytime Fitness Local", "type": "Commercial Gym", "rating": 4.2, "distance": "0.5 km", "features": ["24/7 Access", "Cardio Machines"]}
    ]
    
    programs = [
        {"title": "Hypertrophy Blueprint", "focus": "Build Muscle", "duration": "12 weeks", "level": "Intermediate"},
        {"title": "Shred & Burn", "focus": "Lose Weight", "duration": "8 weeks", "level": "Beginner"},
        {"title": "Endurance Elite", "focus": "Maintain Weight", "duration": "Continuous", "level": "Advanced"},
        {"title": "Strength Fundamentals", "focus": "Build Muscle", "duration": "4 weeks", "level": "Beginner"}
    ]
    
    # Simple filtering
    filtered_programs = [p for p in programs if p["focus"].lower() == goal.lower()]
    if not filtered_programs:
        filtered_programs = programs[:2] # Fallback
        
    # Shuffle and pick gyms (mocking location-based sorting)
    random.shuffle(gyms)
    recommended_gyms = gyms[:2]
    
    return {
        "gyms": recommended_gyms,
        "programs": filtered_programs
    }
