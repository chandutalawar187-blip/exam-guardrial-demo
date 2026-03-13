-- ═══════════════════════════════════════════════════════════
-- Exam Guardrail Platform — Supabase Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ═══════════════════════════════════════════════════════════

-- 1. Users (admin accounts)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT DEFAULT '',
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Auth tokens
CREATE TABLE IF NOT EXISTS tokens (
    id TEXT PRIMARY KEY,           -- the token string itself
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Monitoring sessions (live proctoring)
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    score INTEGER DEFAULT 100,
    status TEXT DEFAULT 'active',
    student_name TEXT DEFAULT '',
    student_email TEXT DEFAULT '',
    exam_title TEXT DEFAULT '',
    start_time TEXT,
    end_time TEXT,
    risk_score INTEGER DEFAULT 0,
    violations JSONB DEFAULT '[]'::jsonb
);

-- 4. Cheating-detection events
CREATE TABLE IF NOT EXISTS events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_id TEXT NOT NULL,
    event_type TEXT,
    severity TEXT,
    timestamp TEXT,
    description TEXT DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);

-- 5. Question papers
CREATE TABLE IF NOT EXISTS question_papers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    questions JSONB DEFAULT '[]'::jsonb,
    question_count INTEGER DEFAULT 0,
    created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_papers_subject_code ON question_papers(subject_code);

-- 6. Exam sessions (scheduled exams)
CREATE TABLE IF NOT EXISTS exam_sessions (
    id TEXT PRIMARY KEY,
    subject_code TEXT NOT NULL,
    paper_id TEXT,
    title TEXT,
    start_time TEXT,
    end_time TEXT,
    duration_minutes INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    created_at TEXT
);

-- 7. Student submissions
CREATE TABLE IF NOT EXISTS submissions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_id TEXT NOT NULL,
    student_name TEXT DEFAULT '',
    answers JSONB DEFAULT '{}'::jsonb,
    score INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    results JSONB DEFAULT '[]'::jsonb,
    submitted_at TEXT,
    submitted BOOLEAN DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_submissions_session ON submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(session_id, student_name);
