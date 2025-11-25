# Self-Hosted Learning Management System (LMS)

A modern, self-hosted Learning Management System built with Node.js, Express, Next.js, and PostgreSQL. Inspired by platforms like Coursera, Udemy, and Cisco Skills for All.

## Features

- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **Course Management** - Create, manage, and organize courses with categories and tags
- **Content Management** - Support for videos, PDFs, documents, and interactive quizzes
- **Progress Tracking** - Track learner progress and generate certificates
- **Discussion Forums** - Course-specific forums with real-time updates
- **Direct Messaging** - Real-time messaging between users
- **Video Streaming** - Secure video streaming with adaptive playback
- **Analytics & Reporting** - Comprehensive analytics dashboard
- **Gamification** - Badges, achievements, leaderboards, and points
- **Learning Paths** - Structured learning paths with recommendations
- **Mobile Responsive** - Fully responsive design with PWA support

## Tech Stack

### Backend
- Node.js + Express.js + TypeScript
- PostgreSQL
- JWT Authentication
- Socket.io for real-time features
- FFmpeg for video processing

### Frontend
- Next.js 14 (App Router)
- React + TypeScript
- Tailwind CSS
- Recharts for analytics

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- FFmpeg (for video processing)

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Set up environment variables:
   - Copy `backend/.env.example` to `backend/.env` and configure
   - Configure database connection and JWT secrets

5. Run database migrations:
   ```bash
   cd backend
   npm run migrate
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```

7. Start the frontend development server:
   ```bash
   cd ../frontend
   npm run dev
   ```

## Project Structure

```
lms/
├── backend/          # Express API server
│   ├── database/     # Database migrations
│   └── ...
├── frontend/         # Next.js application
└── README.md
```

## License

ISC

