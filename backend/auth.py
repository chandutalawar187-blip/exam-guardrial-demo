import uuid
from fastapi import APIRouter, HTTPException
from .models import LoginRequest, StudentJoinRequest
from . import storage

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login")
def admin_login(req: LoginRequest):
    """Admin login with username/password"""
    user = storage.get_user_by_username(req.username)
    if not user or user.get("password") != req.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")

    token = str(uuid.uuid4())
    storage.save_token(token, user["_id"], user["role"])

    return {
        "token": token,
        "user": {
            "id": user["_id"],
            "username": user["username"],
            "name": user.get("name", ""),
            "role": user["role"],
        },
    }


@router.post("/student-join")
def student_join(req: StudentJoinRequest):
    """Student joins an exam session using session_id + subject_code"""
    # Validate session exists and is active
    session = storage.get_exam_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if not session.get("is_active", False):
        raise HTTPException(status_code=400, detail="Session is not active")
    if session.get("subject_code") != req.subject_code:
        raise HTTPException(status_code=400, detail="Invalid subject code for this session")

    # Check if student already submitted
    existing = storage.get_submission(req.session_id, req.student_name)
    if existing and existing.get("submitted"):
        raise HTTPException(status_code=400, detail="You have already submitted this exam")

    # Create a monitoring session for this student
    monitoring_session_id = f"{req.session_id}_{req.student_name.replace(' ', '_')}"
    try:
        storage.create_session(
            monitoring_session_id,
            req.student_name,
            "",
            session.get("title", req.subject_code),
        )
    except Exception:
        pass  # session might already exist

    token = str(uuid.uuid4())
    storage.save_token(token, req.student_name, "student")

    return {
        "token": token,
        "user": {
            "id": req.student_name,
            "name": req.student_name,
            "role": "student",
        },
        "session": {
            "session_id": req.session_id,
            "subject_code": req.subject_code,
            "duration_minutes": session.get("duration_minutes", 60),
            "monitoring_session_id": monitoring_session_id,
        },
    }


@router.get("/me")
def get_me(token: str = ""):
    """Get current user from token"""
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    token_data = storage.get_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {
        "id": token_data["user_id"],
        "role": token_data["role"],
    }
