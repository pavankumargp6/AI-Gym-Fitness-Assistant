import os
import random
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Motivational replies for fallback mode
POSITIVE_REPLIES = [
    "That's the spirit! Keep pushing forward, you're doing amazing! 🔥",
    "Love the energy! Let's channel that into a killer workout today! 💪",
    "You're on fire! Consistency like yours builds champions! 🏆",
]
NEUTRAL_REPLIES = [
    "Hey, every day is a chance to get better. Want to plan a quick workout? 🎯",
    "Consistency is key! Even a light session today keeps the momentum going. 🚀",
    "You're here, and that's what matters. Let's make today count! 💫",
]
NEGATIVE_REPLIES = [
    "I hear you. It's okay to have off days. Even a 10-minute walk can boost your mood! 🌟",
    "Don't be too hard on yourself. Rest is part of the journey too. Tomorrow is a fresh start! 💛",
    "Hey, we all have tough days. How about some light stretching? It works wonders for the mind! 🧘",
]

def _simple_sentiment(text: str) -> str:
    """Simple keyword-based sentiment analysis."""
    text_lower = text.lower()
    negative_words = ["tired", "exhausted", "skip", "lazy", "bad", "awful", "hate", "don't want", "can't", "sad", "depressed", "sore", "pain", "quit", "give up", "no motivation"]
    positive_words = ["great", "amazing", "love", "excited", "pumped", "ready", "good", "happy", "strong", "motivated", "let's go", "awesome", "fantastic", "energized"]
    
    neg_count = sum(1 for w in negative_words if w in text_lower)
    pos_count = sum(1 for w in positive_words if w in text_lower)
    
    if neg_count > pos_count:
        return "Negative"
    elif pos_count > neg_count:
        return "Positive"
    return "Neutral"

async def analyze_sentiment_and_reply(user_message: str, chat_history: list) -> dict:
    """
    Acts as the Virtual Gym Buddy.
    Tries OpenAI first, falls back to simple keyword-based sentiment analysis.
    """
    if OPENAI_API_KEY and OPENAI_API_KEY != "paste_your_key_here":
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=OPENAI_API_KEY)
            messages = [
                {"role": "system", "content": "You are a motivational Virtual Gym Buddy. Analyze the user's emotional state (Positive, Neutral, Negative) and respond with an encouraging message. Keep your response short and friendly. Format your response exactly like this: 'SENTIMENT: [Positive/Neutral/Negative] | MESSAGE: [Your message]'"}
            ]
            for msg in chat_history[-5:]:
                messages.append({"role": msg["role"], "content": msg["content"]})
            messages.append({"role": "user", "content": user_message})
            
            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.7,
            )
            raw_text = response.choices[0].message.content
            try:
                parts = raw_text.split("|")
                sentiment = parts[0].replace("SENTIMENT:", "").strip()
                message = parts[1].replace("MESSAGE:", "").strip()
            except Exception:
                sentiment = "Neutral"
                message = raw_text
            return {"sentiment": sentiment, "reply": message}
        except Exception as e:
            print(f"OpenAI error (chat): {e}")
    
    # Fallback: simple keyword-based sentiment analysis
    sentiment = _simple_sentiment(user_message)
    if sentiment == "Positive":
        reply = random.choice(POSITIVE_REPLIES)
    elif sentiment == "Negative":
        reply = random.choice(NEGATIVE_REPLIES)
    else:
        reply = random.choice(NEUTRAL_REPLIES)
    
    return {"sentiment": sentiment, "reply": reply}

def predict_skip(days_since_last_workout: int, sentiment: str) -> dict:
    """
    Simple behavioral AI model.
    Predicts if the user will skip a workout based on recent activity and sentiment.
    """
    skip_probability = 0.1

    if days_since_last_workout > 2:
        skip_probability += 0.4
    if days_since_last_workout > 5:
        skip_probability += 0.3

    if sentiment.lower() == "negative":
        skip_probability += 0.2
    elif sentiment.lower() == "positive":
        skip_probability -= 0.1

    skip_probability = min(max(skip_probability, 0.0), 1.0)

    nudge = None
    if skip_probability > 0.6:
        nudge = "You've been away for a bit and seem a bit down. Just a 10-minute walk today can make a huge difference! 💪"
    elif skip_probability > 0.4:
        nudge = "Don't break your momentum! Time for a quick workout."

    return {
        "skip_probability": skip_probability,
        "nudge": nudge
    }
