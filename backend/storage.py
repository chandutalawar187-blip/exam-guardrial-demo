import time
import os
import json
from datetime import datetime
from dotenv import load_dotenv

# Import Supabase client
try:
    from supabase import create_client, Client
except ImportError:
    raise ImportError("supabase package not installed. Run: pip install supabase")

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.backend"))

# ══════════════════════════════════════════════════════════
# SUPABASE INITIALIZATION
# ══════════════════════════════════════════════════════════

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(
        "Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_KEY in .env.backend\n"
        "Get these from your Supabase project at https://supabase.com/dashboard"
    )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# In-memory tracking for duplicate detection
last_event_time = {}


# ══════════════════════════════════════════════════════════
# MONITORING SESSIONS
# ══════════════════════════════════════════════════════════

def create_session(session_id: str, student_name: str = "", student_email: str = "", exam_title: str = ""):
    """Create a new monitoring session"""
    session_doc = {
        "id": session_id,
        "score": 100,
        "status": "active",
        "student_name": student_name,
        "student_email": student_email,
        "exam_title": exam_title,
        "start_time": datetime.utcnow().isoformat(),
        "end_time": None,
        "risk_score": 0,
        "violations": [],
    }
    try:
        supabase.table("sessions").insert(session_doc).execute()
    except Exception as e:
        print(f"Error creating session: {e}")


def add_event(session_id: str, event: dict):
    """Add an event to a session"""
    event_doc = {
        "session_id": session_id,
        "event_type": event.get("event_type"),
        "severity": event.get("severity"),
        "timestamp": event.get("timestamp"),
        "description": event.get("description", ""),
    }
    try:
        # Add event to events table
        supabase.table("events").insert(event_doc).execute()
        
        # Also add to violations array in sessions table
        session = supabase.table("sessions").select("violations").eq("id", session_id).execute()
        if session.data:
            violations = session.data[0].get("violations", []) or []
            violations.append(event_doc)
            supabase.table("sessions").update({"violations": violations}).eq("id", session_id).execute()
    except Exception as e:
        print(f"Error adding event: {e}")


def update_score(session_id: str, delta: int):
    """Update session score and risk score"""
    try:
        session = supabase.table("sessions").select("score").eq("id", session_id).execute()
        if session.data:
            new_score = session.data[0].get("score", 100) + delta
            if new_score < 0:
                new_score = 0
            risk_score = 100 - new_score
            supabase.table("sessions").update({
                "score": new_score,
                "risk_score": risk_score,
            }).eq("id", session_id).execute()
    except Exception as e:
        print(f"Error updating score: {e}")


def get_score(session_id: str) -> int:
    """Get session score"""
    try:
        session = supabase.table("sessions").select("score").eq("id", session_id).execute()
        if session.data:
            return session.data[0].get("score", 100)
    except Exception as e:
        print(f"Error getting score: {e}")
    return 100


def get_events(session_id: str) -> list:
    """Get all events for a session"""
    try:
        events = supabase.table("events").select("*").eq("session_id", session_id).execute()
        return events.data if events.data else []
    except Exception as e:
        print(f"Error getting events: {e}")
        return []


def get_session(session_id: str) -> dict:
    """Get a single session"""
    try:
        session = supabase.table("sessions").select("*").eq("id", session_id).execute()
        if session.data:
            s = session.data[0]
            s["_id"] = s.get("id")  # For backward compatibility
            return s
    except Exception as e:
        print(f"Error getting session: {e}")
    return None


def get_all_sessions() -> list:
    """Get all sessions"""
    try:
        sessions = supabase.table("sessions").select("*").execute()
        result = []
        if sessions.data:
            for s in sessions.data:
                s["_id"] = s.get("id")  # For backward compatibility
                result.append(s)
        return result
    except Exception as e:
        print(f"Error getting all sessions: {e}")
        return []


def update_session_status(session_id: str, status: str):
    """Update session status and end time"""
    try:
        supabase.table("sessions").update({
            "status": status,
            "end_time": datetime.utcnow().isoformat(),
        }).eq("id", session_id).execute()
    except Exception as e:
        print(f"Error updating session status: {e}")


def is_duplicate(session_id: str, event_type: str) -> bool:
    """Check if event is a duplicate (within 5 seconds)"""
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
    """Create or update a user"""
    try:
        # Check if user exists
        existing = supabase.table("users").select("id").eq("id", user_doc["id"]).execute()
        if existing.data:
            # Update existing user
            supabase.table("users").update(user_doc).eq("id", user_doc["id"]).execute()
        else:
            # Insert new user
            supabase.table("users").insert(user_doc).execute()
    except Exception as e:
        print(f"Error creating user: {e}")


def get_user_by_username(username: str) -> dict:
    """Get user by username"""
    try:
        user = supabase.table("users").select("*").eq("username", username).execute()
        if user.data:
            u = user.data[0]
            u["_id"] = u.get("id")  # For backward compatibility
            return u
    except Exception as e:
        print(f"Error getting user: {e}")
    return None


def save_token(token: str, user_id: str, role: str):
    """Save or update an auth token"""
    try:
        token_doc = {
            "id": token,
            "user_id": user_id,
            "role": role,
            "created_at": datetime.utcnow().isoformat(),
        }
        # Check if token exists
        existing = supabase.table("tokens").select("id").eq("id", token).execute()
        if existing.data:
            supabase.table("tokens").update(token_doc).eq("id", token).execute()
        else:
            supabase.table("tokens").insert(token_doc).execute()
    except Exception as e:
        print(f"Error saving token: {e}")


def get_token(token: str) -> dict:
    """Get token info"""
    try:
        token_data = supabase.table("tokens").select("*").eq("id", token).execute()
        if token_data.data:
            t = token_data.data[0]
            t["_id"] = t.get("id")  # For backward compatibility
            return t
    except Exception as e:
        print(f"Error getting token: {e}")
    return None


# ══════════════════════════════════════════════════════════
# QUESTION PAPERS
# ══════════════════════════════════════════════════════════

def create_question_paper(doc: dict):
    """Create a question paper"""
    try:
        # Ensure questions are JSON stored as JSONB
        if "questions" in doc and isinstance(doc["questions"], list):
            doc["questions"] = doc["questions"]  # Supabase will handle JSON encoding
        
        # Map _id to id for consistency
        if "_id" in doc and "id" not in doc:
            doc["id"] = doc.pop("_id")
        
        supabase.table("question_papers").insert(doc).execute()
    except Exception as e:
        print(f"Error creating question paper: {e}")


def get_all_question_papers() -> list:
    """Get all question papers"""
    try:
        papers = supabase.table("question_papers").select("*").execute()
        result = []
        if papers.data:
            for p in papers.data:
                p["_id"] = p.get("id")  # For backward compatibility
                result.append(p)
        return result
    except Exception as e:
        print(f"Error getting question papers: {e}")
        return []


def get_question_paper(paper_id: str) -> dict:
    """Get a single question paper"""
    try:
        paper = supabase.table("question_papers").select("*").eq("id", paper_id).execute()
        if paper.data:
            p = paper.data[0]
            p["_id"] = p.get("id")  # For backward compatibility
            return p
    except Exception as e:
        print(f"Error getting question paper: {e}")
    return None


def get_paper_by_subject_code(subject_code: str) -> dict:
    """Get question paper by subject code"""
    try:
        paper = supabase.table("question_papers").select("*").eq("subject_code", subject_code).execute()
        if paper.data:
            p = paper.data[0]
            p["_id"] = p.get("id")  # For backward compatibility
            return p
    except Exception as e:
        print(f"Error getting paper by subject code: {e}")
    return None


def update_question_paper(paper_id: str, update_data: dict):
    """Update a question paper"""
    try:
        supabase.table("question_papers").update(update_data).eq("id", paper_id).execute()
    except Exception as e:
        print(f"Error updating question paper: {e}")


def delete_question_paper(paper_id: str):
    """Delete a question paper"""
    try:
        supabase.table("question_papers").delete().eq("id", paper_id).execute()
    except Exception as e:
        print(f"Error deleting question paper: {e}")


# ══════════════════════════════════════════════════════════
# EXAM SESSIONS
# ══════════════════════════════════════════════════════════

def create_exam_session(doc: dict):
    """Create an exam session"""
    try:
        # Map _id to id for consistency
        if "_id" in doc and "id" not in doc:
            doc["id"] = doc.pop("_id")
        
        supabase.table("exam_sessions").insert(doc).execute()
    except Exception as e:
        print(f"Error creating exam session: {e}")


def get_all_exam_sessions() -> list:
    """Get all exam sessions"""
    try:
        sessions = supabase.table("exam_sessions").select("*").execute()
        result = []
        if sessions.data:
            for s in sessions.data:
                s["_id"] = s.get("id")  # For backward compatibility
                s["session_id"] = s.get("id")
                result.append(s)
        return result
    except Exception as e:
        print(f"Error getting exam sessions: {e}")
        return []


def get_exam_session(session_id: str) -> dict:
    """Get a single exam session"""
    try:
        session = supabase.table("exam_sessions").select("*").eq("id", session_id).execute()
        if session.data:
            s = session.data[0]
            s["_id"] = s.get("id")  # For backward compatibility
            s["session_id"] = s.get("id")
            return s
    except Exception as e:
        print(f"Error getting exam session: {e}")
    return None


def update_exam_session(session_id: str, update_data: dict):
    """Update an exam session"""
    try:
        supabase.table("exam_sessions").update(update_data).eq("id", session_id).execute()
    except Exception as e:
        print(f"Error updating exam session: {e}")


# ══════════════════════════════════════════════════════════
# SUBMISSIONS
# ══════════════════════════════════════════════════════════

def save_submission(doc: dict):
    """Save a submission"""
    try:
        # Ensure answers and results are JSON
        if "answers" in doc:
            # Keep as dict, Supabase will encode to JSONB
            pass
        if "results" in doc:
            # Keep as dict, Supabase will encode to JSONB
            pass
        
        supabase.table("submissions").insert(doc).execute()
    except Exception as e:
        print(f"Error saving submission: {e}")


def get_submission(session_id: str, student_name: str) -> dict:
    """Get a submission by session and student"""
    try:
        submission = supabase.table("submissions").select("*").eq("session_id", session_id).eq("student_name", student_name).execute()
        if submission.data:
            return submission.data[0]
    except Exception as e:
        print(f"Error getting submission: {e}")
    return None


def get_session_submissions(session_id: str) -> list:
    """Get all submissions for a session"""
    try:
        submissions = supabase.table("submissions").select("*").eq("session_id", session_id).execute()
        return submissions.data if submissions.data else []
    except Exception as e:
        print(f"Error getting session submissions: {e}")
        return []


def get_all_submissions() -> list:
    """Get all submissions"""
    try:
        submissions = supabase.table("submissions").select("*").execute()
        return submissions.data if submissions.data else []
    except Exception as e:
        print(f"Error getting all submissions: {e}")
        return []


# ══════════════════════════════════════════════════════════
# SEED DEFAULT ADMIN
# ══════════════════════════════════════════════════════════

def seed_default_admin():
    """Create or update default admin user"""
    try:
        create_user({
            "id": "admin",
            "username": "admin",
            "password": "admin123",
            "name": "Administrator",
            "role": "admin",
        })
        print("✅ Default admin ready (admin/admin123)")
    except Exception as e:
        print(f"⚠️ Could not seed admin (Supabase may not be connected): {e}")
