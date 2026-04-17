"""
MindMirror Backend - Lightweight Version
FastAPI backend with mock emotion detection for easy deployment.
No heavy ML dependencies (TensorFlow/FER) required.
"""
import time
import random
from typing import Optional
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="MindMirror Backend", version="1.0.0")

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global session state
session_data = {
    "start_time": None,
    "frames_analyzed": 0,
    "voice_samples": 0,
    "detected_emotions": [],
    "current_emotion": "neutral"
}

EMOTIONS = ["happy", "sad", "neutral", "angry", "surprise", "fear", "disgust"]

# Pydantic models
class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = "user_1"

class ChatResponse(BaseModel):
    response: str
    emotion_detected: Optional[str] = None

class SessionStats(BaseModel):
    duration_seconds: int
    frames_analyzed: int
    voice_samples: int
    dominant_emotion: str

# ============ CHAT ENDPOINTS ============

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Process chat messages and return AI response with emotion analysis.
    """
    user_message = request.message.lower()
    
    # Simple keyword-based responses
    responses = {
        "anxious": "I understand you're feeling anxious. Let's try a simple breathing exercise: Breathe in for 4 counts, hold for 4, and exhale for 6. Repeat this 3 times. How does that feel?",
        "anxiety": "Anxiety can be overwhelming. Remember that it's a temporary state. Would you like to try a grounding technique? Name 5 things you can see right now.",
        "sad": "I'm sorry you're feeling sad. It's okay to feel this way. Would you like to talk about what's on your mind? Sometimes sharing helps lighten the burden.",
        "depressed": "Depression is difficult to navigate alone. Please consider reaching out to a mental health professional. In the meantime, be gentle with yourself. Small steps count.",
        "stress": "Stress affects us all. Try taking a 5-minute break, stepping away from your tasks, and doing something that brings you joy - even if it's small.",
        "happy": "That's wonderful! I'm glad you're feeling happy. What's contributing to this positive feeling? Recognizing good moments helps us appreciate them more.",
        "tired": "Rest is important for mental health. Are you getting enough sleep? Sometimes our minds need rest just as much as our bodies.",
        "lonely": "Feeling lonely is hard. Remember that reaching out to someone - a friend, family member, or support group - can make a difference. You're not alone in this."
    }
    
    # Find matching response or use default
    response_text = "I hear you. Tell me more about what you're experiencing so I can better support you."
    detected_emotion = "neutral"
    
    for keyword, resp in responses.items():
        if keyword in user_message:
            response_text = resp
            detected_emotion = keyword
            break
    
    # Update session
    if session_data["start_time"] is None:
        session_data["start_time"] = time.time()
    
    return ChatResponse(
        response=response_text,
        emotion_detected=detected_emotion
    )

@app.get("/api/chat/history")
async def get_chat_history():
    """Get chat history (placeholder for future implementation)."""
    return {"history": [], "message": "Chat history feature coming soon"}

# ============ EMOTION DETECTION ENDPOINTS ============

@app.post("/api/emotion/analyze_frame")
async def analyze_frame(frame_data: dict):
    """
    Simulate emotion analysis from a frame.
    In production, this uses FER library.
    """
    # Simulate processing
    session_data["frames_analyzed"] += 1
    
    # Random emotion for demo (in production, use actual ML model)
    emotion = random.choice(EMOTIONS)
    confidence = round(random.uniform(0.6, 0.95), 3)
    
    session_data["detected_emotions"].append(emotion)
    session_data["current_emotion"] = emotion
    
    return JSONResponse(content={
        "faces_detected": 1,
        "results": [{
            "dominant_emotion": emotion,
            "confidence": confidence,
            "all_emotions": {e: round(random.uniform(0.0, 0.3), 3) for e in EMOTIONS},
            "box": [100, 100, 200, 200]
        }],
        "timestamp": time.time()
    })

@app.get("/api/emotion/stats", response_model=SessionStats)
async def get_emotion_stats():
    """Get current session emotion statistics."""
    if session_data["start_time"] is None:
        duration = 0
    else:
        duration = int(time.time() - session_data["start_time"])
    
    # Calculate dominant emotion
    if session_data["detected_emotions"]:
        dominant = max(set(session_data["detected_emotions"]), 
                      key=session_data["detected_emotions"].count)
    else:
        dominant = "neutral"
    
    return SessionStats(
        duration_seconds=duration,
        frames_analyzed=session_data["frames_analyzed"],
        voice_samples=session_data["voice_samples"],
        dominant_emotion=dominant
    )

@app.post("/api/emotion/reset")
async def reset_session():
    """Reset the session data."""
    session_data.update({
        "start_time": time.time(),
        "frames_analyzed": 0,
        "voice_samples": 0,
        "detected_emotions": [],
        "current_emotion": "neutral"
    })
    return {"message": "Session reset successfully"}

# ============ VOICE ANALYSIS ENDPOINTS ============

@app.post("/api/voice/analyze")
async def analyze_voice(audio_data: dict):
    """
    Analyze voice for emotional tone (placeholder for future implementation).
    """
    session_data["voice_samples"] += 1
    
    return {
        "tone": random.choice(["calm", "excited", "neutral", "sad"]),
        "confidence": round(random.uniform(0.6, 0.9), 2),
        "sentiment": random.choice(["positive", "neutral", "negative"]),
        "message": "Voice analysis demo mode"
    }

# ============ HEALTH CHECK ============

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "mindmirror-backend",
        "version": "1.0.0-dev",
        "mode": "development (no ML)",
        "features": ["chat", "emotion_detection_mock", "voice_analysis_mock"]
    }

@app.get("/")
async def root():
    """Root endpoint with API documentation."""
    return {
        "message": "MindMirror Backend API (Dev Mode)",
        "note": "This is a lightweight dev version without heavy ML dependencies",
        "install_full": "pip install fer mtcnn tensorflow",
        "endpoints": {
            "chat": "/api/chat (POST)",
            "emotion_analyze": "/api/emotion/analyze_frame (POST)",
            "emotion_stats": "/api/emotion/stats (GET)",
            "voice_analyze": "/api/voice/analyze (POST)",
            "health": "/api/health (GET)"
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("MindMirror Backend (Development Mode)")
    print("=" * 50)
    print("API: http://localhost:8000")
    print("Chat: POST http://localhost:8000/api/chat")
    print("Stats: GET http://localhost:8000/api/emotion/stats")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=8000)
