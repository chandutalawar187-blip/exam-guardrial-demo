"""
Seed script - Creates demo data for the Exam Guardrail Platform
Run: python -m backend.seed  (from project root)
Or:  python seed.py  (from backend directory)
"""
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(__file__))

import storage


def seed():
    print("🌱 Seeding database...")

    # 1. Create admin user
    storage.seed_default_admin()

    # 2. Create sample question paper
    if not storage.get_paper_by_subject_code("CS301"):
        paper_doc = {
            "_id": "paper-cs301",
            "title": "CS301 — Data Structures Final Exam",
            "subject_code": "CS301",
            "question_count": 5,
            "questions": [
                {
                    "question_text": "What is the time complexity of binary search?",
                    "options": ["O(n)", "O(log n)", "O(n²)", "O(1)"],
                    "correct_option": 1,
                },
                {
                    "question_text": "Which data structure uses FIFO ordering?",
                    "options": ["Stack", "Queue", "Tree", "Graph"],
                    "correct_option": 1,
                },
                {
                    "question_text": "What is the worst-case time complexity of quicksort?",
                    "options": ["O(n log n)", "O(n)", "O(n²)", "O(log n)"],
                    "correct_option": 2,
                },
                {
                    "question_text": "Which traversal visits the root node first?",
                    "options": ["Inorder", "Preorder", "Postorder", "Level-order"],
                    "correct_option": 1,
                },
                {
                    "question_text": "A balanced BST with n nodes has height:",
                    "options": ["O(n)", "O(log n)", "O(n²)", "O(1)"],
                    "correct_option": 1,
                },
            ],
            "created_at": "2026-03-10T00:00:00",
        }
        storage.create_question_paper(paper_doc)
        print("✅ Sample question paper created (CS301)")
    else:
        print("ℹ️ CS301 question paper already exists")

    # 3. Create sample exam session
    if not storage.get_exam_session("SESSION-DEMO01"):
        session_doc = {
            "_id": "SESSION-DEMO01",
            "subject_code": "CS301",
            "paper_id": "paper-cs301",
            "title": "CS301 — Data Structures Final Exam",
            "start_time": "2026-03-10T10:00:00",
            "end_time": "2026-03-10T12:00:00",
            "duration_minutes": 30,
            "is_active": True,
            "created_at": "2026-03-10T00:00:00",
        }
        storage.create_exam_session(session_doc)
        print("✅ Sample exam session created (SESSION-DEMO01, CS301, 30 min)")
    else:
        print("ℹ️ Demo session already exists")

    print("\n🎉 Seed complete!")
    print("   Admin login:  admin / admin123")
    print("   Student join:  Session ID: SESSION-DEMO01  |  Subject Code: CS301")


if __name__ == "__main__":
    seed()
