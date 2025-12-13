# Q&A Dashboard

A full-stack real-time Q&A application with WebSocket support for instant updates.

![Q&A Dashboard](https://img.shields.io/badge/Status-Complete-green)

## Overview

This application allows users to:
- **Submit questions** via a simple form
- **Answer questions** in real-time
- **Admin controls** for logged-in users to mark questions as answered or escalate them
- **Live updates** across all connected clients via WebSocket

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Backend** | FastAPI, Python 3.11+ |
| **Database** | SQLite with SQLAlchemy ORM |
| **Real-time** | WebSocket |
| **Auth** | JWT tokens, bcrypt password hashing |

## Project Structure

```
q-and-a-web-socket/
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routers/        # API routes
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   ├── config.py       # Configuration
│   │   ├── database.py     # Database setup
│   │   ├── dependencies.py # Auth dependencies
│   │   └── main.py         # App entry point
│   ├── requirements.txt
│   └── README.md
│
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/            # Pages (dashboard, login, register)
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities, API client
│   ├── package.json
│   └── README.md
│
└── README.md               # This file
```

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/q-and-a-web-socket.git
cd q-and-a-web-socket
```

### 2. Start Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Start server
uvicorn app.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000

### 3. Start Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env.local

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:3000

## Features

### For Guests (Not Logged In)
- ✅ View all questions
- ✅ Submit new questions
- ✅ Answer questions

### For Admins (Logged In)
- ✅ All guest features
- ✅ Mark questions as "Answered" (green status)
- ✅ Escalate questions (red status, moves to top)
- ✅ Real-time notifications

### Real-Time Updates
- ✅ New questions appear instantly
- ✅ Answers update live
- ✅ Status changes reflect immediately
- ✅ Auto-reconnect on connection loss

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login, get JWT | No |
| GET | `/questions/` | Get all questions | No |
| POST | `/questions/` | Submit question | No |
| POST | `/questions/{id}/answer` | Answer question | No |
| PATCH | `/questions/{id}/status` | Update status | Yes |

## WebSocket

Connect to `ws://localhost:8000/ws` to receive real-time events:

```javascript
{
  "type": "NEW_QUESTION",
  "data": { /* question object */ }
}
```

## Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| user_id | INTEGER | Primary key |
| username | VARCHAR(100) | User's name |
| email | VARCHAR(255) | Unique email |
| password | VARCHAR(255) | Hashed password |
| created_at | DATETIME | Registration time |

### Questions Table
| Column | Type | Description |
|--------|------|-------------|
| question_id | INTEGER | Primary key |
| message | TEXT | Question content |
| status | VARCHAR(20) | Pending/Escalated/Answered |
| timestamp | DATETIME | Posted time |
| answer | TEXT | Answer content |
| answered_by | INTEGER | FK to users |
| answered_at | DATETIME | Answer time |

## Environment Variables

### Backend (.env)
```
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///./qa_database.db
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

## Testing

### Backend
```bash
# Test API
curl http://localhost:8000/
# Response: {"status":"ok","message":"Q&A Dashboard API is running"}
```

### Frontend
1. Open http://localhost:3000
2. Submit a question
3. Open another browser tab
4. See updates in real-time!

## License

MIT

