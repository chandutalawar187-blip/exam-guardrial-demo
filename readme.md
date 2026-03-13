# 🛡️ Exam Guardrail Demo

*A lightweight backend + browser extension system that detects suspicious behavior during online exams.*

This project demonstrates a **basic exam integrity monitoring system**.
It captures common cheating behaviors from the browser and processes them in a **FastAPI backend** to generate a **credibility score and report**.

The system is built as a **learning/demo version** of an exam proctoring middleware.

---

# 🚀 Features

The demo currently detects the following behaviors:

| Detection          | Description                                     |
| ------------------ | ----------------------------------------------- |
| Tab Switching      | Detects when the student leaves the exam tab    |
| Copy Action        | Detects copying content from the exam page      |
| Paste Action       | Detects pasting text into the exam page         |
| DevTools Detection | Detects when browser developer tools are opened |
| Browser Automation | Detects Selenium/Puppeteer style automation     |

Each suspicious action reduces a **credibility score**.

---

# 🏗 System Architecture

```
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

