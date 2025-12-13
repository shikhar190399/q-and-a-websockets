# Q&A Dashboard - Backend API

A real-time Q&A platform backend built with **FastAPI**, **SQLAlchemy**, and **WebSockets**.

---

## Features

- 🔐 **User Authentication** - Register & Login with JWT tokens
- ❓ **Question Management** - Submit, answer, and manage questions
- 🔴 **Real-time Updates** - WebSocket broadcasts for live updates
- 👑 **Admin Controls** - Mark questions as Answered/Escalated
- 📊 **Smart Sorting** - Escalated → Pending → Answered

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| FastAPI | Web framework |
| SQLAlchemy | ORM (database) |
| SQLite | Database |
| PyJWT | Authentication |
| bcrypt | Password hashing |
| WebSockets | Real-time updates |

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Environment variables
│   ├── database.py          # SQLAlchemy setup
│   ├── dependencies.py      # Shared dependencies
│   │
│   ├── models/              # Database models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── question.py
│   │
│   ├── schemas/             # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── question.py
│   │
│   ├── routers/             # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py          # /auth/register, /auth/login
│   │   ├── questions.py     # /questions endpoints
│   │   └── websocket.py     # /ws endpoint
│   │
│   └── services/            # Business logic
│       ├── __init__.py
│       ├── auth.py          # Password & JWT
│       └── websocket.py     # Connection manager
│
├── requirements.txt
├── .env                     # Environment variables (create this!)
├── .gitignore
└── README.md
```

---

## Quick Start

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd q-and-a-web-socket/backend
```

### 2. Create virtual environment (recommended)

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Create `.env` file

Create a `.env` file in the `backend/` folder:

```env
SECRET_KEY=your-super-secret-key-change-this-in-production
DATABASE_URL=sqlite:///./qa_database.db
```

> ⚠️ **Important:** Change `SECRET_KEY` to a random string in production!

### 5. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

### 6. Open API docs

Visit: **http://localhost:8000/docs**

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Create new account | No |
| POST | `/auth/login` | Login & get token | No |

### Questions

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/questions/` | Get all questions | No |
| POST | `/questions/` | Submit a question | No |
| POST | `/questions/{id}/answer` | Answer a question | No |
| PATCH | `/questions/{id}/status` | Update status | **Yes (Admin)** |

### WebSocket

| Protocol | Endpoint | Description |
|----------|----------|-------------|
| WS | `/ws` | Real-time updates |

---

## API Examples

### Register a user

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "email": "john@example.com", "password": "secret123"}'
```

### Login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "secret123"}'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Submit a question

```bash
curl -X POST http://localhost:8000/questions/ \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the WiFi password?"}'
```

### Answer a question

```bash
curl -X POST http://localhost:8000/questions/1/answer \
  -H "Content-Type: application/json" \
  -d '{"answer": "The password is Guest2024"}'
```

### Update status (Admin only)

```bash
curl -X PATCH http://localhost:8000/questions/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"status": "Answered"}'
```

---

## WebSocket

Connect to `ws://localhost:8000/ws` to receive real-time updates.

### Message Types

```json
// New question posted
{
  "type": "NEW_QUESTION",
  "data": {
    "question_id": 1,
    "message": "What is...?",
    "status": "Pending",
    "timestamp": "2024-12-13T12:00:00"
  }
}

// Question answered
{
  "type": "QUESTION_ANSWERED",
  "data": {
    "question_id": 1,
    "answer": "The answer is..."
  }
}

// Status updated
{
  "type": "QUESTION_UPDATED",
  "data": {
    "question_id": 1,
    "status": "Answered"
  }
}
```

### JavaScript Example

```javascript
const socket = new WebSocket("ws://localhost:8000/ws");

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === "NEW_QUESTION") {
    // Add new question to UI
  }
};
```

---

## Database

### Tables

**users**
| Column | Type | Description |
|--------|------|-------------|
| user_id | INTEGER | Primary key |
| username | VARCHAR(100) | Display name |
| email | VARCHAR(255) | Unique email |
| password | VARCHAR(255) | Hashed password |
| created_at | TIMESTAMP | Registration date |

**questions**
| Column | Type | Description |
|--------|------|-------------|
| question_id | INTEGER | Primary key |
| message | TEXT | Question text |
| status | VARCHAR(20) | Pending/Escalated/Answered |
| timestamp | TIMESTAMP | Posted date |
| answer | TEXT | Answer text (nullable) |
| answered_by | INTEGER | FK to users |
| answered_at | TIMESTAMP | When answered |

### View database

```bash
# List tables
sqlite3 qa_database.db ".tables"

# View users
sqlite3 -header -column qa_database.db "SELECT user_id, username, email FROM users;"

# View questions
sqlite3 -header -column qa_database.db "SELECT question_id, message, status FROM questions;"
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | JWT signing key | Required |
| `DATABASE_URL` | Database connection | `sqlite:///./qa_database.db` |

---

## Development

### Run with auto-reload

```bash
uvicorn app.main:app --reload --port 8000
```

### Run tests

```bash
# Test auth service
python3 -c "
from app.services.auth import hash_password, verify_password
password = 'test123'
hashed = hash_password(password)
print(f'Hash works: {verify_password(password, hashed)}')
"
```

---

## Troubleshooting

### Port already in use

```bash
lsof -ti:8000 | xargs kill -9
```

### Database reset

```bash
rm qa_database.db
# Restart server - tables will be recreated
```

### Missing dependencies

```bash
pip install -r requirements.txt
```

---

## License

MIT

---

## Author

Built as a Q&A Dashboard assignment.

