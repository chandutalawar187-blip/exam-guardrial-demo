# ✅ Integration Checklist

## Before You Start

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] MongoDB account (Atlas) or Docker installed
- [ ] Git (optional but recommended)

---

## Backend Setup

- [ ] Read `SETUP_GUIDE.md`
- [ ] Install Python dependencies: `pip install -r requirements.txt`
- [ ] Set up MongoDB:
  - [ ] Option A (Docker): `docker-compose up -d`
  - [ ] Option B (Atlas): Get your MongoDB URI from https://www.mongodb.com/cloud/atlas
- [ ] Create `.env.backend` with `MONGODB_URI`
  - Sample: `MONGODB_URI=mongodb://admin:password@localhost:27017/exam_guardrail?authSource=admin`
- [ ] Test backend: `cd backend && python -m uvicorn main:app --reload`
- [ ] Verify health check: `curl http://localhost:8000/` (should return JSON)

---

## Frontend Setup

- [ ] Navigate to `interface-companion` folder
- [ ] Install dependencies: `npm install` or `bun install`
- [ ] Verify `.env.local` exists with `VITE_API_URL=http://localhost:8000`
- [ ] Start frontend: `npm run dev` or `bun run dev`
- [ ] Open http://localhost:5173 in browser

---

## Integration Testing

### Test 1: Health Check
```bash
curl http://localhost:8000/
# Should return: {"system": "Exam Guardrail Demo Running"}
```

### Test 2: Create Session
```bash
curl -X POST "http://localhost:8000/session/test-001?student_name=John%20Doe&student_email=john@example.com&exam_title=CS301"
# Should return: {"message": "session started", "session_id": "test-001"}
```

### Test 3: Submit Event
```bash
curl -X POST "http://localhost:8000/events" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-001",
    "event_type": "tab_switch",
    "severity": "low",
    "description": "Student switched tabs"
  }'
# Should return: {"status": "event processed", "score_delta": -10}
```

### Test 4: Get Report
```bash
curl "http://localhost:8000/report/test-001"
# Should return credibility report with score and verdict
```

### Test 5: Frontend Display
- [ ] Open http://localhost:5173
- [ ] Should show "CS301 — Data Structures Final"
- [ ] If backend is running, sessions should load
- [ ] If backend is down, should show connection error

---

## MongoDB Verification

### Using Docker (Option A)
- [ ] MongoDB running: `docker ps | grep mongodb`
- [ ] MongoDB Express available at: http://localhost:8081
- [ ] Login: admin / password
- [ ] Check collections:
  - [ ] `exam_guardrail.sessions` collection exists
  - [ ] `exam_guardrail.events` collection exists

### Using Atlas (Option B)
- [ ] Login to MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- [ ] Check database `exam_guardrail`
- [ ] Collections `sessions` and `events` created after first API calls

---

## Common Issues & Fixes

### Backend won't start
- [ ] Run from project root, not `backend/` folder
- [ ] Verify `requirements.txt` installed: `pip list | grep fastapi`
- [ ] Check Python version: `python --version` (must be 3.8+)
- [ ] Port 8000 in use? Change port in startup command

### Frontend shows "Backend Connection Error"
- [ ] Verify backend is running: `curl http://localhost:8000/`
- [ ] Check `.env.local` has correct `VITE_API_URL`
- [ ] Restart frontend after changing `.env.local`
- [ ] Check browser console (F12) for errors
- [ ] Verify CORS is enabled in `backend/main.py`

### MongoDB connection fails
- [ ] For Docker: Verify MongoDB container running: `docker ps`
- [ ] For Atlas: Verify URI in `.env.backend`
- [ ] Verify username and password are correct
- [ ] Check cluster IP whitelist in MongoDB Atlas
- [ ] Verify database name is `exam_guardrail`

### Port 8000 already in use
```bash
# macOS/Linux
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Port 5173 already in use
```bash
npm run dev -- --port 3000
# Frontend will run on http://localhost:3000
```

---

## Quick Commands

```bash
# Start MongoDB (Docker)
docker-compose up -d

# Stop MongoDB (Docker)
docker-compose down

# Backend - Install and run
pip install -r requirements.txt
cd backend
python -m uvicorn main:app --reload

# Frontend - Install and run
cd interface-companion
npm install
npm run dev

# Test all endpoints (use test.sh or test.bat)
bash test.sh  # macOS/Linux
test.bat      # Windows

# Check what's running on ports
# macOS/Linux
lsof -i -P -n | grep -E ':(8000|5173)'

# Windows
netstat -ano | findstr -E ":8000|:5173"
```

---

## Data Validation

### Sample Session Document (MongoDB)
```json
{
  "_id": "test-001",
  "score": 90,
  "status": "active",
  "studentName": "John Doe",
  "studentEmail": "john@example.com",
  "examTitle": "CS301 - Data Structures",
  "startTime": "2026-03-10T10:30:00.000000",
  "endTime": null,
  "riskScore": 10,
  "violations": [
    {
      "sessionId": "test-001",
      "eventType": "tab_switch",
      "severity": "low",
      "timestamp": "2026-03-10T10:35:00.000000",
      "description": "Student switched tabs"
    }
  ]
}
```

---

## Success Criteria

You've successfully completed integration when:

- ✅ Backend API responds to `GET /` request
- ✅ Frontend loads without "Connection Error"
- ✅ Can create a session via API
- ✅ Can submit events via API
- ✅ Session score decreases after events
- ✅ Frontend displays real sessions (not mock data)
- ✅ MongoDB shows session and event documents
- ✅ Sessions refresh when new events are submitted

---

## Next Steps After Integration

1. Test with the browser extension (if available)
2. Create sample sessions and events for testing
3. Customize scoring thresholds in `scoring.py`
4. Add more event types as needed
5. Implement additional endpoints for your use case
6. Set up monitoring/alerting for flagged sessions
7. Deploy to production (see `SETUP_GUIDE.md`)

---

## Documentation Links

- Backend API Docs: See all endpoints in `SETUP_GUIDE.md` under "API Documentation"
- Database Schema: See `SETUP_GUIDE.md` under "Database Schema"
- Frontend Hooks: See usage examples in `INTEGRATION_SUMMARY.md`
- Full Setup: See `SETUP_GUIDE.md`
- Architecture: See `README.md`

---

## Support

🆘 Stuck? Check these files in order:
1. `INTEGRATION_SUMMARY.md` - What was done
2. `SETUP_GUIDE.md` - Detailed setup steps
3. `README.md` - Architecture and overview

For quick help:
- Check "Common Issues & Fixes" section above
- Review troubleshooting in `SETUP_GUIDE.md`
- Check browser console (F12) for errors
- Check terminal output for error messages

---

**You're all set! Happy monitoring! 🛡️**
