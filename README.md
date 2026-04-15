# AI Lab Platform

Cloud-native AI Learning Platform for K-12 Students. A fullstack SaaS application enabling students to build, train, and deploy AI models through an intuitive block-based programming interface.

## Architecture

- **Backend**: FastAPI + SQLite with JWT authentication
- **Frontend**: React 18 + TypeScript + Vite + shadcn/ui + TailwindCSS

## Quick Start

### Backend
```bash
cd backend
poetry install
poetry run uvicorn app.main:app --port 8000
```

### Frontend
```bash
cd client
npm install
npm run dev
```

Frontend runs at http://localhost:5173, backend at http://localhost:8000.

## Demo Accounts

| Role    | Email                      | Password    |
|---------|---------------------------|-------------|
| Admin   | admin@demo.ailab.edu      | admin123    |
| Teacher | teacher@demo.ailab.edu    | teacher123  |
| Student | student@demo.ailab.edu    | student123  |

## Features

- **Role-based access control** (Admin, Teacher, Student)
- **Project management** with CRUD operations
- **Dataset management** with class labels
- **ML model training** (simulated for MVP)
- **Block-based coding** editor with transpilation
- **Python notebook** with cell execution
- **Activity browser** with difficulty filters
- **Teacher dashboard** with class management
- **Admin console** with system statistics

## Tech Stack

### Backend
- Python 3.12, FastAPI, SQLite
- JWT authentication (python-jose)
- Password hashing (passlib + bcrypt)

### Frontend
- React 18, TypeScript, Vite
- TailwindCSS, shadcn/ui
- Recharts for data visualization
- Lucide icons
- Axios with JWT refresh interceptor
