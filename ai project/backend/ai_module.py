import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Try to use OpenAI, fallback to mock responses if unavailable or quota exceeded
async def generate_diet_plan(bmi: float, weight_goal: str, preferences: str) -> str:
    if OPENAI_API_KEY and OPENAI_API_KEY != "paste_your_key_here":
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=OPENAI_API_KEY)
            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful, professional AI dietician."},
                    {"role": "user", "content": f"BMI: {bmi}, Goal: {weight_goal}, Preferences: {preferences}. Provide a concise 1-day diet plan and grocery list."}
                ],
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI error (diet): {e}")
    
    # Fallback: generate a structured mock diet plan
    return f"""🥗 **AI-Generated 1-Day Diet Plan**
━━━━━━━━━━━━━━━━━━━━━━━━━
**Your Profile:** BMI {bmi} | Goal: {weight_goal} | Preferences: {preferences}

**🌅 Breakfast (7:00 AM)**
- Oatmeal with fresh berries and a drizzle of honey
- 2 boiled eggs
- Green tea or black coffee

**🌞 Mid-Morning Snack (10:00 AM)**
- Greek yogurt with mixed nuts (almonds, walnuts)
- 1 banana

**🍽️ Lunch (1:00 PM)**
- Grilled chicken breast (150g) with quinoa
- Mixed salad (spinach, cucumber, tomatoes, olive oil dressing)
- 1 whole wheat roti

**🌤️ Evening Snack (4:00 PM)**
- Protein smoothie (banana, peanut butter, milk)
- Handful of roasted chickpeas

**🌙 Dinner (7:30 PM)**
- Baked salmon (120g) with steamed broccoli
- Brown rice (1 cup)
- Cucumber raita

**📝 Grocery List:**
Oats, berries, eggs, Greek yogurt, nuts, bananas, chicken breast, quinoa, spinach, salmon, broccoli, brown rice, whole wheat roti, peanut butter, chickpeas
"""
