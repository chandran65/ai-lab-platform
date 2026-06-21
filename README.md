# Mindora

**AI & Computational Thinking Platform for K-12 Students**

Mindora is a cloud-native learning platform that teaches computational thinking, AI literacy, and machine learning concepts through gamified experiments, age-based learning worlds, and project-based activities.

> "Duolingo + Scratch + Khan Academy + AI Playground for K-12"

---

## 🚀 Quick Start

```bash
# Backend
cd backend
poetry install
poetry run uvicorn app.main:app --port 8000

# Frontend (separate terminal)
cd client
npm install
npm run dev
```

Frontend: `http://localhost:5173` · Backend: `http://localhost:8000` · API Docs: `http://localhost:8000/docs`

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@demo.ailab.edu` | `admin123` |
| Teacher | `teacher@demo.ailab.edu` | `teacher123` |
| Student | `student@demo.ailab.edu` | `student123` |

---

## ✨ Features

### Learning Worlds
- **Discovery Island** (Ages 4+) — Foundational thinking, patterns, sequencing
- **Coding Forest** (Ages 7+) — Algorithms, loops, coding logic
- **AI Explorer Lab** (Ages 10+) — AI/ML concepts, classification, training
- **Innovation Lab** (Ages 14+) — Real-world AI development, ethics, deployment

### Gamification
- XP system with skill progression (0–100 across 5 levels)
- Badges, achievements, and milestone rewards
- Skill radar charts and history tracking
- Leaderboard

### Teacher Dashboard
- Class overview with aggregate stats
- Student progress tables (searchable, sortable)
- Skill heatmap (student × skill matrix)
- Performance trends, learning gaps, AI readiness scores
- PDF report export
- Scheduled report delivery

### Certificates
- Auto-generated world completion certificates
- Skill mastery certificates (score ≥ 80)
- Course completion certificate (all 4 worlds)
- Professional PDF download with ReportLab

### Developer Tools
- Block-based coding editor
- Python notebook with cell execution
- ML model training environment
- Dataset management

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture, design patterns, data flow |
| [API.md](API.md) | Complete API reference with request/response examples |
| [DATABASE.md](DATABASE.md) | Schema, models, indexes, relationships |
| [SETUP.md](SETUP.md) | Local development setup guide |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Docker, Fly.io, Netlify deployment |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Code standards, workflow, pull requests |
| [SECURITY.md](SECURITY.md) | Auth, RBAC, production checklist |
| [TESTING.md](TESTING.md) | Test setup, writing tests, coverage |
| [CURRICULUM.md](CURRICULUM.md) | Learning worlds, experiments, skill progression |
| [LEARNING_PATHS.md](LEARNING_PATHS.md) | Journey progression, age recommendations |
| [SPEC.md](SPEC.md) | Original product specification |

---

## 🏗️ Architecture

```
client/          → React 18 SPA (Vite + TypeScript)
backend/         → FastAPI + SQLAlchemy (async)
├── app/
│   ├── api/     → Route handlers (v1)
│   ├── core/    → Config, DB, security, cache
│   ├── models/  → SQLAlchemy ORM (indexed)
│   ├── services/→ Business logic layer
│   └── repos/   → Data access layer
└── tests/       → pytest test suite
```

### Tech Stack

**Frontend**: React 18, TypeScript, Vite 6, TailwindCSS 3, Framer Motion, TanStack Query 5, Recharts

**Backend**: Python 3.12, FastAPI, SQLAlchemy 2.x (async), JWT Auth (python-jose), ReportLab 4.5.1

**Database**: SQLite (dev) / PostgreSQL (prod) · **Deploy**: Docker / Fly.io / Netlify / Render

---

## 📦 Project Structure

```
mindora/
├── ARCHITECTURE.md
├── API.md
├── CURRICULUM.md
├── DATABASE.md
├── DEPLOYMENT.md
├── LEARNING_PATHS.md
├── SECURITY.md
├── SETUP.md
├── SPEC.md
├── TESTING.md
├── CONTRIBUTING.md
├── README.md
├── backend/
│   ├── app/
│   │   ├── api/v1/          # 17 route modules
│   │   ├── core/            # config, database, security, cache
│   │   ├── models/          # 20+ ORM models
│   │   ├── services/        # 8 service classes
│   │   └── repositories/    # 8 repository classes
│   ├── Dockerfile
│   ├── fly.toml
│   └── pyproject.toml
├── client/
│   ├── src/
│   │   ├── components/      # Shared UI (layout, protected routes)
│   │   ├── features/        # Feature modules (worlds, teacher, gamification)
│   │   ├── games/           # 6 legacy games
│   │   ├── pages/           # 14 route pages
│   │   └── services/        # API client
│   ├── Dockerfile
│   ├── nginx.conf
│   └── netlify.toml
└── docker-compose.yml
```

---

## 🗺️ Roadmap

- [x] Phase 1: Architecture + Refactoring
- [x] Phase 2: Worlds + Learning Paths
- [x] Phase 3: Gamification Engine
- [x] Phase 4: Teacher Analytics
- [x] Phase 5: Certificates
- [x] Phase 6: Optimization
- [x] Phase 7: Documentation
- [ ] Phase 8: Testing

---

## 📄 License

Educational use. Contact for commercial licensing.
