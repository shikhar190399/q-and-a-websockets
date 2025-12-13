# Q&A Dashboard - Frontend

A real-time Q&A dashboard built with Next.js, featuring WebSocket updates for instant communication.

## Features

- **Guest Access**: Anyone can view, submit, and answer questions
- **Admin Access**: Logged-in users can mark questions as "Answered" or "Escalate" them
- **Real-time Updates**: WebSocket integration for instant updates across all clients
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: XMLHttpRequest (as per requirements)
- **Real-time**: WebSocket

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Main Q&A dashboard
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home (redirects to dashboard)
│   │
│   ├── components/             # React components
│   │   ├── Header.tsx          # Navigation header
│   │   ├── QuestionCard.tsx    # Individual question display
│   │   ├── QuestionForm.tsx    # Submit new question
│   │   └── QuestionList.tsx    # List of all questions
│   │
│   ├── hooks/                  # Custom React hooks
│   │   └── useWebSocket.ts     # WebSocket subscription hook
│   │
│   └── lib/                    # Utilities and helpers
│       ├── api/                # API client functions
│       │   ├── auth.ts         # Auth endpoints
│       │   ├── client.ts       # XMLHttpRequest wrapper
│       │   ├── index.ts        # Exports
│       │   └── questions.ts    # Question endpoints
│       ├── auth.ts             # Token management
│       ├── types.ts            # TypeScript interfaces
│       └── websocket.ts        # WebSocket manager
│
├── .env.local                  # Environment variables
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running on http://localhost:8000

### Installation

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment** (`.env.local`):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **Open browser**: http://localhost:3000

## Pages

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/dashboard` |
| `/dashboard` | Main Q&A forum with question list |
| `/login` | User login form |
| `/register` | New user registration |

## User Roles

### Guest (Not Logged In)
- View all questions
- Submit new questions
- Answer questions

### Admin (Logged In)
- All guest permissions
- Mark questions as "Answered"
- Escalate questions (moves to top)
- De-escalate questions

## API Integration

All API calls use XMLHttpRequest via the custom client in `lib/api/client.ts`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register new user |
| `/auth/login` | POST | Login, returns JWT |
| `/questions/` | GET | Get all questions |
| `/questions/` | POST | Submit new question |
| `/questions/{id}/answer` | POST | Answer a question |
| `/questions/{id}/status` | PATCH | Update status (auth required) |

## WebSocket Events

| Event Type | Description |
|------------|-------------|
| `NEW_QUESTION` | New question submitted |
| `QUESTION_ANSWERED` | Question received an answer |
| `QUESTION_UPDATED` | Question status changed |

## Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | `ws://localhost:8000/ws` |
