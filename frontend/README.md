# Frontend - Q&A Dashboard

Next.js frontend for real-time Q&A platform with WebSocket support.

## Quick Start

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create environment file
```bash
cp .env.example .env.local
```

The `.env.local` file is already configured for local development. No changes needed if backend runs on `localhost:8000`!

### 4. Start development server
```bash
npm run dev
```

### 5. Open in browser
- Open: http://localhost:3000
- Should redirect to `/dashboard`

## Prerequisites

- Node.js 18 or higher
- Backend server running on http://localhost:8000

## Environment Variables

The `.env.example` file contains safe defaults for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

**For local development:** Just copy `.env.example` to `.env.local` - it works out of the box!

## Pages

- `/` - Redirects to dashboard
- `/dashboard` - Main Q&A forum
- `/login` - User login
- `/register` - User registration

## Features

- View all questions
- Submit new questions
- Answer questions
- Real-time updates via WebSocket
- Admin controls (when logged in)

## Troubleshooting

**Port 3000 already in use:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Cannot connect to backend:**
- Make sure backend is running on http://localhost:8000
- Check `.env.local` has correct `NEXT_PUBLIC_API_URL`

**WebSocket not connecting:**
- Make sure backend is running
- Check `.env.local` has correct `NEXT_PUBLIC_WS_URL`
- Check browser console for errors

## Tech Stack

- Next.js 14 - React framework
- TypeScript - Type safety
- Tailwind CSS - Styling
- XMLHttpRequest - API calls
- WebSocket - Real-time updates
