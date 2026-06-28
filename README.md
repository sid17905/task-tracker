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

Recommended deployment:

- Backend: Render Web Service
- Frontend: Vercel
- Database: MongoDB Atlas
- Auth: Firebase Authentication

### Backend on Render

1. Push this repository to GitHub.
2. In Render, create a new Web Service from the GitHub repo.
3. Set Root Directory to `server`.
4. Set Build Command to `npm install`.
5. Set Start Command to `npm start`.
6. Add the backend environment variables below.
7. Deploy and copy the Render backend URL.

Backend env:

```env
MONGODB_URI=your_mongodb_atlas_uri
MONGODB_DB_NAME=task_tracker
CLIENT_URL=https://your-vercel-app.vercel.app
CORS_ORIGINS=https://your-vercel-app.vercel.app
APP_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_google_app_password
EMAIL_FROM=TaskPulse <your_email@gmail.com>
```

### Frontend on Vercel

1. In Vercel, import the GitHub repo.
2. Set Framework Preset to Vite.
3. Set Root Directory to `client`.
4. Set Build Command to `npm run build`.
5. Set Output Directory to `dist`.
6. Add the frontend environment variables below.
7. Deploy.
8. Copy the Vercel URL and add it to Render as `CLIENT_URL`, `CORS_ORIGINS`, and `APP_URL`.
9. Add the Vercel domain in Firebase Authentication authorized domains.

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
