# MongoDB to Supabase Migration Summary

## Overview
This project has been successfully migrated from MongoDB to Supabase (PostgreSQL). All database operations have been converted to use Supabase's Python client library.

## Changes Made

### 1. **Dependencies** (`requirements.txt`)
- ❌ Removed: `pymongo`
- ✅ Added: `supabase`

### 2. **Database Layer** (`backend/storage.py`)
**Complete rewrite** from MongoDB driver to Supabase client:

#### Before (MongoDB):
```python
from pymongo import MongoClient
sessions_collection = db["sessions"]
sessions_collection.insert_one(session_doc)
sessions_collection.find_one({"_id": session_id})
```

#### After (Supabase):
```python
from supabase import create_client
supabase.table("sessions").insert(session_doc).execute()
supabase.table("sessions").select("*").eq("id", session_id).execute()
```

### 3. **Configuration Files**

#### Docker Compose (`docker-compose.yml`)
- ❌ Removed: MongoDB service
- ❌ Removed: MongoDB Express service
- ✅ Updated: Comments explaining Supabase configuration

#### Environment Variables
- ❌ Removed: `MONGODB_URI`
- ✅ Added: `SUPABASE_URL`, `SUPABASE_KEY`
- ✅ Created: `.env.backend.example` with Supabase template

### 4. **Startup Scripts**
- Updated `start.sh` for bash/Linux
- Updated `start.bat` for Windows
- Changed menu options to reflect Supabase setup

### 5. **Seed Script** (`backend/seed.py`)
- Updated field names: `_id` → `id`
- Updated field names: Snake_case for Supabase tables
- No functional changes to seeding logic

### 6. **Documentation**

#### New Files:
- **`SUPABASE_SETUP.md`** - Step-by-step Supabase configuration guide
- **`MIGRATION_TO_SUPABASE.md`** - This file

#### Updated Files:
- **`SETUP_GUIDE.md`** - Replaced MongoDB references with Supabase
- **`docker-compose.yml`** - Removed MongoDB, added Supabase notes
- **`requirements.txt`** - Updated dependencies

## Database Schema Changes

### Field Naming
MongoDB used `_id` and camelCase:
```json
{
  "_id": "session-123",
  "studentName": "John Doe",
  "examTitle": "CS301"
}
```

Supabase uses `id` and snake_case:
```json
{
  "id": "session-123",
  "student_name": "John Doe",
  "exam_title": "CS301"
}
```

**Note:** The `storage.py` layer adds backward compatibility by mapping `_id` → `id` where needed.

### Table Structure
All collections became SQL tables with the same names:
- `sessions` (monitoring sessions)
- `events` (detection events)
- `users` (admin accounts)
- `tokens` (auth tokens)
- `question_papers` (exam questions)
- `exam_sessions` (scheduled exams)
- `submissions` (student answers)

Run `schema.sql` in Supabase SQL Editor to create tables.

## Migration Steps for Users

1. **Update Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Create Supabase Project:**
   - Go to https://supabase.com
   - Create new project
   - Save Project URL and Anon Key

3. **Create Database Schema:**
   - Copy `schema.sql` content
   - Paste into Supabase SQL Editor
   - Click Run

4. **Configure Environment:**
   ```bash
   cp .env.backend.example .env.backend
   # Edit with your Supabase credentials
   ```

5. **Test Connection:**
   ```bash
   python -m backend.seed
   ```

6. **Start Backend:**
   ```bash
   python -m uvicorn backend.main:app --reload
   ```

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

## Key Differences: MongoDB vs Supabase

| Feature | MongoDB | Supabase |
|---------|---------|----------|
| **Connection** | MongoClient URI | create_client(URL, KEY) |
| **ID Field** | `_id` (ObjectId) | `id` (text) |
| **Query** | `.find()`, `.update_one()` | `.select()`.eq().update() |
| **Upsert** | `upsert=True` | Check & insert/update |
| **JSON** | Documents | JSONB columns |
| **Auth** | Connection string | API Keys (Anon + Service Role) |
| **Hosting** | Atlas cloud | Supabase cloud (AWS) |
| **Cost** | $57+/month | Free tier available |

## Backward Compatibility

The `storage.py` module maintains backward compatibility by:
- Mapping `_id` to `id` in return values
- Converting field names camelCase → snake_case internally
- Providing same function signatures as before

**Result:** Frontend and other backend modules need NO changes.

## Benefits of Supabase

✅ **PostgreSQL**: More reliable for structured data than MongoDB
✅ **Free Tier**: Excellent for development and testing
✅ **Real-time**: Built-in real-time database subscriptions
✅ **Security**: Row-level security (RLS) capabilities
✅ **Scaling**: Automatic backups and point-in-time recovery
✅ **Open Source**: PostgREST for automatic API generation

## Testing Migration

### Verify Installation:
```bash
python -c "from supabase import create_client; print('✅ Supabase client installed')"
```

### Verify Storage Functions:
```bash
python -c "import backend.storage as storage; print('✅ Storage module loads')"
```

### Run Demo:
```bash
python -m backend.seed
```

Should output:
```
🌱 Seeding database...
✅ Default admin ready (admin/admin123)
✅ Sample question paper created (CS301)
✅ Sample exam session created (SESSION-DEMO01, CS301, 30 min)
🎉 Seed complete!
```

## Troubleshooting

### "ModuleNotFoundError: No module named 'supabase'"
```bash
pip install supabase
```

### "Missing Supabase credentials"
- Check `.env.backend` exists
- Verify `SUPABASE_URL` and `SUPABASE_KEY` are set
- Ensure no extra spaces or quotes

### Connection timeout
- Verify internet connection
- Check Supabase project is active
- Verify URL format: `https://xxx.supabase.co`

### SQL errors in Supabase
- Run `schema.sql` in SQL Editor
- Check for syntax errors in SQL
- Verify tables were created: `\dt` in SQL Editor

## Files Changed Summary

| File | Changes |
|------|---------|
| `Backend/storage.py` | Complete rewrite for Supabase |
| `requirements.txt` | pymongo→supabase |
| `backend/seed.py` | Field name updates |
| `docker-compose.yml` | MongoDB→Supabase docs |
| `SETUP_GUIDE.md` | MongoDB→Supabase instructions |
| `start.sh` | Menu options updated |
| `start.bat` | Menu options updated |
| `.env.backend.example` | New Supabase template |
| `SUPABASE_SETUP.md` | New detailed guide |
| `MIGRATION_TO_SUPABASE.md` | This file |

## Frontend & API
**No changes required.** The API endpoints remain the same because `storage.py` maintains backward compatibility.

## Next Steps
1. Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to set up Supabase
2. Run `python -m backend.seed` to create demo data
3. Start backend: `python -m uvicorn backend.main:app --reload`
4. Start frontend: `cd frontend && npm run dev`
5. Test at `http://localhost:5173`

## Support
- Supabase Documentation: https://supabase.com/docs
- Supabase Community: https://github.com/supabase/supabase
- This Project: See README.md and INTEGRATION_SUMMARY.md

---

**Migration completed successfully!** 🎉
The entire project is now powered by Supabase with full PostgreSQL capabilities.
