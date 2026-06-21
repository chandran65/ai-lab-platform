# 🧠 Mindora / AI Lab Platform — Full Project Analysis

> Comprehensive analysis of the entire codebase for generating improvement prompts.

---

## 1. HIGH-LEVEL OVERVIEW

This is an **AI Learning Platform for K-12 students** with three major sections:

1. **Client (React/TypeScript)** — The main web app with dashboard, ML environment, coding tools, and arcade games
2. **Backend (FastAPI/Python)** — SQLite database, JWT auth, REST API, code execution, ML training simulation
3. **Game Apps** — 6 standalone educational games (some Python/Tkinter, some React) + Weather World (React)

---

## 2. DIRECTORY STRUCTURE

```
D:\Coxara\Mindora/
├── backend/                          # Python FastAPI backend
│   ├── app/
│   │   ├── main.py                  # Single monolithic API (ALL endpoints in one file ~700+ lines)
│   │   └── __init__.py
│   ├── tests/
│   │   └── __init__.py
│   ├── Dockerfile
│   ├── fly.toml
│   ├── poetry.lock
│   ├── pyproject.toml
│   └── README.md
│
├── client/                           # Main React/TypeScript frontend
│   ├── src/
│   │   ├── App.tsx                   # Root router (React Router v6)
│   │   ├── main.tsx                  # Entry point
│   │   ├── App.css
│   │   ├── index.css                 # Global Tailwind styles
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx        # User info, notifications, search
│   │   │   │   ├── Layout.tsx        # Sidebar + Header + <Outlet />
│   │   │   │   └── Sidebar.tsx       # Navigation links with icons
│   │   │   └── ProtectedRoute.tsx    # Role-based route guard
│   │   ├── context/
│   │   │   └── AuthContext.tsx       # Auth state provider (JWT + guest fallback)
│   │   ├── services/
│   │   │   └── api.ts                # Axios API client (all endpoint modules)
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx         # Sandbox/Studio view & Teacher Analytics
│   │   │   ├── GameHub.tsx           # Main landing page (arcade hub with skill dashboard)
│   │   │   ├── Activities.tsx        # Learning activities browser
│   │   │   ├── Projects.tsx          # Project listing
│   │   │   ├── ProjectDetail.tsx     # Single project view
│   │   │   ├── CreateProject.tsx     # Create ML project
│   │   │   ├── BlockEditor.tsx       # Blockly-style block coding editor
│   │   │   ├── Notebook.tsx          # Python notebook editor
│   │   │   ├── MLEnvironment.tsx     # TensorFlow.js ML training studio (~600+ lines)
│   │   │   ├── Profile.tsx           # User profile with badges
│   │   │   ├── TeacherDashboard.tsx  # Teacher analytics dashboard
│   │   │   └── AdminConsole.tsx      # Admin console
│   │   ├── games/                    # React game implementations
│   │   │   ├── bee/
│   │   │   │   └── BeeFlowerPath.tsx
│   │   │   ├── color/
│   │   │   │   └── ColourMagic.tsx
│   │   │   ├── puppy/
│   │   │   │   └── FeedPuppy.tsx
│   │   │   ├── train/
│   │   │   │   └── TrainBuilder.tsx
│   │   │   ├── turtle/
│   │   │   │   └── TurtlePath.tsx
│   │   │   └── weather/              # Weather World (React/JSX)
│   │   │       ├── App.jsx
│   │   │       ├── main.jsx
│   │   │       ├── index.css
│   │   │       ├── context/WeatherContext.jsx
│   │   │       ├── components/
│   │   │       │   ├── AnimatedBackground.jsx
│   │   │       │   ├── Butterflies.jsx
│   │   │       │   ├── Character.jsx
│   │   │       │   ├── FloatingClouds.jsx
│   │   │       │   ├── Frog.jsx
│   │   │       │   ├── Leaves.jsx
│   │   │       │   ├── Mascot.jsx
│   │   │       │   ├── Rain.jsx
│   │   │       │   ├── Snow.jsx
│   │   │       │   ├── Snowman.jsx
│   │   │       │   ├── Stars.jsx
│   │   │       │   ├── Sun.jsx
│   │   │       │   └── WeatherButton.jsx
│   │   │       ├── pages/
│   │   │       │   ├── HomePage.jsx
│   │   │       │   ├── GameWorld.jsx
│   │   │       │   ├── WeatherGuardian.jsx
│   │   │       │   ├── GardenBuilder.jsx
│   │   │       │   └── AnimalRescue.jsx
│   │   │       ├── islands/
│   │   │       │   ├── IceCave.jsx
│   │   │       │   ├── MoonObservatory.jsx
│   │   │       │   ├── SunTemple.jsx
│   │   │       │   └── WindForest.jsx
│   │   │       ├── data/
│   │   │       │   ├── weatherData.js
│   │   │       │   ├── weatherMissions.js
│   │   │       │   ├── weatherRelics.js
│   │   │       │   ├── weatherFacts.js
│   │   │       │   ├── plantsData.js
│   │   │       │   └── animalRescueData.js
│   │   │       └── utils/
│   │   │           └── audio.js
│   │   └── lib/
│   │       ├── skillsEngine.ts       # Skills evaluation + badges
│   │       └── utils.ts
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── netlify.toml
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
│   ├── eslint.config.js
│   ├── components.json              # ShadCN config
│   ├── package.json
│   └── .npmrc
│
├── game/                             # Standalone game files (Python originals)
│   ├── bee_flower_path.py            # Python/Tkinter game
│   ├── colour_magic.py               # Python/Tkinter game
│   ├── feed_puppy.py                 # Python/Tkinter game
│   ├── train_builder.py              # Python/Tkinter game
│   ├── turtle path.py                # Python/Tkinter game
│   └── weather-world/                # Weather World (React/JSX — DUPLICATE of client/src/games/weather)
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── context/WeatherContext.jsx
│       ├── components/ (same 13 components)
│       ├── pages/ (same 5 pages)
│       ├── islands/ (same 4 islands)
│       ├── data/ (same 6 data files)
│       └── utils/audio.js
│
├── docker-compose.yml               # Backend + Frontend containers
├── render.yaml                       # Render.com deployment config
├── .gitignore
└── README.md
```

---

## 3. ROUTING FLOW (Client App.tsx)

### Public Routes
| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login.tsx | User login |
| `/register` | Register.tsx | User registration |

### Protected Routes (wrapped in Layout)
| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | GameHub.tsx | **Default landing** — Arcade hub with skill dashboard |
| `/profile` | Profile.tsx | User profile with badges |
| `/sandbox` | Dashboard.tsx | Student Studio / Teacher Analytics |
| `/activities` | Activities.tsx | Learning activities browser |
| `/projects` | Projects.tsx | Project listing |
| `/create-project` | CreateProject.tsx | Create ML project |
| `/projects/:id` | ProjectDetail.tsx | Single project view |
| `/block-editor` | BlockEditor.tsx | Blockly-style block coding |
| `/notebook` | Notebook.tsx | Python notebook editor |
| `/ml-environment` | MLEnvironment.tsx | TensorFlow.js ML training studio |
| `/games/weather` | Weather App | Weather World game |
| `/games/train` | TrainBuilder.tsx | Train Builder game |
| `/games/turtle` | TurtlePath.tsx | Turtle Path game |
| `/games/puppy` | FeedPuppy.tsx | Feed the Puppy game |
| `/games/color` | ColourMagic.tsx | Colour Magic game |
| `/games/bee` | BeeFlowerPath.tsx | Bee Flower Path game |

### Role-Protected Routes
| Route | Role Required | Page |
|-------|--------------|------|
| `/teacher` | teacher, admin | TeacherDashboard.tsx |
| `/admin` | admin | AdminConsole.tsx |

---

## 4. COMPONENT ARCHITECTURE

### Auth System (`AuthContext.tsx`)
- JWT-based authentication (access + refresh tokens)
- Guest mode fallback via a demo student account (`student@demo.ailab.edu`)
- Auth enforcement toggle (can skip auth for demos)
- Stores tokens in `localStorage`
- Auto-refresh on 401 responses (Axios interceptor)
- User roles: `student`, `teacher`, `admin`

### API Service (`api.ts`)
- Axios instance with JWT interceptor
- Base URL from `VITE_API_URL` env var (default `http://localhost:8000`)
- API modules:
  - `authAPI` — login, register, getMe, updateMe, changePassword, toggleEnforcement
  - `gamesAPI` — getProgress, saveProgress, getAllProgress
  - `dashboardAPI` — getStats, getRecentProjects, getTeacherDashboard
  - `projectsAPI` — list, create, get, update, delete
  - `datasetsAPI` — list, create, upload, delete
  - `mlAPI` — train, listJobs, getJob, cancelJob, listModels, getModel, predict, deleteModel
  - `execAPI` — run, listSessions, interrupt
  - `activitiesAPI` — list, get, launch
  - `classesAPI` — list, create, get, addStudents, removeStudent
  - `adminAPI` — getStats, listUsers
  - `transpilerAPI` — toPython, toJavaScript

### Layout Components
- `Layout.tsx` — wraps all authenticated routes with Sidebar + Header + `<Outlet />`
- `Header.tsx` — user info, notifications, search (lucide-react icons)
- `Sidebar.tsx` — navigation links

### Skills Engine (`skillsEngine.ts`)
Evaluates **5 cognitive skills** from game progress data:

| Skill | Description | Source Games |
|-------|-------------|-------------|
| ⚡ **Sharpness** | Precision & accuracy | Train, Colour, Puppy, Bee |
| 🧠 **Critical Thinking** | Logic & planning | Turtle, Bee, Train |
| 🌱 **Patience** | Deliberation & care | Weather plants, Bee, Weather relics |
| 🛡️ **Consistency** | Steadiness & work ethic | All games (total level completions) |
| 🏆 **Perseverance** | Resilience & grit | Bee attempts, Weather animals |

**Levels:** Curious Rookie (0-19) → Growing Explorer (20-49) → Capable Specialist (50-79) → Master Coach (80+)

**Badges:** 15 total (3 stages × 5 skills)

---

## 5. BACKEND API (FastAPI — main.py)

### Database
- **SQLite** with WAL mode
- Tables: `schools`, `users`, `classes`, `class_students`, `projects`, `datasets`, `models`, `activities`, `activity_logs`, `training_jobs`, `game_progress`
- Auto-seeded demo data: Demo School, Admin/Teacher/Student users, sample projects

### Auth
- JWT with bcrypt password hashing (passlib)
- Access token: 60 min expiry
- Refresh token: 7 day expiry
- Guest fallback when auth enforcement is disabled

### API Endpoints

| Category | Endpoints |
|----------|-----------|
| **Health** | `GET /healthz`, `GET /` |
| **Auth** | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`, `PUT /auth/me`, `PUT /auth/password`, `POST /auth/toggle-enforcement`, `GET /auth/enforcement-status` |
| **Games** | `GET /games/progress`, `GET /games/progress/{game_id}`, `POST /games/progress/{game_id}` |
| **Dashboard** | `GET /dashboard/stats`, `GET /dashboard/recent-projects`, `GET /dashboard/teacher` |
| **Projects** | `GET /projects`, `POST /projects`, `GET /projects/{id}`, `PUT /projects/{id}`, `DELETE /projects/{id}` |
| **Datasets** | `GET /projects/{id}/datasets`, `POST /projects/{id}/datasets`, `POST /projects/{id}/datasets/{id}/upload`, `DELETE /projects/{id}/datasets/{id}` |
| **ML Training** | `POST /ml/train`, `GET /ml/jobs`, `GET /ml/jobs/{id}`, `DELETE /ml/jobs/{id}`, `GET /ml/models`, `GET /ml/models/{id}`, `POST /ml/models/{id}/predict`, `DELETE /ml/models/{id}` |
| **Code Execution** | `POST /exec/run`, `GET /exec/sessions`, `POST /exec/sessions/{id}/interrupt` |
| **Transpiler** | `POST /transpiler/to-python`, `POST /transpiler/to-javascript` |
| **Activities** | `GET /activities`, `GET /activities/{id}`, `POST /activities/{id}/launch` |
| **Classes** | `GET /classes`, `POST /classes`, `GET /classes/{id}`, `POST /classes/{id}/students`, `DELETE /classes/{id}/students/{student_id}` |
| **Admin** | `GET /admin/stats`, `GET /admin/users` |

---

## 6. GAMES PRESENT (6 total)

### a) Weather Adventure 🌦️ (React/JSX)
**Files:** `client/src/games/weather/` + duplicate in `game/weather-world/`

- 5 weather states: sunny, rainy, snowy, windy, night
- XP/level/coins progression system (level × 100 XP needed per level)
- Missions tied to weather + creatures
- 5 relics to discover → opens secret weather portal
- 4 legendary islands: Ice Cave (snowy), Moon Observatory (night), Wind Forest (windy), Sun Temple (sunny)
- Collect all 4 legendaries → "Weather Master" final screen
- Click to grow flowers on the map
- Audio system (Web Audio API): playClick, playSuccess, playFailure, playCoin, playPlant, playLevelUp
- Components: Mascot, Character, AnimatedBackground, Butterflies, FloatingClouds, Sun, Rain, Snow, Stars, Leaves, Frog, Snowman, WeatherButton
- Uses framer-motion animations
- Glass-morphism UI with backdrop blur

### b) Bee Flower Path 🐝 (React: `BeeFlowerPath.tsx` + Python: `bee_flower_path.py`)
- Pathfinding game on hexagonal grid
- Guide bee to flowers avoiding obstacles (wind, rain, gates, rocks)
- 10 levels with increasing difficulty
- BFS solver for optimal path comparison
- Draw mode + command block mode

### c) Choo Choo Train Builder 🚂 (React: `TrainBuilder.tsx` + Python: `train_builder.py`)
- Drag & drop train cars in correct blueprint order
- Star rating system (3 stars per level based on accuracy)
- Sound effects (train horn on correct/incorrect)
- 8 levels

### d) Turtle Path 3D 🐢 (React: `TurtlePath.tsx` + Python: `turtle path.py`)
- Queue movement commands (arrows) to guide turtle home
- Avoid floating rock traps
- 5 levels (Meadow → Galaxy)

### e) Feed the Puppy 🐶 (React: `FeedPuppy.tsx` + Python: `feed_puppy.py`)
- Match puppy's dream food from a colorful pile
- Avoid harmful foods (chocolate, grapes, onions)
- 10 levels
- Optional text-to-speech feedback

### f) Colour Magic Machine 🎨 (React: `ColourMagic.tsx` + Python: `colour_magic.py`)
- Mix base colors (RGB/CMY) to match target shades
- Color physics learning
- 10 levels (primary → secondary → tertiary → quaternary)

---

## 7. ML ENVIRONMENT (`MLEnvironment.tsx`)

The most complex page — a full TensorFlow.js ML training studio with **3-column pipeline** layout:

### Supported Project Types
| Type | Description | ML Model |
|------|-------------|----------|
| Image Classifier | Classify images | MobileNet + KNN |
| Object Detection | Detect objects in images | COCO-SSD |
| Pose Classifier | Classify body poses | MoveNet |
| Hand Pose Classifier | Classify hand poses | MoveNet |
| Audio Classifier | Classify sounds | Speech Commands |
| Numbers | Classify data patterns | MobileNet + KNN |
| Text Classifier | Classify text | MobileNet + KNN |

### Pipeline Columns
1. **Classes** — Add/rename classes (colored), upload samples (file picker), capture via webcam/mic with bulk extraction progress bar
2. **Training** — Configurable epochs/batch size/learning rate, accuracy chart (recharts LineChart), simulated training with animated progress
3. **Testing** — Upload or webcam with real-time prediction, confidence bar, pose landmarks overlay, object detection bounding boxes

### Visual Features
- Animated connection lines between columns (react-xarrows)
- Color-coded Xarrows from each class to training node
- Dashed animated arrow from training to testing during training

### Models Loaded
- TensorFlow.js core (`@tensorflow/tfjs`)
- MobileNet v2 (`@tensorflow-models/mobilenet`)
- KNN Classifier (`@tensorflow-models/knn-classifier`)
- Pose Detection — MoveNet (`@tensorflow-models/pose-detection`)
- Speech Commands (`@tensorflow-models/speech-commands`)
- COCO-SSD (`@tensorflow-models/coco-ssd`)

---

## 8. DATA FLOW DIAGRAM

```
User → Browser → React App
                    │
                    ├── AuthContext (JWT tokens in localStorage)
                    │       │
                    │       └── API Service (Axios + interceptors)
                    │               │
                    │               └── FastAPI Backend (Python)
                    │                       │
                    │                       ├── SQLite Database
                    │                       ├── Code Executor (simulated)
                    │                       ├── ML Training (simulated)
                    │                       └── JWT Auth
                    │
                    ├── GameHub → Games (6 games)
                    │       │
                    │       ├── Each game → gamesAPI.saveProgress()
                    │       └── Progress stored in SQLite + localStorage
                    │
                    ├── Dashboard → User Stats
                    ├── ML Environment → TensorFlow.js (client-side ML)
                    ├── Block Editor → Blockly transpiler
                    └── Notebook → Code execution API
```

---

## 9. KEY TECHNOLOGIES

| Layer | Technologies |
|-------|-------------|
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, PostCSS, CSS animations |
| **Routing** | React Router v6 |
| **HTTP Client** | Axios with interceptors |
| **Animations** | Framer Motion |
| **Charts** | Recharts (BarChart, PieChart, LineChart) |
| **Icons** | Lucide React |
| **ML (Client)** | TensorFlow.js, MobileNet, KNN Classifier, MoveNet, Speech Commands, COCO-SSD |
| **Connection Lines** | React Xarrows |
| **UI Components** | ShadCN/ui (clsx + tailwind-merge), custom glass-morphism |
| **Backend** | Python FastAPI |
| **Database** | SQLite (WAL mode, via raw sqlite3) |
| **Auth** | JWT (python-jose), bcrypt (passlib) |
| **Games (Python)** | Tkinter, PIL/Pillow, winsound, pyttsx3 |
| **Audio** | Web Audio API (custom tone generation) |
| **Infrastructure** | Docker, Nginx, Render.com, Netlify, Fly.io |

---

## 10. NOTABLE PATTERNS & DUPLICATIONS

### 🔴 Weather World Duplication
Weather World exists in **two places**:
- `client/src/games/weather/` — **Used** in the routing system (`/games/weather`)
- `game/weather-world/` — Standalone duplicate, NOT used by the main app

The `game/weather-world/` version has unique islands/pages not yet merged into the client version.

### 🔴 Monolithic Backend
`backend/app/main.py` is ~700+ lines with everything in one file:
- Database init + schema
- All API endpoints (auth, projects, ML, games, admin, etc.)
- ML training simulation
- Code execution
- Seed data

No router separation, no middleware, no separate modules.

### 🔴 Game Progress Dual-Storage
Games save progress to **both**:
- `localStorage` (client-side for instant retrieval)
- Backend API via `gamesAPI.saveProgress()` (server-side persistence)

The GameHub fetches from backend but falls back to localStorage.

### 🟡 Skills Engine is Client-Only
Skill ratings & badges are computed entirely on the client side. No backend persistence.

### 🟡 ML Training is Simulated
The backend `run_training_job` just sleeps and generates fake accuracy values. Real TensorFlow.js training happens entirely client-side in `MLEnvironment.tsx`.

### 🟡 No Unit Tests
The codebase has no unit tests. The `backend/tests/` directory exists but is empty.

---

## 11. AREAS FOR IMPROVEMENT (Potential Prompt Ideas)

| Area | Description |
|------|-------------|
| **Backend Modularization** | Split main.py into separate routers (auth.py, projects.py, games.py, ml.py, etc.) |
| **Weather World Dedup** | Merge game/weather-world into client/src/games/weather and reconcile differences |
| **Unit Tests** | Add pytest for backend, Vitest/React Testing Library for frontend |
| **API Error Handling** | Consistent error responses, validation, logging |
| **Loading States & UX** | Skeleton loaders, toast notifications, better error boundaries |
| **Mobile Responsiveness** | Adaptive layouts for phone/tablet |
| **Accessibility** | ARIA labels, keyboard navigation, screen reader support |
| **Internationalization** | i18n support for multi-language |
| **ML Model Persistence** | Save trained models to backend (IndexedDB or cloud storage) |
| **Game Progress Sync** | Resolve localStorage vs API conflicts with proper sync strategy |
| **CI/CD Pipeline** | GitHub Actions for test/lint/deploy |
| **Search & Filter** | Project search, activity filtering by grade/difficulty |
| **Real-time Features** | WebSocket for live ML training progress |
| **Theme System** | Dark mode support |
| **Performance** | Code splitting, lazy loading for games, bundle optimization |
| **Security** | CSRF protection, rate limiting, input sanitization |

---

## 12. DOCKER / DEPLOYMENT

### docker-compose.yml
```yaml
services:
  backend:    # FastAPI on port 8000
  frontend:   # Nginx serving React on port 80
volumes:
  backend-data:  # Persistent SQLite database
```

### render.yaml
- Backend service: Python, uvicorn, free plan
- Deploy to Render.com

### Deployment Configs
- `client/Dockerfile` — Multi-stage React build + Nginx
- `client/nginx.conf` — Nginx reverse proxy to backend
- `client/netlify.toml` — Netlify deployment (SPA with redirects)
- `backend/Dockerfile` — Python + Poetry
- `backend/fly.toml` — Fly.io deployment
- `render.yaml` — Render.com deployment
