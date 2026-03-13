import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from models import (
    QuestionPaperCreate,
    QuestionPaperUpdate,
    ExamSessionCreate,
    ExamSessionUpdate,
    ExamSubmit,
)
import storage

router = APIRouter(prefix="/api", tags=["exams"])


# ══════════════════════════════════════════════════════════
# QUESTION PAPER ENDPOINTS (Admin)
# ══════════════════════════════════════════════════════════

@router.post("/exams")
def create_question_paper(paper: QuestionPaperCreate):
    """Create a new question paper with MCQ questions"""
    paper_id = str(uuid.uuid4())[:8]
    doc = {
        "_id": paper_id,
        "title": paper.title,
        "subject_code": paper.subject_code.upper(),
        "questions": [q.dict() for q in paper.questions],
        "question_count": len(paper.questions),
        "created_at": datetime.utcnow().isoformat(),
    }
    storage.create_question_paper(doc)
    return {"message": "Question paper created", "id": paper_id, "subject_code": paper.subject_code.upper()}


@router.get("/exams")
def list_question_papers():
    """List all question papers"""
    papers = storage.get_all_question_papers()
    return {"papers": papers}


@router.get("/exams/{paper_id}")
def get_question_paper(paper_id: str):
    """Get a specific question paper with all questions"""
    paper = storage.get_question_paper(paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Question paper not found")
    return paper


@router.put("/exams/{paper_id}")
def update_question_paper(paper_id: str, update: QuestionPaperUpdate):
    """Update a question paper"""
    paper = storage.get_question_paper(paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Question paper not found")

    update_data = {}
    if update.title is not None:
        update_data["title"] = update.title
    if update.subject_code is not None:
        update_data["subject_code"] = update.subject_code.upper()
    if update.questions is not None:
        update_data["questions"] = [q.dict() for q in update.questions]
        update_data["question_count"] = len(update.questions)

    storage.update_question_paper(paper_id, update_data)
    return {"message": "Question paper updated"}


@router.delete("/exams/{paper_id}")
def delete_question_paper(paper_id: str):
    """Delete a question paper"""
    storage.delete_question_paper(paper_id)
    return {"message": "Question paper deleted"}


# ══════════════════════════════════════════════════════════
# EXAM SESSION ENDPOINTS (Admin)
# ══════════════════════════════════════════════════════════

@router.post("/exam-sessions")
def create_exam_session(session: ExamSessionCreate):
    """Create a new exam session linked to a question paper via subject code"""
    # Verify the question paper exists
    paper = storage.get_paper_by_subject_code(session.subject_code.upper())
    if not paper:
        raise HTTPException(status_code=404, detail=f"No question paper found with subject code: {session.subject_code}")

    session_id = "SESSION-" + str(uuid.uuid4())[:6].upper()
    doc = {
        "_id": session_id,
        "subject_code": session.subject_code.upper(),
        "paper_id": paper["_id"],
        "title": paper["title"],
        "start_time": session.start_time,
        "end_time": session.end_time,
        "duration_minutes": session.duration_minutes,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
    }
    storage.create_exam_session(doc)
    return {"message": "Exam session created", "session_id": session_id, "subject_code": session.subject_code.upper()}


@router.get("/exam-sessions")
def list_exam_sessions():
    """List all exam sessions"""
    sessions = storage.get_all_exam_sessions()
    return {"sessions": sessions}


@router.get("/exam-sessions/{session_id}")
def get_exam_session(session_id: str):
    """Get a specific exam session"""
    session = storage.get_exam_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.put("/exam-sessions/{session_id}")
def update_exam_session(session_id: str, update: ExamSessionUpdate):
    """Update exam session timing or status"""
    session = storage.get_exam_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    update_data = {}
    if update.start_time is not None:
        update_data["start_time"] = update.start_time
    if update.end_time is not None:
        update_data["end_time"] = update.end_time
    if update.duration_minutes is not None:
        update_data["duration_minutes"] = update.duration_minutes
    if update.is_active is not None:
        update_data["is_active"] = update.is_active

    storage.update_exam_session(session_id, update_data)
    return {"message": "Session updated"}


# ══════════════════════════════════════════════════════════
# STUDENT EXAM ENDPOINTS
# ══════════════════════════════════════════════════════════

@router.get("/exam-sessions/{session_id}/exam")
def get_exam_for_student(session_id: str):
    """Get exam questions for a student (without correct answers)"""
    session = storage.get_exam_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if not session.get("is_active", False):
        raise HTTPException(status_code=400, detail="This session is not active")

    paper = storage.get_paper_by_subject_code(session["subject_code"])
    if not paper:
        raise HTTPException(status_code=404, detail="Question paper not found")

    # Strip correct answers
    questions_safe = []
    for i, q in enumerate(paper.get("questions", [])):
        questions_safe.append({
            "index": i,
            "question_text": q["question_text"],
            "options": q["options"],
        })

    return {
        "session_id": session_id,
        "title": paper["title"],
        "subject_code": paper["subject_code"],
        "duration_minutes": session["duration_minutes"],
        "question_count": len(questions_safe),
        "questions": questions_safe,
    }


@router.post("/exam-sessions/{session_id}/submit")
def submit_exam(session_id: str, submission: ExamSubmit, student_name: str = ""):
    """Submit exam answers and compute score"""
    session = storage.get_exam_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    paper = storage.get_paper_by_subject_code(session["subject_code"])
    if not paper:
        raise HTTPException(status_code=404, detail="Question paper not found")

    # Score the exam
    questions = paper.get("questions", [])
    total = len(questions)
    correct = 0
    results = []

    for idx_str, selected in submission.answers.items():
        idx = int(idx_str)
        if 0 <= idx < total:
            is_correct = questions[idx]["correct_option"] == selected
            if is_correct:
                correct += 1
            results.append({
                "question_index": idx,
                "selected": selected,
                "correct": questions[idx]["correct_option"],
                "is_correct": is_correct,
            })

    score = round((correct / total) * 100) if total > 0 else 0

    # Save submission
    submission_doc = {
        "session_id": session_id,
        "student_name": student_name,
        "answers": submission.answers,
        "score": score,
        "correct_count": correct,
        "total_questions": total,
        "results": results,
        "submitted_at": datetime.utcnow().isoformat(),
        "submitted": True,
    }
    storage.save_submission(submission_doc)

    # Complete the monitoring session
    monitoring_id = f"{session_id}_{student_name.replace(' ', '_')}"
    try:
        storage.update_session_status(monitoring_id, "completed")
    except Exception:
        pass

    return {
        "message": "Exam submitted",
        "score": score,
        "correct": correct,
        "total": total,
        "results": results,
    }


@router.get("/exam-sessions/{session_id}/submissions")
def get_session_submissions(session_id: str):
    """Get all submissions for a session (admin)"""
    submissions = storage.get_session_submissions(session_id)
    return {"submissions": submissions}


# Admin stats
@router.get("/admin/stats")
def get_admin_stats():
    """Get admin dashboard statistics"""
    papers = storage.get_all_question_papers()
    sessions = storage.get_all_exam_sessions()
    all_monitoring = storage.get_all_sessions()
    all_submissions = storage.get_all_submissions()

    active_sessions = [s for s in sessions if s.get("is_active")]
    total_students = len(set(sub.get("student_name", "") for sub in all_submissions))

    return {
        "total_papers": len(papers),
        "total_sessions": len(sessions),
        "active_sessions": len(active_sessions),
        "total_students": total_students,
        "total_submissions": len(all_submissions),
        "monitoring_sessions": len(all_monitoring),
    }
