# Exam Guardrail - Setup Guide

## Overview
This project consists of a FastAPI backend connected to **Supabase** (PostgreSQL) and a React frontend. Follow these steps to get everything running.

## Prerequisites
- Python 3.8+
- Node.js 16+ and npm or bun
- Supabase account (free at https://supabase.com)
- Git

## Backend Setup

### 1. Install Python Dependencies
```bash
cd /path/to/exam-guardrial
pip install -r requirements.txt
```

### 2. Set Up Supabase Database

**See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed step-by-step instructions.**

**Quick Summary:**
1. Create a free project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `schema.sql` in your Supabase SQL Editor
3. Get your Project URL and Anon Public Key from **Settings > API**
4. Create `.env.backend`:
   ```bash
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-anon-key-here
   ```
5. Run the seed script:
   ```bash
   python -m backend.seed
   ```

### 3. Run the Backend Server
```bash
cd /path/to/exam-guardrial
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

Check health: `curl http://localhost:8000/`

### 4. Backend Endpoints

**Sessions:**
- `GET /api/sessions` - Get all sessions
- `GET /api/session/{session_id}` - Get specific session
- `POST /api/auth/student-join` - Join exam session

**Events:**
- `POST /api/events` - Submit detection event
  - Body: 
    ```json
    {
      "session_id": "s-1",
      "event_type": "tab_switch",
      "severity": "low",
      "description": "Student switched tabs"
    }
    ```

**Auth:**
- `POST /api/auth/login` - Admin login
- `POST /api/auth/student-join` - Student joins exam

### 5. Database Tables

Supabase creates these tables:
- `users` - Admin accounts
- `tokens` - Auth tokens
- `sessions` - Live monitoring sessions
- `events` - Cheating detection events
- `question_papers` - Exam questions
- `exam_sessions` - Scheduled exams
- `submissions` - Student answers

See `schema.sql` for complete schema.

## Frontend Setup

### 1. Install Dependencies
```bash
cd /path/to/exam-guardrial/frontend
npm install
# or
bun install
```

### 2. Configure API URL
Edit `frontend/.env.local`:
```bash
VITE_API_URL=http://localhost:8000
```

### 3. Run Development Server
```bash
npm run dev
# or
bun run dev
```

Frontend available at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
# or
bun run build
```

## Testing the Integration

### 1. Start Backend
```bash
cd exam-guardrial
python -m uvicorn backend.main:app --reload
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Login to Admin Dashboard
- Go to `http://localhost:5173`
- Login with: `admin` / `admin123`
- Access admin dashboard

### 4. Test Student Join
- Use Session ID: `SESSION-DEMO01`
- Subject Code: `CS301`
- Student Name: Any name

## Troubleshooting

### Supabase Connection Error
**Problem:** Backend crashes with Supabase error

**Solutions:**
1. Verify `.env.backend` has correct credentials
2. Format check:
   - URL: `https://your-project-id.supabase.co`
   - KEY: Anon Public Key only (not Service Role)
3. Ensure `schema.sql` was executed in Supabase
4. Verify Supabase project is active

### Backend Connection Error
**Problem:** Frontend shows connection error

**Solutions:**
1. Verify backend running: `curl http://localhost:8000/`
2. Check `VITE_API_URL` in `.env.local`
3. Check browser console for CORS errors
4. Ensure port 8000 is accessible

### Port Already in Use

**Backend (Port 8000):**
```bash
python -m uvicorn backend.main:app --reload --port 8001
```

**Frontend (Port 5173):**
```bash
npm run dev -- --port 3000
```

### Python Dependency Issues
```bash
rm -r venv  # Windows: rmdir venv
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Environment Variables Not Loading
1. Verify `.env.backend` exists in project root
2. Check variable names (case-sensitive)
3. Restart terminal
4. Test: `python -c "import os; from dotenv import load_dotenv; load_dotenv('.env.backend'); print(os.getenv('SUPABASE_URL'))"`

## Production Deployment

### Backend
```bash
pip install gunicorn
gunicorn backend.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend
```bash
npm run build
npm install -g serve
serve -s dist -l 3000
```

Or deploy to Vercel/Netlify using the built `dist/` folder.

## Environment Variables Summary

### Backend (`.env.backend`)
- `SUPABASE_URL` - Supabase project URL (required)
- `SUPABASE_KEY` - Supabase Anon Public Key (required)

### Frontend (`.env.local`)
- `VITE_API_URL` - Backend API URL (default: http://localhost:8000)

## Next Steps
1. Read [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed database setup
2. Check [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md) for architecture overview
3. Review [README.md](./readme.md) for project details

## Support
- Supabase docs: https://supabase.com/docs
- FastAPI docs: https://fastapi.tiangolo.com
- For issues: Check error logs and README files
