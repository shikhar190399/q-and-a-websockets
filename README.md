# Q&A Dashboard

A full-stack real-time Q&A platform with WebSocket support for instant updates across all clients.

## Overview

- **Guests** can view, submit, and answer questions
- **Admins** (logged-in users) can mark questions as answered, escalate, de-escalate, and delete
- **Real-time updates** via WebSocket for live synchronization

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Backend** | FastAPI, Python 3.11+ |
| **Database** | SQLite (local) / PostgreSQL (production) |
| **Real-time** | WebSocket |
| **Auth** | JWT tokens, bcrypt |

## Project Structure

```
q-and-a-web-socket/
├── backend/          # FastAPI backend
│   └── README.md     # Backend setup guide
├── frontend/         # Next.js frontend
│   └── README.md     # Frontend setup guide
└── README.md         # This file
```

## Backend API

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login, returns JWT token

### Questions
- `GET /questions/` - Get paginated questions (query: `limit`, `cursor`)
- `POST /questions/` - Submit a question
- `POST /questions/{id}/answer` - Answer a question
- `PATCH /questions/{id}/status` - Update status (admin only)
- `DELETE /questions/{id}` - Delete question (admin only)

### WebSocket
- `WS /ws` - Real-time updates endpoint

**WebSocket Message Types:**
```json
{
  "type": "NEW_QUESTION" | "QUESTION_ANSWERED" | "QUESTION_UPDATED" | "QUESTION_DELETED",
  "data": { /* question object */ }
}
```

## Frontend Structure

### Pages
- `/` - Redirects to `/dashboard`
- `/dashboard` - Main Q&A forum
- `/login` - User login
- `/register` - User registration

### Features
- Question submission with predefined FAQ suggestions
- Real-time question list with infinite scroll
- WebSocket connection for live updates
- Admin controls (when authenticated)

## Setup

**For detailed setup instructions, see:**
- `backend/README.md` - Backend setup and API documentation
- `frontend/README.md` - Frontend setup and usage guide

## Quick Start

```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## License

MIT

