# Backend - Q&A Dashboard API

FastAPI backend with WebSocket support for real-time Q&A platform.

## Quick Start

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Create virtual environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Create environment file
```bash
cp .env.example .env
```

The `.env` file is already configured for local development with SQLite. No changes needed!

### 5. Start the server
```bash
uvicorn app.main:app --reload --port 8000
```

### 6. Verify it's working
- Open: http://localhost:8000/
- Should see: `{"status":"ok","message":"Q&A Dashboard API is running"}`
- API docs: http://localhost:8000/docs

## Database

- **Auto-creates on first run** - No setup needed!
- Database file: `qa_database.db` (SQLite)
- Tables are created automatically when server starts

## Environment Variables

The `.env.example` file contains safe defaults for local development:

```env
SECRET_KEY=your-super-secret-key-change-this-in-production
DATABASE_URL=sqlite:///./qa_database.db
```

**For local development:** Just copy `.env.example` to `.env` - it works out of the box!

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, get JWT token |
| GET | `/questions/` | Get all questions (paginated) |
| POST | `/questions/` | Submit a question |
| POST | `/questions/{id}/answer` | Answer a question |
| PATCH | `/questions/{id}/status` | Update status (admin only) |
| DELETE | `/questions/{id}` | Delete question (admin only) |
| WS | `/ws` | WebSocket for real-time updates |

## Troubleshooting

**Port 8000 already in use:**
```bash
lsof -ti:8000 | xargs kill -9
```

**Module not found:**
```bash
# Make sure venv is activated
source venv/bin/activate
pip install -r requirements.txt
```

**Database errors:**
- Delete `qa_database.db` and restart server
- Database will be recreated automatically

## Tech Stack

- FastAPI - Web framework
- SQLAlchemy - ORM
- SQLite - Database (local)
- PyJWT - Authentication
- bcrypt - Password hashing
- WebSockets - Real-time updates
