# Task Tracker MERN Application

A full-stack task tracker built with React, Node.js, Express, and MongoDB. It supports task CRUD, validation, filtering, sorting, notifications, responsive UI, and dynamic updates without page refresh.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose

## Getting Started

```bash
npm run install:all
cp server/.env.example server/.env
cp client/.env.example client/.env
npm run dev
```

Update `server/.env` with your MongoDB connection string.
Enable Email/Password authentication in Firebase Console, then use the Firebase project values in `client/.env`.
Do not commit real `.env` files or Firebase project values to GitHub.

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/health

## REST API

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/tasks` | Get tasks with optional filters/sorting |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/:id` | Get one task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/team` | Get saved co-workers for the signed-in user |
| POST | `/api/team` | Add/update a co-worker by email |
| DELETE | `/api/team/:id` | Remove a co-worker |

Example: `GET /api/tasks?status=pending&priority=high&sortBy=dueDate&order=asc&search=report`

## Deployment Notes

Deploy the backend to Render/Railway/Fly.io and the frontend to Vercel/Netlify.

Backend env:

```env
MONGODB_URI=your_mongodb_atlas_uri
CLIENT_URL=https://your-frontend-domain.com
CORS_ORIGINS=https://your-frontend-domain.com
APP_URL=https://your-frontend-domain.com
PORT=5000
```

Frontend env:

```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Email notifications are optional. Add SMTP values to the backend environment to send an email whenever a task is assigned to another user:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=TaskPulse <your_email@gmail.com>
```
