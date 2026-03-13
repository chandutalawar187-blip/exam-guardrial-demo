# Supabase Setup Guide for Exam Guardrail Platform

This guide walks you through setting up your Supabase database for the Exam Guardrail Platform.

## Prerequisites

- A Supabase account (free at https://supabase.com)
- Python 3.8+ with dependencies installed (`pip install -r requirements.txt`)

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: `exam-guardrail` (or your preferred name)
   - **Database Password**: Create a strong password (you'll need this)
   - **Region**: Choose the region closest to you
4. Click **"Create new project"** and wait for initialization (2-5 minutes)

---

## Step 2: Create Database Schema

1. In the Supabase dashboard, go to the **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `schema.sql` from your project root
4. Paste it into the SQL editor
5. Click **"Run"** to execute the schema
6. You should see ✅ Success message

**Note:** This creates 7 tables:
- `users` - Admin accounts
- `tokens` - Auth tokens
- `sessions` - Live monitoring sessions
- `events` - Cheating detection events
- `question_papers` - Exam question papers
- `exam_sessions` - Scheduled exams
- `submissions` - Student answers and results

---

## Step 3: Get Your API Keys

1. In the Supabase dashboard, go to **Settings** (bottom left)
2. Click **"API"**
3. Copy these two values:
   - **Project URL** (under "API URL")
   - **Anon Public Key** (under "Project API keys")
   - ⚠️ DO NOT use the "Service Role Key"

---

## Step 4: Configure Environment Variables

1. In your project root, copy the template:
   ```bash
   cp .env.backend.example .env.backend
   ```

2. Open `.env.backend` and fill in:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-anon-key-here
   ```

   Replace with your actual values from Step 3.

---

## Step 5: Install Supabase Package

If you haven't already:
```bash
pip install supabase
```

---

## Step 6: Test the Connection

From the project root, run:
```bash
python -m backend.seed
```

You should see:
```
🌱 Seeding database...
✅ Default admin ready (admin/admin123)
✅ Sample question paper created (CS301)
✅ Sample exam session created (SESSION-DEMO01, CS301, 30 min)

🎉 Seed complete!
```

If you see errors, double-check your `SUPABASE_URL` and `SUPABASE_KEY`.

---

## Step 7: Start the Backend

From the project root:
```bash
python -m uvicorn backend.main:app --reload
```

The backend should start on `http://localhost:8000`

---

## Step 8: Test the Frontend

From the `frontend/` directory:
```bash
npm run dev
```

The frontend should start on `http://localhost:5173`

---

## Troubleshooting

### Error: "Missing Supabase credentials"
- Check that `.env.backend` exists with `SUPABASE_URL` and `SUPABASE_KEY`
- Verify the keys are not empty or have spaces

### Error: "Failed to connect to Supabase"
- Verify your `SUPABASE_URL` format: `https://your-project-id.supabase.co`
- Verify your `SUPABASE_KEY` is the Anon Public Key (not Service Role)
- Check your internet connection
- Ensure your Supabase project is active

### Tables not created
- Run the `schema.sql` file again in Supabase SQL Editor
- Check the SQL output for errors
- Ensure you're in the correct database (default is usually fine)

---

## Key Changes from MongoDB

| Feature | MongoDB | Supabase |
|---------|---------|----------|
| Connection | `pymongo`, URI | `supabase` Python client |
| Database | Collections | Tables (SQL) |
| ID field | `_id` (ObjectId) | `id` (text) |
| JSON storage | Top-level documents | JSONB columns |
| Query style | `.find()`, `.update_one()` | `.select()`, `.update()` |

---

## Next Steps

- Review `backend/models.py` for data structures
- Check `backend/auth.py` for authentication logic
- Explore `backend/exam_routes.py` for exam endpoints
- Read the main `readme.md` for full project documentation

---

## Support

For issues with Supabase, visit: https://supabase.com/docs/guides/getting-started

For issues with this project, check the main `readme.md` or `INTEGRATION_SUMMARY.md`
