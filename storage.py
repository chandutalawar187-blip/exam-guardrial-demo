import time
import os
from pymongo import MongoClient
from datetime import datetime

# MongoDB connection
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["exam_guardrail"]
sessions_collection = db["sessions"]
events_collection = db["events"]

# In-memory tracking for duplicate detection
last_event_time = {}

def create_session(session_id: str, student_name: str = "", student_email: str = "", exam_title: str = ""):
    """Create a new exam session"""
    session_doc = {
        "_id": session_id,
        "score": 100,
        "status": "active",
        "studentName": student_name,
        "studentEmail": student_email,
        "examTitle": exam_title,
        "startTime": datetime.utcnow().isoformat(),
        "endTime": None,
        "riskScore": 0,
        "violations": []
    }
    sessions_collection.insert_one(session_doc)

def add_event(session_id: str, event: dict):
    """Add an event to the session"""
    event_doc = {
        "sessionId": session_id,
        "eventType": event.get("event_type"),
        "severity": event.get("severity"),
        "timestamp": event.get("timestamp"),
        "description": event.get("description", "")
    }
    events_collection.insert_one(event_doc)
    
    # Also add to violations in session
    try:
        sessions_collection.update_one(
            {"_id": session_id},
            {"$push": {"violations": event_doc}}
        )
    except:
        pass

def update_score(session_id: str, delta: int):
    """Update the session score"""
    try:
        session = sessions_collection.find_one({"_id": session_id})
        if session:
            new_score = session.get("score", 100) + delta
            if new_score < 0:
                new_score = 0
            sessions_collection.update_one(
                {"_id": session_id},
                {"$set": {"score": new_score, "riskScore": 100 - new_score}}
            )
    except:
        pass

def get_score(session_id: str) -> int:
    """Get the current score of a session"""
    try:
        session = sessions_collection.find_one({"_id": session_id})
        if session:
            return session.get("score", 100)
    except:
        pass
    return 100

def get_events(session_id: str) -> list:
    """Get all events for a session"""
    try:
        events = list(events_collection.find({"sessionId": session_id}))
        # Convert ObjectId to string for JSON serialization
        for event in events:
            if "_id" in event:
                event["_id"] = str(event["_id"])
        return events
    except:
        return []

def get_session(session_id: str) -> dict:
    """Get a session document"""
    try:
        session = sessions_collection.find_one({"_id": session_id})
        if session:
            return session
    except:
        pass
    return None

def get_all_sessions() -> list:
    """Get all sessions"""
    try:
        sessions = list(sessions_collection.find())
        for session in sessions:
            if "_id" in session:
                session["id"] = session["_id"]
        return sessions
    except:
        return []

def update_session_status(session_id: str, status: str):
    """Update session status"""
    try:
        sessions_collection.update_one(
            {"_id": session_id},
            {"$set": {"status": status, "endTime": datetime.utcnow().isoformat()}}
        )
    except:
        pass

def is_duplicate(session_id: str, event_type: str) -> bool:
    """Check if event is duplicate within 5 seconds"""
    key = session_id + event_type
    now = time.time()

    if key in last_event_time:
        if now - last_event_time[key] < 5:
            return True

    last_event_time[key] = now
    return False