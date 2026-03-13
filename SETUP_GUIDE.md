# Exam Guardrail - Setup Guide

## Overview
This project consists of a FastAPI backend connected to a MongoDB database and a React frontend. Follow these steps to get everything up and running.

## Prerequisites
- Python 3.8+
- Node.js 16+ and npm or bun
- MongoDB Atlas account (for cloud MongoDB)
- Git

## Backend Setup

### 1. Install Python Dependencies
```bash
cd /path/to/exam-guardrail-demo
pip install -r requirements.txt
```

### 2. Configure MongoDB URI
Edit `.env.backend` and replace the placeholder with your MongoDB URI:

```bash
# .env.backend
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/exam_guardrail?retryWrites=true&w=majority
```

To get your MongoDB URI:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create or log in to your account
3. Create a new cluster or use existing one
4. Click "Connect"
5. Choose "Drivers" → "Python"
6. Copy the connection string and replace `<username>`, `<password>`, and `<cluster>` with your credentials

### 3. Run the Backend Server
```bash
cd /path/to/exam-guardrail-demo/backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

Check health: `curl http://localhost:8000/`

### 4. Backend Endpoints

**Sessions:**
- `GET /sessions` - Get all exam sessions
- `GET /session/{session_id}` - Get specific session
- `POST /session/{session_id}` - Create new session
  - Query params: `student_name`, `student_email`, `exam_title`
- `POST /session/{session_id}/complete` - Complete/terminate session
  - Body: `{ "status": "completed" or "terminated" }`

**Events:**
- `POST /events` - Submit detection event
  - Body: 
    ```json
    {
      "session_id": "s-1",
      "event_type": "tab_switch",
      "severity": "low",
      "description": "Student switched tabs"
    }
    ```

**Reports:**
- `GET /report/{session_id}` - Get credibility report

### 5. Database Schema

The MongoDB database automatically creates collections:

**sessions collection:**
```json
{
  "_id": "s-1",
  "score": 95,
  "status": "active",
  "studentName": "John Doe",
  "studentEmail": "john@example.com",
  "examTitle": "CS301 - Data Structures",
  "startTime": "2026-03-10T10:30:00",
  "endTime": null,
  "riskScore": 5,
  "violations": []
}
```

**events collection:**
```json
{
  "_id": ObjectId,
  "sessionId": "s-1",
  "eventType": "tab_switch",
  "severity": "low",
  "timestamp": "2026-03-10T10:35:00",
  "description": "Student switched tabs"
}
```

## Frontend Setup

### 1. Install Dependencies
```bash
cd /path/to/exam-guardrail-demo/interface-companion
npm install
# or
bun install
```

### 2. Configure API URL
Edit `.env.local`:
```bash
# .env.local
VITE_API_URL=http://localhost:8000
```

If your backend is on a different host/port, update this URL accordingly.

### 3. Run Development Server
```bash
npm run dev
# or
bun run dev
```

The frontend will be available at `http://localhost:5173` (or another port if 5173 is in use)

### 4. Build for Production
```bash
npm run build
# or
bun run build
```

## Testing the Integration

### 1. Start Backend
```bash
cd backend
python -m uvicorn main:app --reload
```

### 2. Start Frontend
```bash
cd interface-companion
npm run dev
```

### 3. Create a Test Session

Using curl:
```bash
curl -X POST "http://localhost:8000/session/test-1?student_name=John%20Doe&student_email=john@example.com&exam_title=CS301"
```

Or via Python:
```python
import requests

response = requests.post(
    "http://localhost:8000/session/test-1",
    params={
        "student_name": "John Doe",
        "student_email": "john@example.com",
        "exam_title": "CS301 - Data Structures"
    }
)
print(response.json())
```

### 4. Submit Events

```bash
curl -X POST "http://localhost:8000/events" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-1",
    "event_type": "tab_switch",
    "severity": "low",
    "description": "Student switched tabs"
  }'
```

### 5. Get Credibility Report

```bash
curl "http://localhost:8000/report/test-1"
```

## API Client Hooks (Frontend)

The frontend provides custom React hooks for API interaction:

```typescript
import { useSessions, useSession, useSessionReport, useSubmitEvent } from "@/hooks/useApi";

// Get all sessions
const { data: sessions, isLoading, error } = useSessions();

// Get specific session
const { data: session } = useSession("test-1");

// Get credibility report
const { data: report } = useSessionReport("test-1");

// Submit event
const { mutate: submitEvent } = useSubmitEvent();
submitEvent({
  sessionId: "test-1",
  eventType: "tab_switch",
  severity: "low",
  description: "Switched tabs"
});
```

## Troubleshooting

### Backend Connection Error
**Problem:** Frontend shows "Backend Connection Error"

**Solutions:**
1. Verify backend is running: `curl http://localhost:8000/`
2. Check `VITE_API_URL` in `.env.local` matches your backend URL
3. Check browser console for CORS errors
4. Ensure firewall allows port 8000

### MongoDB Connection Error
**Problem:** Backend crashes with MongoDB connection error

**Solutions:**
1. Verify MongoDB URI in `.env.backend` is correct
2. Ensure MongoDB cluster is accessible (check IP whitelist in MongoDB Atlas)
3. Test connection with MongoDB Compass using the URI
4. Check username and password are correct

### Port Already in Use
**For Backend (8000):**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

**For Frontend (5173):**
Will automatically use next available port, or specify:
```bash
npm run dev -- --port 3000
```

## Production Deployment

### Backend
```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn backend.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend
```bash
# Build
npm run build

# Serve with a static server or deploy to Vercel/Netlify
npm install -g serve
serve -s dist -l 3000
```

## Environment Variables Summary

### Backend `.env.backend`
- `MONGODB_URI` - MongoDB connection string (required)
- `API_HOST` - Server host (default: 0.0.0.0)
- `API_PORT` - Server port (default: 8000)

### Frontend `.env.local`
- `VITE_API_URL` - Backend API URL (default: http://localhost:8000)

## Support
For issues or questions, check the project README or submit an issue on GitHub.
