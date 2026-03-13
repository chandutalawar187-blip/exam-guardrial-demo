from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field


# ── Auth Models ──────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str


class StudentJoinRequest(BaseModel):
    session_id: str
    subject_code: str
    student_name: str


# ── Existing Event Model ─────────────────────────────────
class Event(BaseModel):
    session_id: str
    event_type: str
    severity: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    description: str = ""
    metadata: Optional[Dict] = None  # e.g. { "copied_text": "...", "url": "..." }


# ── Question Paper Models ────────────────────────────────
class Question(BaseModel):
    question_text: str
    options: List[str]  # exactly 4 options
    correct_option: int  # index 0-3


class QuestionPaperCreate(BaseModel):
    title: str
    subject_code: str
    questions: List[Question]


class QuestionPaperUpdate(BaseModel):
    title: Optional[str] = None
    subject_code: Optional[str] = None
    questions: Optional[List[Question]] = None


# ── Exam Session Models ─────────────────────────────────
class ExamSessionCreate(BaseModel):
    subject_code: str
    start_time: str  # ISO format
    end_time: str    # ISO format
    duration_minutes: int


class ExamSessionUpdate(BaseModel):
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration_minutes: Optional[int] = None
    is_active: Optional[bool] = None


# ── Submission Model ─────────────────────────────────────
class ExamSubmit(BaseModel):
    answers: Dict[str, int]  # { question_index: selected_option_index }
