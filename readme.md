# 🛡️ Exam Guardrail Demo

*A lightweight backend + browser extension system that detects suspicious behavior during online exams.*

This project demonstrates a **complete exam integrity monitoring system** with:
- **FastAPI Backend** - RESTful API for session and event management
- **MongoDB Database** - Persistent storage for sessions, events, and credibility reports
- **React Frontend** - Dashboard to monitor exam sessions in real-time
- **Browser Extension** - Detects cheating behaviors (tab switching, copy/paste, etc.)

The system processes suspicious behaviors in real-time to generate **credibility scores and integrity reports**.

---

# 🚀 Features

The demo currently detects the following behaviors:

| Detection          | Description                                     | Impact    |
| ------------------ | ----------------------------------------------- | --------- |
| Tab Switching      | Detects when the student leaves the exam tab    | -10 pts   |
| Copy Action        | Detects copying content from the exam page      | -15 pts   |
| Paste Action       | Detects pasting text into the exam page         | -20 pts   |
| DevTools Detection | Detects when browser developer tools are opened | -5 pts    |
| Browser Automation | Detects Selenium/Puppeteer style automation     | -25 pts   |

Each suspicious action reduces a **credibility score** (starting at 100).

Scoring Tiers:
- **90+** → CLEAR ✓
- **70-89** → UNDER REVIEW ⚠️
- **50-69** → SUSPICIOUS ⚠️
- **<50** → FLAGGED 🚩

---

# 🏗 System Architecture

## Backend API Endpoints

**Sessions:**
- `GET /sessions` - Get all exam sessions
- `GET /session/{session_id}` - Get specific session
- `POST /session/{session_id}` - Create new session
- `POST /session/{session_id}/complete` - End session

**Events:**
- `POST /events` - Submit cheating detection event
- `GET /report/{session_id}` - Get credibility report

**Health:**
- `GET /` - System health check

## Database Schema

**Sessions Collection:**
```json
{
  "_id": "session-123",
  "studentName": "John Doe",
  "studentEmail": "john@example.com",
  "examTitle": "CS301 - Data Structures",
  "status": "active",
  "score": 85,
  "riskScore": 15,
  "startTime": "2026-03-10T10:30:00",
  "endTime": null,
  "violations": []
}
```

**Events Collection:**
```json
{
  "sessionId": "session-123",
  "eventType": "tab_switch",
  "severity": "low",
  "timestamp": "2026-03-10T10:35:00",
  "description": "Student switched tabs"
}
```

## Frontend Components

- **Dashboard** - Real-time monitoring of all exam sessions
- **Session Monitoring** - Individual session stats and violations
- **Credibility Reports** - Detailed integrity analysis

---

# 🚀 Quick Start

## Using Docker Compose (Recommended)

```bash
# Start MongoDB locally with Docker
docker-compose up -d

# MongoDB will be available at: mongodb://admin:password@localhost:27017/
# MongoDB Express GUI at: http://localhost:8081
```

## Manual Setup

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions on:
- Installing dependencies
- Configuring MongoDB URI (local or cloud)
- Running backend and frontend
- Testing the API

## Essential Commands

```bash
# Backend - Install deps and run
pip install -r requirements.txt
cd backend && python -m uvicorn main:app --reload

# Frontend - Install deps and run  
cd interface-companion
npm install
npm run dev
```

---

# 📡 API Usage Examples

## Create Exam Session

```bash
curl -X POST "http://localhost:8000/session/exam-001" \
  -H "Content-Type: application/json" \
  -d '{
    "student_name": "Jane Smith",
    "student_email": "jane@university.edu",
    "exam_title": "CS301 - Data Structures Final"
  }'
```

## Submit Detection Event

```bash
curl -X POST "http://localhost:8000/events" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "exam-001",
    "event_type": "tab_switch",
    "severity": "low",
    "description": "Student switched to another tab"
  }'
```

## Get Credibility Report

```bash
curl "http://localhost:8000/report/exam-001"
```

Response:
```json
{
  "session_id": "exam-001",
  "score": 75,
  "verdict": "UNDER REVIEW",
  "events": [
    {
      "eventType": "tab_switch",
      "severity": "low",
      "timestamp": "2026-03-10T10:35:00"
    }
  ]
}
```

---

# 🔧 Configuration

### Backend (.env.backend)
```bash
# MongoDB connection string
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/exam_guardrail

# Server settings
API_HOST=0.0.0.0
API_PORT=8000
```

### Frontend (.env.local)
```bash
# Backend API URL
VITE_API_URL=http://localhost:8000
```

---

# 📦 Technology Stack

**Backend:**
- FastAPI - Modern Python web framework
- Pydantic - Data validation
- PyMongo - MongoDB driver
- Uvicorn - ASGI server

**Frontend:**
- React 18+ - UI library
- TypeScript - Type safety
- TailwindCSS - Styling
- React Query - Data fetching
- Vite - Build tool

**Database:**
- MongoDB - Document database

**DevTools:**
- Docker Compose - Local MongoDB setup

---

# 🛣️ Project Roadmap

- [ ] Real-time WebSocket updates
- [ ] Advanced analytics dashboard
- [ ] Machine learning model for behavior prediction
- [ ] Integration with popular LMS platforms
- [ ] Mobile app for proctors
- [ ] Audio/Video monitoring

---

# ⚠️ Disclaimer

This is a **demonstration/educational project**. It should not be used as the sole mechanism for preventing exam fraud in production environments. A comprehensive academic integrity system requires multiple layers of protection.

---

# 📄 License

MIT License - See LICENSE file for details

---

# 🆘 Support

For setup issues, see [SETUP_GUIDE.md](SETUP_GUIDE.md)

For questions or contributions, submit an issue or pull request.


Chrome Extension
        ↓
POST /events
        ↓
FastAPI Backend
        ↓
Score Engine
        ↓
Credibility Report
```

### Components

**1. Browser Extension**

* Detects user actions in the exam tab
* Sends events to backend API

**2. FastAPI Backend**

* Receives events
* Processes cheating signals
* Updates credibility score

**3. Scoring Engine**

* Deducts points based on suspicious behavior

**4. Credibility Report**

* Generates a final verdict for the exam session

---

# 📁 Project Structure

```
exam-guardrail-demo
│
├── backend
│   ├── main.py        # FastAPI server
│   ├── models.py      # Event data model
│   ├── scoring.py     # Credibility scoring logic
│   └── storage.py     # In-memory storage
│
└── extension
    ├── manifest.json
    └── content.js
```

---

# ⚙️ Installation

## 1. Clone the repository

```
git clone <your-repo-url>
cd exam-guardrail-demo
```

---

## 2. Create virtual environment

```
python -m venv .venv
```

Activate it:

### Windows

```
.venv\Scripts\activate
```

### Mac/Linux

```
source .venv/bin/activate
```

---

## 3. Install dependencies

```
pip install fastapi uvicorn pydantic
```

---

# ▶️ Running the Backend

Start the FastAPI server:

```
uvicorn backend.main:app --reload
```

Server will start at:

```
http://127.0.0.1:8000
```

Open API documentation:

```
http://127.0.0.1:8000/docs
```

---

# 🔌 Load the Chrome Extension

1. Open Chrome
2. Go to

```
chrome://extensions
```

3. Enable **Developer Mode**
4. Click **Load Unpacked**
5. Select the `extension` folder

The extension will now monitor browser behavior.

---

# 🧪 Demo Workflow

### 1️⃣ Start Exam Session

Call API:

```
POST /session/demo123
```

---

### 2️⃣ Trigger Suspicious Actions

Try the following:

* Switch tabs
* Copy text
* Paste text
* Open DevTools

The extension will send events to the backend.

---

### 3️⃣ View Credibility Report

Call API:

```
GET /report/demo123
```

Example output:

```
{
  "score": 60,
  "verdict": "SUSPICIOUS",
  "events": [...]
}
```

---

# 📊 Scoring System

| Behavior            | Score Deduction |
| ------------------- | --------------- |
| Tab Switch          | -10             |
| Copy                | -20             |
| Paste               | -20             |
| DevTools Open       | -20             |
| Automation Detected | -30             |

### Verdict Classification

| Score  | Verdict    |
| ------ | ---------- |
| 90–100 | CLEAR      |
| 70–89  | REVIEW     |
| 50–69  | SUSPICIOUS |
| 0–49   | FLAGGED    |

---

# ⚠️ Limitations (Demo Version)

This project is a **prototype for learning and experimentation**.

Current limitations:

* In-memory storage (no database)
* Basic detection logic
* No authentication
* No multi-user support

Future improvements could include:

* Supabase/PostgreSQL database
* Real-time dashboards
* AI-based behavioral analysis
* Advanced cheat detection

---

# 🎯 Purpose of This Project

This demo was built to:

* Learn backend architecture
* Understand browser behavior monitoring
* Explore exam integrity systems
* Prototype ideas for hackathons

---

# 👨‍💻 Tech Stack

| Component  | Technology            |
| ---------- | --------------------- |
| Backend    | FastAPI               |
| Language   | Python                |
| Extension  | Chrome Extension (JS) |
| Data Model | Pydantic              |
| Server     | Uvicorn               |

---

# 📜 License

This project is for **educational and demonstration purposes**.
