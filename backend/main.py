from datetime import datetime
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .models import Event
from . import storage
from . import scoring

# Import new routers
from .auth import router as auth_router
from .exam_routes import router as exam_router

app = FastAPI(title="Exam Guardrail Platform", version="2.0")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Must be False when using allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include new routers
app.include_router(auth_router)
app.include_router(exam_router)


# Global exception handler to ensure CORS headers on errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)[:200]}"},
    )


# ── Startup ──────────────────────────────────────────────
@app.on_event("startup")
def startup():
    storage.seed_default_admin()


# ══════════════════════════════════════════════════════════
# EXISTING MONITORING ENDPOINTS (unchanged)
# ══════════════════════════════════════════════════════════

@app.get("/")
def root():
    return {"system": "Exam Guardrail Platform v2.0 Running"}


@app.get("/sessions")
def get_all_sessions():
    """Get all monitoring sessions with their events"""
    try:
        sessions = storage.get_all_sessions()
        # Transform and embed events into each session
        transformed_sessions = []
        for session in sessions:
            sid = session.get("_id") or session.get("id", "")
            events = storage.get_events(sid)
            
            # Transform snake_case to camelCase for frontend compatibility
            transformed = {
                "id": session.get("id") or session.get("_id"),
                "_id": session.get("id") or session.get("_id"),
                "score": session.get("score", 100),
                "status": session.get("status", "active"),
                "studentName": session.get("student_name", ""),
                "studentEmail": session.get("student_email", ""),
                "examTitle": session.get("exam_title", ""),
                "startTime": session.get("start_time", ""),
                "endTime": session.get("end_time"),
                "riskScore": session.get("risk_score", 0),
                "events": events,
            }
            
            # Map events to violations format for frontend compatibility
            violations = []
            for i, ev in enumerate(events):
                violations.append({
                    "id": f"{sid}-{i}",
                    "type": ev.get("event_type", "").lower(),
                    "event_type": ev.get("event_type", ""),
                    "severity": (ev.get("severity", "low")).lower(),
                    "description": ev.get("description", ""),
                    "timestamp": ev.get("timestamp", ""),
                    "metadata": ev.get("metadata"),
                })
            transformed["violations"] = violations
            transformed_sessions.append(transformed)
        
        return {"sessions": transformed_sessions}
    except Exception as e:
        print(f"Error in get_all_sessions: {e}")
        return {"sessions": []}


@app.get("/session/{session_id}")
def get_session(session_id: str):
    """Get a specific monitoring session"""
    session = storage.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get events for this session
    events = storage.get_events(session_id)
    
    # Transform snake_case to camelCase
    transformed = {
        "id": session.get("id") or session.get("_id"),
        "_id": session.get("id") or session.get("_id"),
        "score": session.get("score", 100),
        "status": session.get("status", "active"),
        "studentName": session.get("student_name", ""),
        "studentEmail": session.get("student_email", ""),
        "examTitle": session.get("exam_title", ""),
        "startTime": session.get("start_time", ""),
        "endTime": session.get("end_time"),
        "riskScore": session.get("risk_score", 0),
        "events": events,
    }
    
    # Map events to violations format
    violations = []
    for i, ev in enumerate(events):
        violations.append({
            "id": f"{session_id}-{i}",
            "type": ev.get("event_type", "").lower(),
            "event_type": ev.get("event_type", ""),
            "severity": (ev.get("severity", "low")).lower(),
            "description": ev.get("description", ""),
            "timestamp": ev.get("timestamp", ""),
            "metadata": ev.get("metadata"),
        })
    transformed["violations"] = violations
    
    return transformed


@app.post("/session/{session_id}")
def start_session(session_id: str, student_name: str = "", student_email: str = "", exam_title: str = ""):
    """Create a new monitoring session"""
    try:
        storage.create_session(session_id, student_name, student_email, exam_title)
        return {"message": "session started", "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/events")
def receive_event(event: Event):
    """Process a cheating detection event"""
    try:
        delta = scoring.get_score_delta(event.event_type)
        # Convert event to dict and ensure datetime is JSON serializable
        event_data = event.dict()
        if isinstance(event_data.get("timestamp"), datetime):
            event_data["timestamp"] = event_data["timestamp"].isoformat()
        
        storage.add_event(event.session_id, event_data)
        storage.update_score(event.session_id, delta)

        if storage.is_duplicate(event.session_id, event.event_type):
            return {"status": "ignored"}

        return {"status": "event processed", "score_delta": delta}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/report/{session_id}")
def credibility_report(session_id: str):
    """Get credibility report for a monitoring session"""
    session = storage.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    events = storage.get_events(session_id)
    score = storage.get_score(session_id)

    if score >= 90:
        verdict = "CLEAR"
    elif score >= 70:
        verdict = "UNDER REVIEW"
    elif score >= 50:
        verdict = "SUSPICIOUS"
    else:
        verdict = "FLAGGED"

    return {
        "session_id": session_id,
        "score": score,
        "verdict": verdict,
        "events": events,
    }


@app.post("/session/{session_id}/complete")
def complete_session(session_id: str, status: str = "completed"):
    """Mark a monitoring session as completed or terminated"""
    try:
        storage.update_session_status(session_id, status)
        return {"message": f"session {status}", "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))