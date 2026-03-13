import time
import os
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from dotenv import load_dotenv


def sanitize_doc(doc):
    """Recursively convert ObjectId to str so FastAPI can serialize."""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [sanitize_doc(item) for item in doc]
    if isinstance(doc, dict):
        return {k: sanitize_doc(v) for k, v in doc.items()}
    if isinstance(doc, ObjectId):
        return str(doc)
    return doc

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.backend"))

# MongoDB connection
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=30000, connectTimeoutMS=30000)
db = client["exam_guardrail"]

# ── Collections ──────────────────────────────────────────
sessions_collection = db["sessions"]
events_collection = db["events"]
users_collection = db["users"]
tokens_collection = db["tokens"]
papers_collection = db["question_papers"]
exam_sessions_collection = db["exam_sessions"]
submissions_collection = db["submissions"]

# In-memory tracking for duplicate detection
last_event_time = {}


# ══════════════════════════════════════════════════════════
# MONITORING SESSIONS (existing)
# ══════════════════════════════════════════════════════════

def create_session(session_id: str, student_name: str = "", student_email: str = "", exam_title: str = ""):
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
        "violations": [],
    }
    sessions_collection.insert_one(session_doc)


def add_event(session_id: str, event: dict):
    event_doc = {
        "sessionId": session_id,
        "eventType": event.get("event_type"),
        "severity": event.get("severity"),
        "timestamp": event.get("timestamp"),
        "description": event.get("description", ""),
    }
    events_collection.insert_one(event_doc)
    try:
        sessions_collection.update_one(
            {"_id": session_id}, {"$push": {"violations": event_doc}}
        )
    except:
        pass


def update_score(session_id: str, delta: int):
    try:
        session = sessions_collection.find_one({"_id": session_id})
        if session:
            new_score = session.get("score", 100) + delta
            if new_score < 0:
                new_score = 0
            sessions_collection.update_one(
                {"_id": session_id},
                {"$set": {"score": new_score, "riskScore": 100 - new_score}},
            )
    except:
        pass


def get_score(session_id: str) -> int:
    try:
        session = sessions_collection.find_one({"_id": session_id})
        if session:
            return session.get("score", 100)
    except:
        pass
    return 100


def get_events(session_id: str) -> list:
    try:
        return sanitize_doc(list(events_collection.find({"sessionId": session_id})))
    except:
        return []


def get_session(session_id: str) -> dict:
    try:
        session = sessions_collection.find_one({"_id": session_id})
        if session:
            return sanitize_doc(session)
    except:
        pass
    return None


def get_all_sessions() -> list:
    try:
        sessions = sanitize_doc(list(sessions_collection.find()))
        for s in sessions:
            s["id"] = s.get("_id", "")
        return sessions
    except:
        return []


def update_session_status(session_id: str, status: str):
    try:
        sessions_collection.update_one(
            {"_id": session_id},
            {"$set": {"status": status, "endTime": datetime.utcnow().isoformat()}},
        )
    except:
        pass


def is_duplicate(session_id: str, event_type: str) -> bool:
    key = session_id + event_type
    now = time.time()
    if key in last_event_time:
        if now - last_event_time[key] < 5:
            return True
    last_event_time[key] = now
    return False


# ══════════════════════════════════════════════════════════
# USERS & AUTH
# ══════════════════════════════════════════════════════════

def create_user(user_doc: dict):
    users_collection.replace_one(
        {"_id": user_doc["_id"]},
        user_doc,
        upsert=True,
    )


def get_user_by_username(username: str) -> dict:
    try:
        return sanitize_doc(users_collection.find_one({"username": username}))
    except:
        return None


def save_token(token: str, user_id: str, role: str):
    tokens_collection.update_one(
        {"_id": token},
        {"$set": {"_id": token, "user_id": user_id, "role": role, "created_at": datetime.utcnow().isoformat()}},
        upsert=True,
    )


def get_token(token: str) -> dict:
    try:
        return sanitize_doc(tokens_collection.find_one({"_id": token}))
    except:
        return None


# ══════════════════════════════════════════════════════════
# QUESTION PAPERS
# ══════════════════════════════════════════════════════════

def create_question_paper(doc: dict):
    papers_collection.insert_one(doc)


def get_all_question_papers() -> list:
    try:
        papers = sanitize_doc(list(papers_collection.find()))
        for p in papers:
            p["id"] = p.get("_id", "")
        return papers
    except:
        return []


def get_question_paper(paper_id: str) -> dict:
    try:
        paper = sanitize_doc(papers_collection.find_one({"_id": paper_id}))
        if paper:
            paper["id"] = paper.get("_id", "")
        return paper
    except:
        return None


def get_paper_by_subject_code(subject_code: str) -> dict:
    try:
        paper = sanitize_doc(papers_collection.find_one({"subject_code": subject_code}))
        if paper:
            paper["id"] = paper.get("_id", "")
        return paper
    except:
        return None


def update_question_paper(paper_id: str, update_data: dict):
    papers_collection.update_one({"_id": paper_id}, {"$set": update_data})


def delete_question_paper(paper_id: str):
    papers_collection.delete_one({"_id": paper_id})


# ══════════════════════════════════════════════════════════
# EXAM SESSIONS
# ══════════════════════════════════════════════════════════

def create_exam_session(doc: dict):
    exam_sessions_collection.insert_one(doc)


def get_all_exam_sessions() -> list:
    try:
        sessions = sanitize_doc(list(exam_sessions_collection.find()))
        for s in sessions:
            s["id"] = s.get("_id", "")
            s["session_id"] = s.get("_id", "")
        return sessions
    except:
        return []


def get_exam_session(session_id: str) -> dict:
    try:
        session = sanitize_doc(exam_sessions_collection.find_one({"_id": session_id}))
        if session:
            session["id"] = session.get("_id", "")
            session["session_id"] = session.get("_id", "")
        return session
    except:
        return None


def update_exam_session(session_id: str, update_data: dict):
    exam_sessions_collection.update_one({"_id": session_id}, {"$set": update_data})


# ══════════════════════════════════════════════════════════
# SUBMISSIONS
# ══════════════════════════════════════════════════════════

def save_submission(doc: dict):
    submissions_collection.insert_one(doc)


def get_submission(session_id: str, student_name: str) -> dict:
    try:
        return sanitize_doc(submissions_collection.find_one({"session_id": session_id, "student_name": student_name}))
    except:
        return None


def get_session_submissions(session_id: str) -> list:
    try:
        return sanitize_doc(list(submissions_collection.find({"session_id": session_id})))
    except:
        return []


def get_all_submissions() -> list:
    try:
        return sanitize_doc(list(submissions_collection.find()))
    except:
        return []


# ══════════════════════════════════════════════════════════
# SEED DEFAULT ADMIN
# ══════════════════════════════════════════════════════════

def seed_default_admin():
    """Create or update default admin user"""
    try:
        create_user({
            "_id": "admin",
            "username": "admin",
            "password": "admin123",
            "name": "Administrator",
            "role": "admin",
        })
        print("✅ Default admin ready (admin/admin123)")
    except Exception as e:
        print(f"⚠️ Could not seed admin (MongoDB may be slow): {e}")
