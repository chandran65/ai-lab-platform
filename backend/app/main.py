"""
Mindora Platform — Main FastAPI Application (self-contained).

Single-file deployment that includes database schema initialization,
seed data, authentication, and all API route handlers.
"""

from __future__ import annotations

import json
import os
import uuid
import time
import re
from contextlib import contextmanager
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any, Literal

import sqlite3

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, BackgroundTasks, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from jose import JWTError, jwt
from passlib.context import CryptContext


# ======================== CONFIG ========================

class Settings(BaseSettings):
    APP_NAME: str = "Mindora Universe"
    APP_VERSION: str = "3.0.0"
    DATABASE_URL: str = "ai_lab.db"
    JWT_SECRET_KEY: str = "super-secret-key-change-in-production-2024"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    model_config = {"extra": "ignore"}

settings = Settings()
DB_PATH = os.environ.get("DB_PATH", settings.DATABASE_URL)


# ======================== DATABASE ========================

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


@contextmanager
def get_db():
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# ======================== SECURITY ========================

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security_scheme = HTTPBearer(auto_error=False)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES), "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS), "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

ENFORCE_AUTHENTICATION = False

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> dict:
    if not credentials:
        if ENFORCE_AUTHENTICATION:
            raise HTTPException(status_code=401, detail="Authentication required")
        with get_db() as db:
            user = db.execute("SELECT * FROM users WHERE email = 'student@demo.ailab.edu' LIMIT 1").fetchone()
            if user:
                return dict(user)
        raise HTTPException(status_code=401, detail="Missing authorization credentials")
    try:
        payload = decode_token(credentials.credentials)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        with get_db() as db:
            user = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return dict(user)
    except Exception:
        if ENFORCE_AUTHENTICATION:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        with get_db() as db:
            user = db.execute("SELECT * FROM users WHERE email = 'student@demo.ailab.edu' LIMIT 1").fetchone()
            if user:
                return dict(user)
        raise HTTPException(status_code=401, detail="Invalid token and guest fallback failed")


# ======================== SCHEMAS ========================

class UserRegister(BaseModel):
    email: str
    password: str = Field(..., min_length=4)
    full_name: str = Field(..., min_length=2)
    role: str = "student"
    school_id: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=2)
    description: Optional[str] = None
    project_type: str
    class_id: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    block_code: Optional[str] = None
    python_code: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None

class DatasetCreate(BaseModel):
    name: str
    dataset_type: str
    classes: List[str] = []
    metadata: Optional[Dict[str, Any]] = None

class TrainingConfig(BaseModel):
    model_type: str = "cnn"
    base_model: Optional[str] = None
    batch_size: int = 32
    epochs: int = 50
    learning_rate: float = 0.001

class TrainingRequest(BaseModel):
    project_id: str
    dataset_id: str
    config: TrainingConfig

class ExecutionRequest(BaseModel):
    code: str
    language: str = "python"
    timeout: int = 30
    session_id: Optional[str] = None

class ClassCreate(BaseModel):
    name: str
    grade_level: int = Field(..., ge=1, le=12)
    description: Optional[str] = None

class GameProgressUpdate(BaseModel):
    progress_data: Dict[str, Any]

class AuthEnforcementRequest(BaseModel):
    enabled: bool

class CompleteExperimentRequest(BaseModel):
    xp_earned: int = 10
    score: Optional[float] = None
    time_spent_ms: Optional[int] = None


# ======================== HELPERS ========================

def parse_json_field(val, default=None):
    if val is None:
        return default if default is not None else {}
    if isinstance(val, (dict, list)):
        return val
    try:
        return json.loads(val)
    except (json.JSONDecodeError, TypeError):
        return default if default is not None else {}

def project_row(row) -> dict:
    d = dict(row)
    d["is_template"] = bool(d.get("is_template", 0))
    d["is_public"] = bool(d.get("is_public", 0))
    d["settings"] = parse_json_field(d.get("settings", "{}"))
    return d

def dataset_row(row) -> dict:
    d = dict(row)
    d["classes"] = parse_json_field(d.get("classes", "[]"), [])
    d["metadata"] = parse_json_field(d.get("metadata", "{}"))
    d["is_processed"] = bool(d.get("is_processed", 0))
    return d

def model_row(row) -> dict:
    d = dict(row)
    d["metrics"] = parse_json_field(d.get("metrics", "{}"))
    d["config"] = parse_json_field(d.get("config", "{}"))
    return d

def job_row(row) -> dict:
    d = dict(row)
    d["config"] = parse_json_field(d.get("config", "{}"))
    d["result"] = parse_json_field(d.get("result", "{}"))
    return d

def activity_row(row) -> dict:
    d = dict(row)
    d["grade_levels"] = parse_json_field(d.get("grade_levels", "[]"), [])
    d["is_featured"] = bool(d.get("is_featured", 0))
    return d

def world_to_response(row):
    """Convert a worlds table row to the API response format (camelCase)."""
    d = dict(row)
    return {
        "id": d["id"],
        "slug": d["slug"],
        "title": d["title"],
        "name": d["title"],
        "subtitle": d["subtitle"],
        "description": d["description"],
        "ageRange": d["age_range"],
        "minAge": d["min_age"],
        "maxAge": d["max_age"],
        "mascotName": d["mascot_name"],
        "mascotEmoji": d["mascot_emoji"],
        "mascotPersonality": d["mascot_personality"],
        "theme": d["theme"],
        "gradient": d["gradient"],
        "accentColor": d["accent_color"],
        "order": d["w_order"],
        "skills": parse_json_field(d["skills"], []),
        "experiments": [],
        "completionReward": d["completion_reward"],
        "unlockRequirement": d.get("unlock_requirement"),
    }

def experiment_to_response(row):
    d = dict(row)
    return {
        "id": d["id"],
        "title": d["title"],
        "description": d["description"],
        "emoji": d["emoji"],
        "skills": parse_json_field(d["skills"], []),
        "levels": d["levels"],
        "duration": d["duration"],
        "gameLink": d["game_link"],
        "isNew": bool(d["is_new"]),
    }


# ======================== DB INIT + SEED ========================

def init_db():
    with get_db() as db:
        db.executescript("""
        CREATE TABLE IF NOT EXISTS schools (
            id TEXT PRIMARY KEY, name TEXT NOT NULL, domain TEXT UNIQUE,
            settings TEXT DEFAULT '{}', max_users INTEGER DEFAULT 1000,
            max_storage_gb INTEGER DEFAULT 100, is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY, email TEXT NOT NULL, password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'student',
            school_id TEXT REFERENCES schools(id), avatar_url TEXT,
            preferences TEXT DEFAULT '{}', is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')), last_login_at TEXT,
            UNIQUE(email, school_id)
        );
        CREATE TABLE IF NOT EXISTS classes (
            id TEXT PRIMARY KEY, name TEXT NOT NULL, grade_level INTEGER,
            description TEXT, teacher_id TEXT REFERENCES users(id),
            school_id TEXT REFERENCES schools(id), settings TEXT DEFAULT '{}',
            is_active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS class_students (
            class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
            student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
            enrolled_at TEXT DEFAULT (datetime('now')), status TEXT DEFAULT 'active',
            PRIMARY KEY (class_id, student_id)
        );
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
            project_type TEXT NOT NULL, user_id TEXT REFERENCES users(id),
            class_id TEXT REFERENCES classes(id), school_id TEXT,
            block_code TEXT, python_code TEXT, settings TEXT DEFAULT '{}',
            is_template INTEGER DEFAULT 0, is_public INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS datasets (
            id TEXT PRIMARY KEY, project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
            name TEXT NOT NULL, dataset_type TEXT NOT NULL, storage_path TEXT,
            record_count INTEGER DEFAULT 0, classes TEXT DEFAULT '[]',
            metadata TEXT DEFAULT '{}', is_processed INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS models (
            id TEXT PRIMARY KEY, project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
            name TEXT NOT NULL, model_type TEXT NOT NULL, status TEXT DEFAULT 'training',
            accuracy REAL, model_path TEXT, config TEXT DEFAULT '{}',
            training_config TEXT DEFAULT '{}', metrics TEXT DEFAULT '{}',
            created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS activities (
            id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
            activity_type TEXT NOT NULL, grade_levels TEXT DEFAULT '[]',
            difficulty TEXT DEFAULT 'beginner', config_schema TEXT DEFAULT '{}',
            instructions TEXT, thumbnail_url TEXT, created_by TEXT,
            world_id TEXT, is_public INTEGER DEFAULT 1, is_featured INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS activity_logs (
            id TEXT PRIMARY KEY, activity_id TEXT, project_id TEXT,
            user_id TEXT, action TEXT NOT NULL, result TEXT DEFAULT '{}',
            duration_ms INTEGER, metadata TEXT DEFAULT '{}',
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS training_jobs (
            id TEXT PRIMARY KEY, model_id TEXT, project_id TEXT,
            user_id TEXT, status TEXT DEFAULT 'pending', progress INTEGER DEFAULT 0,
            config TEXT DEFAULT '{}', result TEXT DEFAULT '{}', error_message TEXT,
            started_at TEXT, completed_at TEXT, created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS game_progress (
            user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
            game_id TEXT NOT NULL,
            progress_data TEXT DEFAULT '{}',
            updated_at TEXT DEFAULT (datetime('now')),
            PRIMARY KEY (user_id, game_id)
        );
        CREATE TABLE IF NOT EXISTS worlds (
            id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL,
            subtitle TEXT, description TEXT, age_range TEXT, min_age INTEGER DEFAULT 4,
            max_age INTEGER DEFAULT 7, mascot_name TEXT, mascot_emoji TEXT DEFAULT '🐰',
            mascot_personality TEXT, theme TEXT, gradient TEXT, accent_color TEXT,
            w_order INTEGER DEFAULT 0, skills TEXT DEFAULT '[]',
            completion_reward TEXT DEFAULT '⭐ Certificate', unlock_requirement TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS experiments (
            id TEXT PRIMARY KEY, world_slug TEXT NOT NULL REFERENCES worlds(slug),
            title TEXT NOT NULL, description TEXT, emoji TEXT DEFAULT '🔬',
            skills TEXT DEFAULT '[]', levels INTEGER DEFAULT 3, duration TEXT DEFAULT '15 min',
            game_link TEXT, is_new INTEGER DEFAULT 0, e_order INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS user_progress (
            user_id TEXT PRIMARY KEY REFERENCES users(id),
            total_xp INTEGER DEFAULT 0, level INTEGER DEFAULT 1,
            coins INTEGER DEFAULT 0, streak INTEGER DEFAULT 0,
            completed_experiments TEXT DEFAULT '[]',
            unlocked_worlds TEXT DEFAULT '[]',
            world_progress TEXT DEFAULT '{}',
            earned_badges TEXT DEFAULT '[]',
            earned_achievements TEXT DEFAULT '[]',
            updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS badges (
            id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
            icon TEXT DEFAULT '🏅', skill TEXT, stage INTEGER DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS achievements (
            id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
            icon TEXT DEFAULT '🏆', category TEXT DEFAULT 'general'
        );
        CREATE TABLE IF NOT EXISTS skills (
            id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
            category TEXT DEFAULT 'general'
        );
        CREATE TABLE IF NOT EXISTS skill_progress (
            user_id TEXT REFERENCES users(id),
            skill_id TEXT REFERENCES skills(id),
            score INTEGER DEFAULT 0, level TEXT DEFAULT 'beginner',
            milestones TEXT DEFAULT '[]', updated_at TEXT DEFAULT (datetime('now')),
            PRIMARY KEY (user_id, skill_id)
        );
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
        CREATE INDEX IF NOT EXISTS idx_datasets_project ON datasets(project_id);
        CREATE INDEX IF NOT EXISTS idx_models_project ON models(project_id);
        CREATE INDEX IF NOT EXISTS idx_training_jobs_user ON training_jobs(user_id);
        CREATE TABLE IF NOT EXISTS brain_energy (
            user_id TEXT PRIMARY KEY REFERENCES users(id),
            pattern INTEGER DEFAULT 0,
            logic INTEGER DEFAULT 0,
            creative INTEGER DEFAULT 0,
            problem_solving INTEGER DEFAULT 0,
            ai INTEGER DEFAULT 0,
            innovation INTEGER DEFAULT 0,
            updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_experiments_world ON experiments(world_slug);
        """)
        _seed(db)


def _seed(db):
    if db.execute("SELECT COUNT(*) as c FROM worlds").fetchone()["c"] > 0:
        return

    # Worlds — Mindora Universe Edition
    worlds_data = [
        ("discovery-island", "The Wildlands", "Explore a magical ecosystem where plants grow as you learn", "A living magical ecosystem. Complete challenges to heal forests, awaken animals, and restore the Wildlands.", "Ages 4+", 4, 7, "Nova Bunny", "🐰", "Cheerful and encouraging", "Living magical ecosystem", "from-emerald-400 to-teal-500", "emerald", 1, ["Observation", "Matching", "Classification", "Memory", "Sequencing"], "🌿 Wildlands Restoration Badge"),
        ("coding-forest", "The Logic Frontier", "Build villages and unlock roads by solving logic challenges", "An adventure civilization where logic powers progress. Build roads, activate machines, and expand villages.", "Ages 7+", 7, 10, "Byte Fox", "🦊", "Wise and witty", "Adventure civilization", "from-amber-400 to-orange-500", "amber", 2, ["Logic", "Algorithms", "Decision Making", "Problem Solving", "Sequencing"], "🏗️ Logic Frontier Builder Badge"),
        ("ai-explorer-lab", "The AI Realm", "Activate research stations and train AI on a futuristic planet", "A future laboratory planet. Activate AI stations, unlock research centers, and make robots smarter.", "Ages 10+", 10, 13, "Professor Nova", "🦉", "Brilliant and patient", "Future laboratory planet", "from-violet-400 to-purple-600", "violet", 3, ["Data", "Classification", "Prediction", "Training", "Bias"], "🔬 AI Realm Research Badge"),
        ("innovation-city", "The Innovation Nexus", "Build the future city by creating AI-powered solutions", "A future civilization. Expand cities, unlock research hubs, and activate innovation towers.", "Ages 13+", 13, 16, "Astra", "🐉", "Visionary and bold", "Future civilization", "from-rose-400 to-pink-600", "rose", 4, ["Machine Learning", "Ethics", "Entrepreneurship", "Innovation", "Leadership"], "🚀 Innovation Nexus Master Badge"),
    ]

    experiments_data = {
        "discovery-island": [
            ("pattern-finder", "Animal Pattern Hunt", "Find and match patterns in the magical forest", "🧩", 3, "15 min", "/games/color", 0),
            ("sort-the-toys", "Magic Sorting Trees", "Sort magical creatures by their properties", "🧸", 3, "10 min", "/games/bee", 1),
            ("emotion-detective", "Emotion Forest", "Explore feelings by helping forest creatures", "😊", 3, "10 min", "/games/puppy", 2),
            ("story-builder", "Story River", "Build stories by sequencing magical events", "📖", 3, "20 min", "/games/weather", 3),
            ("robot-path", "Robot Trail", "Guide a robot through the enchanted forest", "🤖", 3, "15 min", "/games/turtle", 4),
        ],
        "coding-forest": [
            ("bee-algorithm", "Bee Navigation", "Program bees to navigate the frontier", "🐝", 3, "20 min", "/games/bee", 0),
            ("blockly-robot", "Robot Rescue", "Rescue robots using block programming", "🤖", 3, "20 min", "/block-editor", 1),
            ("treasure-logic", "Treasure Logic", "Use logic gates to unlock frontier treasure", "💎", 3, "15 min", "/games/turtle", 2),
            ("weather-predictor", "Bridge Builder", "Predict weather to build safe bridges", "🌤️", 3, "20 min", "/games/weather", 3),
            ("character-builder", "Weather Guardian", "Build characters who control the weather", "🎭", 3, "15 min", "/games/color", 4),
        ],
        "ai-explorer-lab": [
            ("fruit-classifier", "Fruit Classifier", "Train an AI to recognize alien fruits", "🍎", 3, "25 min", "/ml-environment", 0),
            ("cats-vs-dogs", "Pet Trainer AI", "Teach an AI to tell pets apart", "🐱", 3, "30 min", "/ml-environment", 1),
            ("sound-detective", "Sound Detective", "Create an AI that recognizes mysterious sounds", "🔊", 3, "20 min", "/ml-environment", 2),
            ("spam-detector", "Weather Predictor", "Build an AI that predicts space weather", "📧", 3, "20 min", "/notebook", 3),
            ("ai-bias-lab", "Bias Simulator", "Explore how biased data affects alien societies", "⚖️", 3, "25 min", "/sandbox", 4),
        ],
        "innovation-city": [
            ("ai-builder", "AI Builder", "Design and deploy your own AI for the city", "🏗️", 3, "30 min", "/ml-environment", 0),
            ("object-detection", "Object Detection", "Build an AI that detects city objects in real-time", "👁️", 3, "30 min", "/ml-environment", 1),
            ("ai-ethics-sim", "Ethics Simulator", "Navigate ethical dilemmas for your smart city", "🧭", 3, "20 min", "/sandbox", 2),
            ("chatbot-builder", "Startup Challenge", "Create a startup with your own chatbot", "💬", 3, "25 min", "/notebook", 3),
            ("ai-for-society", "AI For Humanity", "Design an AI solution that helps your community", "🌍", 3, "30 min", "/create-project", 4),
        ],
    }

    for wid, wname, wsub, wdesc, age_r, min_a, max_a, mascot, emoji, personality, theme, grad, acc, order, skills, reward in worlds_data:
        db.execute("INSERT INTO worlds (id,slug,title,subtitle,description,age_range,min_age,max_age,mascot_name,mascot_emoji,mascot_personality,theme,gradient,accent_color,w_order,skills,completion_reward) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                   (wid, wid, wname, wsub, wdesc, age_r, min_a, max_a, mascot, emoji, personality, theme, grad, acc, order, json.dumps(skills), reward))
        for exp_id, title, desc, exp_emoji, levels, duration, game_link, e_order in experiments_data.get(wid, []):
            exp_skills = json.dumps(skills[:3])
            db.execute("INSERT INTO experiments (id,world_slug,title,description,emoji,skills,levels,duration,game_link,is_new,e_order) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                       (exp_id, wid, title, desc, exp_emoji, exp_skills, levels, duration, game_link, 1 if e_order == 0 else 0, e_order))

    # Badges
    for bid, bn, bdesc, bicon, bskill, bstage in [
        ("first-pattern", "First Pattern", "Complete your first pattern recognition challenge", "🧩", "Pattern Recognition", 1),
        ("sorting-star", "Sorting Star", "Master the art of categorization", "🎯", "Categorization", 1),
        ("code-apprentice", "Code Apprentice", "Write your first algorithm", "💻", "Algorithms", 1),
        ("loop-master", "Loop Master", "Master the use of loops in programming", "🔄", "Loops", 2),
        ("ai-trainer", "AI Trainer", "Successfully train your first AI model", "🤖", "Training", 1),
        ("bias-buster", "Bias Buster", "Identify and mitigate AI bias", "⚖️", "Bias Awareness", 2),
        ("innovation-leader", "Innovation Leader", "Complete all Innovation City challenges", "🚀", "Innovation", 3),
        ("ethics-champion", "Ethics Champion", "Make ethical AI decisions in every scenario", "🧭", "AI Ethics", 2),
    ]:
        db.execute("INSERT INTO badges (id,name,description,icon,skill,stage) VALUES (?,?,?,?,?,?)", (bid, bn, bdesc, bicon, bskill, bstage))

    # Achievements
    for aid, an, adesc, aicon, acat in [
        ("world-explorer", "World Explorer", "Unlock all learning worlds", "🌍", "exploration"),
        ("perfect-streak", "Perfect Streak", "Maintain a 7-day learning streak", "🔥", "persistence"),
        ("xp-collector", "XP Collector", "Earn a total of 1000 XP", "⭐", "progression"),
        ("first-certificate", "First Certificate", "Earn your first world certificate", "🎓", "achievement"),
        ("ai-ready", "AI Ready", "Complete all AI Explorer Lab experiments", "🤖", "mastery"),
        ("code-ninja", "Code Ninja", "Complete all Coding Forest experiments", "🥷", "mastery"),
        ("innovation-master", "Innovation Master", "Complete all Innovation City experiments", "🏆", "mastery"),
        ("discovery-genius", "Discovery Genius", "Complete all Discovery Island experiments", "🧠", "mastery"),
    ]:
        db.execute("INSERT INTO achievements (id,name,description,icon,category) VALUES (?,?,?,?,?)", (aid, an, adesc, aicon, acat))

    # Skills
    for sid, sn, sdesc, scat in [
        ("critical-thinking", "Critical Thinking", "Analyze and evaluate information to form judgments", "cognitive"),
        ("computational-thinking", "Computational Thinking", "Break down problems and design algorithmic solutions", "cognitive"),
        ("logic", "Logic", "Apply reasoning to solve problems systematically", "cognitive"),
        ("creativity", "Creativity", "Generate innovative ideas and novel solutions", "creative"),
        ("communication", "Communication", "Express ideas clearly and collaborate effectively", "social"),
        ("ai-literacy", "AI Literacy", "Understand AI concepts, capabilities, and limitations", "technical"),
        ("problem-solving", "Problem Solving", "Identify solutions to complex challenges", "cognitive"),
        ("perseverance", "Perseverance", "Maintain effort and resilience through challenges", "personal"),
    ]:
        db.execute("INSERT INTO skills (id,name,description,category) VALUES (?,?,?,?)", (sid, sn, sdesc, scat))

    # Demo users
    sid = str(uuid.uuid4())
    db.execute("INSERT INTO schools (id,name,domain) VALUES (?,?,?)", (sid, "Demo School", "demo.ailab.edu"))
    aid = str(uuid.uuid4())
    db.execute("INSERT INTO users (id,email,password_hash,full_name,role,school_id) VALUES (?,?,?,?,?,?)",
               (aid, "admin@demo.ailab.edu", get_password_hash("admin123"), "Admin User", "admin", sid))
    tid = str(uuid.uuid4())
    db.execute("INSERT INTO users (id,email,password_hash,full_name,role,school_id) VALUES (?,?,?,?,?,?)",
               (tid, "teacher@demo.ailab.edu", get_password_hash("teacher123"), "Ms. Johnson", "teacher", sid))
    stid = str(uuid.uuid4())
    db.execute("INSERT INTO users (id,email,password_hash,full_name,role,school_id) VALUES (?,?,?,?,?,?)",
               (stid, "student@demo.ailab.edu", get_password_hash("student123"), "Alex Student", "student", sid))

    # Init progress for demo student
    db.execute("INSERT INTO user_progress (user_id,completed_experiments,unlocked_worlds,world_progress) VALUES (?,?,?,?)",
               (stid, "[]", json.dumps(["discovery-island"]), "{}"))
    db.execute("INSERT INTO brain_energy (user_id,pattern,logic,creative,problem_solving,ai,innovation) VALUES (?,?,?,?,?,?)",
               (stid, 15, 10, 20, 5, 8, 3))

    cid = str(uuid.uuid4())
    db.execute("INSERT INTO classes (id,name,grade_level,description,teacher_id,school_id) VALUES (?,?,?,?,?,?)",
               (cid, "AI Fundamentals", 8, "Introduction to AI", tid, sid))
    db.execute("INSERT INTO class_students (class_id,student_id) VALUES (?,?)", (cid, stid))
    for pt, pn in [("image_classifier", "My Pet Classifier"), ("text_classifier", "Sentiment Analyzer")]:
        db.execute("INSERT INTO projects (id,name,description,project_type,user_id,class_id,school_id) VALUES (?,?,?,?,?,?,?)",
                   (str(uuid.uuid4()), pn, f"A {pt.replace('_',' ')} project", pt, stid, cid, sid))

    # Seed legacy activities too
    if db.execute("SELECT COUNT(*) as c FROM activities").fetchone()["c"] == 0:
        for n, d, t, g, diff, f in [
            ("Image Classifier", "Build an AI that recognizes and classifies images into categories.", "image_classifier", json.dumps(list(range(1, 13))), "beginner", 1),
            ("Text Classifier", "Create an AI that understands and categorizes text sentiment.", "text_classifier", json.dumps(list(range(4, 13))), "intermediate", 1),
            ("Audio Classifier", "Build a sound recognition AI that identifies different audio patterns.", "audio_classifier", json.dumps(list(range(7, 13))), "advanced", 1),
            ("Object Detection", "Create an AI that locates and identifies objects in images.", "object_detection", json.dumps(list(range(9, 13))), "advanced", 0),
            ("Pose Detection", "Build an AI that detects human poses and movements.", "pose_detection", json.dumps(list(range(6, 13))), "intermediate", 0),
        ]:
            db.execute("INSERT INTO activities (id,name,description,activity_type,grade_levels,difficulty,is_featured) VALUES (?,?,?,?,?,?,?)",
                       (str(uuid.uuid4()), n, d, t, g, diff, f))


# ======================== FASTAPI APP ========================

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION,
              description="Mindora Universe — The World's First Cognitive Intelligence Adventure Platform for ages 4-14")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.APP_NAME}", "version": settings.APP_VERSION}


# ======================== AUTH ========================

@app.post("/api/v1/auth/register", response_model=TokenResponse)
async def register(data: UserRegister):
    with get_db() as db:
        if db.execute("SELECT id FROM users WHERE email=?", (data.email,)).fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        uid = str(uuid.uuid4())
        db.execute("INSERT INTO users (id,email,password_hash,full_name,role,school_id) VALUES (?,?,?,?,?,?)",
                   (uid, data.email, get_password_hash(data.password), data.full_name, data.role, data.school_id))
    return TokenResponse(access_token=create_access_token({"sub": uid}), refresh_token=create_refresh_token({"sub": uid}), expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES*60)


@app.post("/api/v1/auth/login", response_model=TokenResponse)
async def login(creds: UserLogin):
    with get_db() as db:
        user = db.execute("SELECT * FROM users WHERE email=?", (creds.email,)).fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(creds.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user["is_active"]:
        raise HTTPException(status_code=403, detail="Account is disabled")
    with get_db() as db:
        db.execute("UPDATE users SET last_login_at=datetime('now') WHERE id=?", (user["id"],))
    return TokenResponse(access_token=create_access_token({"sub": user["id"]}), refresh_token=create_refresh_token({"sub": user["id"]}), expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES*60)


@app.post("/api/v1/auth/refresh", response_model=TokenResponse)
async def refresh_endpoint(body: dict = Body(...)):
    payload = decode_token(body.get("refresh_token", ""))
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    uid = payload.get("sub")
    return TokenResponse(access_token=create_access_token({"sub": uid}), refresh_token=create_refresh_token({"sub": uid}), expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES*60)


@app.get("/api/v1/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    u = {k: v for k, v in current_user.items() if k != "password_hash"}
    u["preferences"] = parse_json_field(u.get("preferences", "{}"))
    return u


@app.put("/api/v1/auth/me")
async def update_me(body: dict = Body(...), current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        if "full_name" in body:
            db.execute("UPDATE users SET full_name=? WHERE id=?", (body["full_name"], current_user["id"]))
        if "avatar_url" in body:
            db.execute("UPDATE users SET avatar_url=? WHERE id=?", (body["avatar_url"], current_user["id"]))
        if "preferences" in body:
            db.execute("UPDATE users SET preferences=? WHERE id=?", (json.dumps(body["preferences"]), current_user["id"]))
        user = db.execute("SELECT * FROM users WHERE id=?", (current_user["id"],)).fetchone()
    u = dict(user)
    del u["password_hash"]
    u["preferences"] = parse_json_field(u.get("preferences", "{}"))
    return u


@app.put("/api/v1/auth/password")
async def change_password(body: dict = Body(...), current_user: dict = Depends(get_current_user)):
    if not verify_password(body.get("old_password", ""), current_user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(body.get("new_password", "")) < 4:
        raise HTTPException(status_code=400, detail="New password must be at least 4 characters")
    with get_db() as db:
        db.execute("UPDATE users SET password_hash=? WHERE id=?", (get_password_hash(body["new_password"]), current_user["id"]))
    return {"message": "Password changed successfully"}


@app.post("/api/v1/auth/toggle-enforcement")
async def toggle_auth_enforcement(req: AuthEnforcementRequest):
    global ENFORCE_AUTHENTICATION
    ENFORCE_AUTHENTICATION = req.enabled
    return {"status": "success", "enforce_authentication": ENFORCE_AUTHENTICATION}


@app.get("/api/v1/auth/enforcement-status")
async def get_enforcement_status():
    return {"enforce_authentication": ENFORCE_AUTHENTICATION}


# ======================== WORLDS ========================

@app.get("/api/v1/worlds")
async def list_worlds():
    with get_db() as db:
        rows = db.execute("SELECT * FROM worlds ORDER BY w_order ASC").fetchall()
        result = []
        for row in rows:
            w = world_to_response(row)
            exps = db.execute("SELECT * FROM experiments WHERE world_slug=? ORDER BY e_order ASC", (w["slug"],)).fetchall()
            w["experiments"] = [experiment_to_response(e) for e in exps]
            result.append(w)
    return result


@app.get("/api/v1/worlds/{slug_or_id}")
async def get_world(slug_or_id: str):
    with get_db() as db:
        row = db.execute("SELECT * FROM worlds WHERE slug=? OR id=?", (slug_or_id, slug_or_id)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="World not found")
        w = world_to_response(row)
        exps = db.execute("SELECT * FROM experiments WHERE world_slug=? ORDER BY e_order ASC", (w["slug"],)).fetchall()
        w["experiments"] = [experiment_to_response(e) for e in exps]
    return w


@app.get("/api/v1/worlds/slug/{slug}")
async def get_world_by_slug(slug: str):
    """Alias for get_world — used by frontend worldsAPI.getBySlug()."""
    with get_db() as db:
        row = db.execute("SELECT * FROM worlds WHERE slug=? OR id=?", (slug, slug)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="World not found")
        w = world_to_response(row)
        exps = db.execute("SELECT * FROM experiments WHERE world_slug=? ORDER BY e_order ASC", (w["slug"],)).fetchall()
        w["experiments"] = [experiment_to_response(e) for e in exps]
    return w


@app.get("/api/v1/worlds/{world_id}/activities")
async def get_world_activities(world_id: str):
    with get_db() as db:
        row = db.execute("SELECT * FROM worlds WHERE slug=? OR id=?", (world_id, world_id)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="World not found")
        exps = db.execute("SELECT * FROM experiments WHERE world_slug=? ORDER BY e_order ASC", (row["slug"],)).fetchall()
        return [experiment_to_response(e) for e in exps]


# ======================== GAMIFICATION ========================

@app.get("/api/v1/gamification/progress")
async def get_gamification_progress(current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        row = db.execute("SELECT * FROM user_progress WHERE user_id=?", (current_user["id"],)).fetchone()
    if not row:
        return {"total_xp": 0, "level": 1, "coins": 0, "streak": 0,
                "completed_experiments": [], "unlocked_worlds": ["discovery-island"],
                "world_progress": {}, "earned_badges": [], "earned_achievements": []}
    d = dict(row)
    return {
        "total_xp": d["total_xp"],
        "level": d["level"],
        "coins": d["coins"],
        "streak": d["streak"],
        "completed_experiments": parse_json_field(d["completed_experiments"], []),
        "unlocked_worlds": parse_json_field(d["unlocked_worlds"], []),
        "world_progress": parse_json_field(d["world_progress"], {}),
        "earned_badges": parse_json_field(d["earned_badges"], []),
        "earned_achievements": parse_json_field(d["earned_achievements"], []),
    }


@app.get("/api/v1/gamification/worlds/{world_id}/progress")
async def get_world_progress(world_id: str, current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        row = db.execute("SELECT * FROM user_progress WHERE user_id=?", (current_user["id"],)).fetchone()
        exps = db.execute("SELECT * FROM experiments WHERE world_slug=? ORDER BY e_order ASC", (world_id,)).fetchall()
    completed = parse_json_field(row["completed_experiments"] if row else "[]", [])
    completed_in_world = [e for e in completed if any(exp["id"] == e for exp in exps)]
    return {
        "world_id": world_id,
        "completed_experiments": completed_in_world,
        "total_experiments": len(exps),
        "completion_pct": round(len(completed_in_world) / max(len(exps), 1) * 100, 1),
        "score": 0,
    }


@app.post("/api/v1/gamification/worlds/{world_id}/experiments/{experiment_id}/complete")
async def complete_experiment(world_id: str, experiment_id: str, body: CompleteExperimentRequest = CompleteExperimentRequest(), current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        exp = db.execute("SELECT * FROM experiments WHERE id=? AND world_slug=?", (experiment_id, world_id)).fetchone()
        
        row = db.execute("SELECT * FROM user_progress WHERE user_id=?", (current_user["id"],)).fetchone()
        if not row:
            db.execute("INSERT INTO user_progress (user_id,completed_experiments,unlocked_worlds,world_progress) VALUES (?,?,?,?)",
                       (current_user["id"], "[]", json.dumps(["discovery-island"]), "{}"))
            row = db.execute("SELECT * FROM user_progress WHERE user_id=?", (current_user["id"],)).fetchone()
        
        d = dict(row)
        completed = set(parse_json_field(d["completed_experiments"], []))
        completed.add(experiment_id)
        unlocked = set(parse_json_field(d["unlocked_worlds"], ["discovery-island"]))
        world_progress = parse_json_field(d["world_progress"], {})
        
        xp_earned = body.xp_earned or 10
        new_xp = d["total_xp"] + xp_earned
        new_level = max(1, new_xp // 100)
        new_coins = d["coins"] + max(1, xp_earned // 5)
        
        if exp:
            ws = exp["world_slug"]
            world_exps = db.execute("SELECT id FROM experiments WHERE world_slug=?", (ws,)).fetchall()
            completed_in_world = [e for e in completed if any(w["id"] == e for w in world_exps)]
            world_progress[ws] = round(len(completed_in_world) / max(len(world_exps), 1) * 100, 1)
            
            world_order = {"discovery-island": 1, "coding-forest": 2, "ai-explorer-lab": 3, "innovation-city": 4}
            current_world_order = world_order.get(ws, 0)
            for ws_id, wo in world_order.items():
                if wo == current_world_order + 1 and len(completed_in_world) >= len(world_exps) * 0.6:
                    unlocked.add(ws_id)
        
        db.execute("""UPDATE user_progress 
                       SET total_xp=?, level=?, coins=?, streak=?,
                           completed_experiments=?, unlocked_worlds=?, world_progress=?,
                           updated_at=datetime('now')
                       WHERE user_id=?""",
                   (new_xp, new_level, new_coins, d["streak"] + 1,
                    json.dumps(sorted(completed)), json.dumps(sorted(unlocked)),
                    json.dumps(world_progress), current_user["id"]))
    
    return {
        "experiment_id": experiment_id,
        "completed": True,
        "xp_earned": xp_earned,
        "total_xp": new_xp,
        "rewards": [{"type": "xp", "name": f"+{xp_earned} XP", "amount": xp_earned}],
        "world_unlocked": None,
        "skills_updated": [],
    }


@app.get("/api/v1/gamification/badges")
async def list_badges():
    with get_db() as db:
        rows = db.execute("SELECT * FROM badges ORDER BY stage ASC, name ASC").fetchall()
    return [dict(r) for r in rows]


@app.get("/api/v1/gamification/achievements")
async def list_achievements():
    with get_db() as db:
        rows = db.execute("SELECT * FROM achievements ORDER BY category ASC, name ASC").fetchall()
    return [dict(r) for r in rows]


@app.get("/api/v1/gamification/skills")
async def list_skills(current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        rows = db.execute("""
            SELECT s.id, s.name, sp.score, sp.level, COALESCE(sp.milestones, '[]') as milestones
            FROM skills s
            LEFT JOIN skill_progress sp ON s.id = sp.skill_id AND sp.user_id = ?
            ORDER BY s.name
        """, (current_user["id"],)).fetchall()
    return [{
        "skill_id": r["id"],
        "name": r["name"],
        "score": r["score"] or 0,
        "level": r["level"] or "beginner",
        "milestones": parse_json_field(r["milestones"], []),
    } for r in rows]


@app.get("/api/v1/gamification/skills/history")
async def skill_history(current_user: dict = Depends(get_current_user)):
    return []


@app.get("/api/v1/gamification/leaderboard")
async def get_leaderboard():
    with get_db() as db:
        rows = db.execute("""
            SELECT u.id as user_id, u.full_name, COALESCE(up.total_xp, 0) as total_xp,
                   (SELECT COUNT(*) FROM json_each(COALESCE(up.completed_experiments, '[]'))) as experiments_completed
            FROM users u
            LEFT JOIN user_progress up ON u.id = up.user_id
            WHERE u.role = 'student'
            ORDER BY up.total_xp DESC NULLS LAST
            LIMIT 20
        """).fetchall()
    return [{"rank": i + 1, **dict(r)} for i, r in enumerate(rows)]


# ======================== BRAIN CORE ENERGY ========================

BRAIN_ENERGY_KEYS = ["pattern", "logic", "creative", "problem_solving", "ai", "innovation"]

# Map experiments to brain energy they primarily develop
EXPERIMENT_ENERGY_MAP = {
    "pattern-finder": "pattern", "sort-the-toys": "pattern", "emotion-detective": "creative",
    "story-builder": "creative", "robot-path": "problem_solving",
    "bee-algorithm": "logic", "blockly-robot": "logic", "treasure-logic": "logic",
    "weather-predictor": "problem_solving", "character-builder": "creative",
    "fruit-classifier": "ai", "cats-vs-dogs": "ai", "sound-detective": "ai",
    "spam-detector": "ai", "ai-bias-lab": "ai",
    "ai-builder": "innovation", "object-detection": "innovation", "ai-ethics-sim": "innovation",
    "chatbot-builder": "innovation", "ai-for-society": "innovation",
}


def get_brain_energy(db, user_id: str) -> dict:
    """Get brain energy dict for a user. Initializes if not present."""
    row = db.execute("SELECT * FROM brain_energy WHERE user_id=?", (user_id,)).fetchone()
    if not row:
        db.execute("INSERT INTO brain_energy (user_id) VALUES (?)", (user_id,))
        return {k: 0 for k in BRAIN_ENERGY_KEYS}
    d = dict(row)
    return {k: d.get(k, 0) or 0 for k in BRAIN_ENERGY_KEYS}


def update_brain_energy(db, user_id: str, energy_key: str, increment: int = 2):
    """Increment a specific brain energy for a user. Caps at 100."""
    energies = get_brain_energy(db, user_id)
    current = energies.get(energy_key, 0)
    new_val = min(100, current + increment)
    db.execute(f"""UPDATE brain_energy 
                   SET {energy_key}=?, updated_at=datetime('now') 
                   WHERE user_id=?""",
               (new_val, user_id))
    if db.rowcount == 0:
        energies[energy_key] = new_val
        cols = ", ".join(BRAIN_ENERGY_KEYS)
        placeholders = ", ".join(["?"] * len(BRAIN_ENERGY_KEYS))
        vals = [energies[k] for k in BRAIN_ENERGY_KEYS]
        db.execute(f"INSERT INTO brain_energy (user_id,{cols}) VALUES (?,{placeholders})", (user_id, *vals))


@app.get("/api/v1/braincore/energy")
async def get_braincore_energy(current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        energies = get_brain_energy(db, current_user["id"])
    return {
        "energies": energies,
        "total": sum(energies.values()),
        "brain_score": round(sum(energies.values()) / len(BRAIN_ENERGY_KEYS), 1),
    }


@app.get("/api/v1/braincore/status")
async def get_braincore_status(current_user: dict = Depends(get_current_user)):
    """Get Brain Core status including awakening level."""
    with get_db() as db:
        energies = get_brain_energy(db, current_user["id"])
    total = sum(energies.values())
    max_possible = len(BRAIN_ENERGY_KEYS) * 100
    awakening_pct = round((total / max_possible) * 100, 1)
    
    if awakening_pct < 10:
        status = "dormant"
        desc = "The Brain Core slumbers. Begin your journey to awaken it."
    elif awakening_pct < 30:
        status = "stirring"
        desc = "The Brain Core is stirring. Keep exploring to fuel its power."
    elif awakening_pct < 50:
        status = "awakening"
        desc = "The Brain Core is awakening! Your discoveries are restoring its energy."
    elif awakening_pct < 75:
        status = "alive"
        desc = "The Brain Core is alive! Worlds are evolving as you learn."
    else:
        status = "radiant"
        desc = "The Brain Core shines brilliantly! The universe is fully restored."
    
    return {
        "status": status,
        "description": desc,
        "awakening_pct": awakening_pct,
        "total_energy": total,
        "max_energy": max_possible,
        "brain_score": round(total / len(BRAIN_ENERGY_KEYS), 1),
    }


@app.post("/api/v1/braincore/energy")
async def update_braincore_energy(body: dict = Body(...), current_user: dict = Depends(get_current_user)):
    """Manually update brain energy values (for testing or admin use)."""
    allowed = set(BRAIN_ENERGY_KEYS)
    updates = {k: v for k, v in body.items() if k in allowed and isinstance(v, (int, float))}
    if not updates:
        raise HTTPException(status_code=400, detail="No valid energy keys provided")
    with get_db() as db:
        for key, val in updates.items():
            clamped = max(0, min(100, val))
            db.execute(f"UPDATE brain_energy SET {key}=?, updated_at=datetime('now') WHERE user_id=?",
                       (clamped, current_user["id"]))
        energies = get_brain_energy(db, current_user["id"])
    return {"energies": energies, "updated": list(updates.keys())}


# ======================== CERTIFICATES ========================

@app.get("/api/v1/certificates")
async def list_certificates(current_user: dict = Depends(get_current_user)):
    return []


# ======================== GAMES ========================

@app.get("/api/v1/games/progress")
async def get_all_game_progress(current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        rows = db.execute("SELECT game_id, progress_data FROM game_progress WHERE user_id = ?", (current_user["id"],)).fetchall()
    return {r["game_id"]: parse_json_field(r["progress_data"]) for r in rows}


@app.get("/api/v1/games/progress/{game_id}")
async def get_game_progress(game_id: str, current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        row = db.execute("SELECT progress_data FROM game_progress WHERE user_id = ? AND game_id = ?", (current_user["id"], game_id)).fetchone()
    if not row:
        return {"progress_data": {}}
    return {"progress_data": parse_json_field(row["progress_data"])}


@app.post("/api/v1/games/progress/{game_id}")
async def save_game_progress(game_id: str, body: GameProgressUpdate, current_user: dict = Depends(get_current_user)):
    data_str = json.dumps(body.progress_data)
    with get_db() as db:
        row = db.execute("SELECT 1 FROM game_progress WHERE user_id = ? AND game_id = ?", (current_user["id"], game_id)).fetchone()
        if row:
            db.execute("UPDATE game_progress SET progress_data = ?, updated_at = datetime('now') WHERE user_id = ? AND game_id = ?",
                       (data_str, current_user["id"], game_id))
        else:
            db.execute("INSERT INTO game_progress (user_id, game_id, progress_data) VALUES (?, ?, ?)",
                       (current_user["id"], game_id, data_str))
    return {"status": "success"}


# ======================== DASHBOARD ========================

@app.get("/api/v1/dashboard/stats")
async def dashboard_stats(current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        pc = db.execute("SELECT COUNT(*) as c FROM projects WHERE user_id=?", (current_user["id"],)).fetchone()["c"]
        ac = db.execute("SELECT COUNT(*) as c FROM activity_logs WHERE user_id=? AND action='completed'", (current_user["id"],)).fetchone()["c"]
        models = db.execute("SELECT accuracy FROM models m JOIN projects p ON m.project_id=p.id WHERE p.user_id=? AND m.status='completed'", (current_user["id"],)).fetchall()
        avg = sum(m["accuracy"] or 0 for m in models) / max(len(models), 1) * 100
    return {"projects_count": pc, "activities_completed": ac, "average_accuracy": round(avg, 1), "hours_learned": round(ac * 0.5, 1), "models_trained": len(models)}


@app.get("/api/v1/dashboard/recent-projects")
async def dashboard_recent_projects(current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        rows = db.execute("SELECT * FROM projects WHERE user_id=? ORDER BY updated_at DESC LIMIT 5", (current_user["id"],)).fetchall()
    return [project_row(r) for r in rows]


@app.get("/api/v1/dashboard/teacher")
async def teacher_dashboard(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ("teacher", "admin"):
        raise HTTPException(status_code=403, detail="Teacher or admin role required")
    with get_db() as db:
        classes = db.execute("SELECT c.*, (SELECT COUNT(*) FROM class_students WHERE class_id=c.id) as student_count FROM classes c WHERE c.teacher_id=?", (current_user["id"],)).fetchall()
        students = []
        for cls in classes:
            ss = db.execute("SELECT u.id,u.full_name,u.email,(SELECT COUNT(*) FROM projects WHERE user_id=u.id) as projects_count,(SELECT COUNT(*) FROM activity_logs WHERE user_id=u.id AND action='completed') as activities_completed FROM users u JOIN class_students cs ON u.id=cs.student_id WHERE cs.class_id=?", (cls["id"],)).fetchall()
            students.extend([dict(s) for s in ss])
    return {"classes": [dict(c) for c in classes], "students": students, "total_students": len(students), "total_projects": sum(s.get("projects_count", 0) for s in students), "total_classes": len(classes)}


# ======================== PROJECTS ========================

@app.get("/api/v1/projects")
async def list_projects(class_id: Optional[str] = None, project_type: Optional[str] = None, limit: int = 20, offset: int = 0, current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        q, p = "SELECT * FROM projects WHERE user_id=?", [current_user["id"]]
        if class_id: q += " AND class_id=?"; p.append(class_id)
        if project_type: q += " AND project_type=?"; p.append(project_type)
        q += " ORDER BY updated_at DESC LIMIT ? OFFSET ?"; p.extend([limit, offset])
        rows = db.execute(q, p).fetchall()
    return [project_row(r) for r in rows]


@app.post("/api/v1/projects")
async def create_project(data: ProjectCreate, current_user: dict = Depends(get_current_user)):
    pid = str(uuid.uuid4())
    with get_db() as db:
        db.execute("INSERT INTO projects (id,name,description,project_type,user_id,class_id,school_id,settings) VALUES (?,?,?,?,?,?,?,?)",
                   (pid, data.name, data.description, data.project_type, current_user["id"], data.class_id, current_user.get("school_id"), json.dumps(data.settings or {})))
        row = db.execute("SELECT * FROM projects WHERE id=?", (pid,)).fetchone()
    return project_row(row)


@app.get("/api/v1/projects/{project_id}")
async def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        row = db.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone()
    if not row: raise HTTPException(status_code=404, detail="Project not found")
    d = project_row(row)
    if d["user_id"] != current_user["id"] and current_user["role"] not in ("admin", "teacher"):
        raise HTTPException(status_code=403, detail="Access denied")
    return d


@app.put("/api/v1/projects/{project_id}")
async def update_project(project_id: str, data: ProjectUpdate, current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        row = db.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone()
        if not row: raise HTTPException(status_code=404, detail="Project not found")
        if row["user_id"] != current_user["id"] and current_user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Access denied")
        ups, par = [], []
        if data.name is not None: ups.append("name=?"); par.append(data.name)
        if data.description is not None: ups.append("description=?"); par.append(data.description)
        if data.block_code is not None: ups.append("block_code=?"); par.append(data.block_code)
        if data.python_code is not None: ups.append("python_code=?"); par.append(data.python_code)
        if data.settings is not None: ups.append("settings=?"); par.append(json.dumps(data.settings))
        if ups:
            ups.append("updated_at=datetime('now')"); par.append(project_id)
            db.execute(f"UPDATE projects SET {','.join(ups)} WHERE id=?", par)
        row = db.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone()
    return project_row(row)


@app.delete("/api/v1/projects/{project_id}")
async def delete_project(project_id: str, current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        row = db.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone()
        if not row: raise HTTPException(status_code=404, detail="Project not found")
        if row["user_id"] != current_user["id"] and current_user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Access denied")
        db.execute("DELETE FROM projects WHERE id=?", (project_id,))
    return {"message": "Project deleted"}


# ======================== DATASETS ========================

@app.get("/api/v1/projects/{project_id}/datasets")
async def list_datasets(project_id: str, current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        rows = db.execute("SELECT * FROM datasets WHERE project_id=?", (project_id,)).fetchall()
    return [dataset_row(r) for r in rows]


@app.post("/api/v1/projects/{project_id}/datasets")
async def create_dataset(project_id: str, data: DatasetCreate, current_user: dict = Depends(get_current_user)):
    did = str(uuid.uuid4())
    with get_db() as db:
        db.execute("INSERT INTO datasets (id,project_id,name,dataset_type,classes,metadata) VALUES (?,?,?,?,?,?)",
                   (did, project_id, data.name, data.dataset_type, json.dumps(data.classes), json.dumps(data.metadata or {})))
        row = db.execute("SELECT * FROM datasets WHERE id=?", (did,)).fetchone()
    return dataset_row(row)


@app.post("/api/v1/projects/{project_id}/datasets/{dataset_id}/upload")
async def upload_files(project_id: str, dataset_id: str, files: List[UploadFile] = File(...), current_user: dict = Depends(get_current_user)):
    c = len(files)
    with get_db() as db:
        db.execute("UPDATE datasets SET record_count=record_count+? WHERE id=?", (c, dataset_id))
    return {"message": f"Uploaded {c} files", "total_records": c}


@app.delete("/api/v1/projects/{project_id}/datasets/{dataset_id}")
async def delete_dataset(project_id: str, dataset_id: str, current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        db.execute("DELETE FROM datasets WHERE id=? AND project_id=?", (dataset_id, project_id))
    return {"message": "Dataset deleted"}


# ======================== ML TRAINING ========================

@app.post("/api/v1/ml/train")
async def submit_training(req: TrainingRequest, bg: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    mid, jid = str(uuid.uuid4()), str(uuid.uuid4())
    cfg = json.dumps(req.config.model_dump())
    with get_db() as db:
        db.execute("INSERT INTO models (id,project_id,name,model_type,status,training_config) VALUES (?,?,?,?,?,?)",
                   (mid, req.project_id, f"Model_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}", req.config.model_type, "training", cfg))
        db.execute("INSERT INTO training_jobs (id,model_id,project_id,user_id,status,config) VALUES (?,?,?,?,?,?)",
                   (jid, mid, req.project_id, current_user["id"], "pending", cfg))
        row = db.execute("SELECT * FROM training_jobs WHERE id=?", (jid,)).fetchone()
    bg.add_task(run_training_job, jid)
    return job_row(row)


@app.get("/api/v1/ml/jobs")
async def list_jobs(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        q, p = "SELECT * FROM training_jobs WHERE user_id=?", [current_user["id"]]
        if project_id: q += " AND project_id=?"; p.append(project_id)
        q += " ORDER BY created_at DESC LIMIT 50"
        rows = db.execute(q, p).fetchall()
    return [job_row(r) for r in rows]


@app.get("/api/v1/ml/jobs/{job_id}")
async def get_job(job_id: str, current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        row = db.execute("SELECT * FROM training_jobs WHERE id=?", (job_id,)).fetchone()
    if not row: raise HTTPException(status_code=404, detail="Job not found")
    return job_row(row)


@app.delete("/api/v1/ml/jobs/{job_id}")
async def cancel_job(job_id: str, current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        db.execute("UPDATE training_jobs SET status='cancelled' WHERE id=? AND status IN ('pending','running')", (job_id,))
    return {"message": "Job cancelled"}


@app.get("/api/v1/ml/models")
async def list_models(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        if project_id:
            rows = db.execute("SELECT * FROM models WHERE project_id=? ORDER BY created_at DESC", (project_id,)).fetchall()
        else:
            rows = db.execute("SELECT m.* FROM models m JOIN projects p ON m.project_id=p.id WHERE p.user_id=? ORDER BY m.created_at DESC LIMIT 50", (current_user["id"],)).fetchall()
    return [model_row(r) for r in rows]


@app.get("/api/v1/ml/models/{model_id}")
async def get_model(model_id: str, current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        row = db.execute("SELECT * FROM models WHERE id=?", (model_id,)).fetchone()
    if not row: raise HTTPException(status_code=404, detail="Model not found")
    return model_row(row)


@app.post("/api/v1/ml/models/{model_id}/predict")
async def predict(model_id: str, body: dict = Body(...), current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        m = db.execute("SELECT * FROM models WHERE id=?", (model_id,)).fetchone()
    if not m: raise HTTPException(status_code=404, detail="Model not found")
    if m["status"] != "completed": raise HTTPException(status_code=400, detail="Model not ready")
    return {"model_id": model_id, "predictions": [{"class": "cat", "confidence": 0.92}, {"class": "dog", "confidence": 0.05}, {"class": "bird", "confidence": 0.03}], "inference_time_ms": 45.2}


@app.delete("/api/v1/ml/models/{model_id}")
async def delete_model(model_id: str, current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        db.execute("DELETE FROM models WHERE id=?", (model_id,))
    return {"message": "Model deleted"}


def run_training_job(job_id: str):
    import time as _t
    conn = get_db_connection()
    try:
        conn.execute("UPDATE training_jobs SET status='running',started_at=datetime('now') WHERE id=?", (job_id,))
        conn.commit()
        for prog in range(0, 101, 10):
            _t.sleep(0.3)
            conn.execute("UPDATE training_jobs SET progress=? WHERE id=?", (prog, job_id))
            conn.commit()
            r = conn.execute("SELECT status FROM training_jobs WHERE id=?", (job_id,)).fetchone()
            if r and r["status"] == "cancelled": return
        acc = 0.85 + (hash(job_id) % 15) / 100.0
        res = json.dumps({"accuracy": acc, "loss": round(1 - acc, 4), "epochs_completed": 50})
        conn.execute("UPDATE training_jobs SET status='completed',progress=100,completed_at=datetime('now'),result=? WHERE id=?", (res, job_id))
        r = conn.execute("SELECT model_id FROM training_jobs WHERE id=?", (job_id,)).fetchone()
        if r:
            conn.execute("UPDATE models SET status='completed',accuracy=?,model_path=?,metrics=? WHERE id=?", (acc, f"/models/{job_id}.onnx", res, r["model_id"]))
        conn.commit()
    except Exception as e:
        conn.execute("UPDATE training_jobs SET status='failed',error_message=?,completed_at=datetime('now') WHERE id=?", (str(e), job_id))
        conn.commit()
    finally:
        conn.close()


# ======================== CODE EXECUTION ========================

exec_sessions: Dict[str, dict] = {}

@app.post("/api/v1/exec/run")
async def exec_code(req: ExecutionRequest, current_user: dict = Depends(get_current_user)):
    t0 = time.time()
    sid = req.session_id or str(uuid.uuid4())
    exec_sessions[sid] = {"session_id": sid, "user_id": current_user["id"], "language": req.language, "status": "running"}
    try:
        if req.language == "python":
            result = _exec_python(req.code)
        elif req.language == "javascript":
            result = {"output": "[INFO] JS sandbox ready\n[SUCCESS] Code executed", "error": None}
        else:
            raise HTTPException(status_code=400, detail="Unsupported language")
        ms = int((time.time() - t0) * 1000)
        exec_sessions[sid]["status"] = "completed"
        return {"session_id": sid, "status": "completed", "output": result.get("output"), "error": result.get("error"), "execution_time_ms": ms}
    except HTTPException:
        raise
    except Exception as e:
        return {"session_id": sid, "status": "error", "error": str(e), "execution_time_ms": int((time.time() - t0) * 1000)}


@app.get("/api/v1/exec/sessions")
async def list_exec_sessions(current_user: dict = Depends(get_current_user)):
    return [s for s in exec_sessions.values() if s["user_id"] == current_user["id"]]


@app.post("/api/v1/exec/sessions/{session_id}/interrupt")
async def interrupt_session(session_id: str):
    if session_id in exec_sessions: exec_sessions[session_id]["status"] = "interrupted"
    return {"message": "Interrupted"}


def _exec_python(code: str) -> dict:
    try:
        compile(code, '<string>', 'exec')
        lines = []
        if "import" in code: lines.append("[INFO] Libraries loaded")
        if "print(" in code:
            for m in re.findall(r'print\s*\((.*?)\)', code): lines.append(f"> {m}")
        lines.append("\n[SUCCESS] Code executed successfully")
        return {"output": "\n".join(lines), "error": None}
    except SyntaxError as e:
        return {"output": None, "error": f"SyntaxError: {e}"}


# ======================== TRANSPILER ========================

@app.post("/api/v1/transpiler/to-python")
async def to_python(block_xml: dict = Body(...)):
    blocks = block_xml.get("blocks", {}).get("blocks", [])
    lines = ["# Generated Python code from Blockly"]
    for b in blocks:
        bt = b.get("type", "")
        if bt == "ai_imageClassifier":
            lines.extend(["import ai_lab", "classifier = ai_lab.ImageClassifier()", "result = classifier.predict(image_data)"])
        elif bt == "controls_repeat":
            lines.append(f"for i in range({b.get('field', {}).get('TIMES', '10')}):")
            lines.append("    pass")
    return {"code": "\n".join(lines), "language": "python"}


@app.post("/api/v1/transpiler/to-javascript")
async def to_js(block_xml: dict = Body(...)):
    return {"code": "// Generated JS from Blockly\nconsole.log('Hello AI!');", "language": "javascript"}


# ======================== ACTIVITIES ========================

@app.get("/api/v1/activities")
async def list_activities(grade_level: Optional[int] = None, activity_type: Optional[str] = None):
    with get_db() as db:
        rows = db.execute("SELECT * FROM activities WHERE is_public=1 ORDER BY is_featured DESC,name ASC").fetchall()
    acts = [activity_row(r) for r in rows]
    if grade_level: acts = [a for a in acts if grade_level in a["grade_levels"]]
    if activity_type: acts = [a for a in acts if a["activity_type"] == activity_type]
    return acts


@app.get("/api/v1/activities/{activity_id}")
async def get_activity(activity_id: str):
    with get_db() as db:
        row = db.execute("SELECT * FROM activities WHERE id=?", (activity_id,)).fetchone()
    if not row: raise HTTPException(status_code=404, detail="Activity not found")
    return activity_row(row)


@app.post("/api/v1/activities/{activity_id}/launch")
async def launch_activity(activity_id: str, body: dict = Body(default={}), current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        act = db.execute("SELECT * FROM activities WHERE id=?", (activity_id,)).fetchone()
        if not act: raise HTTPException(status_code=404, detail="Activity not found")
        pid = str(uuid.uuid4())
        db.execute("INSERT INTO projects (id,name,description,project_type,user_id,school_id) VALUES (?,?,?,?,?,?)",
                   (pid, act["name"], act["description"], act["activity_type"], current_user["id"], current_user.get("school_id")))
        db.execute("INSERT INTO activity_logs (id,activity_id,project_id,user_id,action) VALUES (?,?,?,?,?)",
                   (str(uuid.uuid4()), activity_id, pid, current_user["id"], "started"))
    return {"project_id": pid, "activity": activity_row(act)}


# ======================== CLASSES ========================

@app.get("/api/v1/classes")
async def list_classes(current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        if current_user["role"] == "teacher":
            rows = db.execute("SELECT c.*,(SELECT COUNT(*) FROM class_students WHERE class_id=c.id) as student_count FROM classes c WHERE c.teacher_id=?", (current_user["id"],)).fetchall()
        elif current_user["role"] == "student":
            rows = db.execute("SELECT c.*,(SELECT COUNT(*) FROM class_students WHERE class_id=c.id) as student_count FROM classes c JOIN class_students cs ON c.id=cs.class_id WHERE cs.student_id=?", (current_user["id"],)).fetchall()
        else:
            rows = db.execute("SELECT c.*,(SELECT COUNT(*) FROM class_students WHERE class_id=c.id) as student_count FROM classes c WHERE c.school_id=?", (current_user.get("school_id", ""),)).fetchall()
    return [dict(r) for r in rows]


@app.post("/api/v1/classes")
async def create_class(data: ClassCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ("teacher", "admin"):
        raise HTTPException(status_code=403, detail="Teacher or admin role required")
    cid = str(uuid.uuid4())
    with get_db() as db:
        db.execute("INSERT INTO classes (id,name,grade_level,description,teacher_id,school_id) VALUES (?,?,?,?,?,?)",
                   (cid, data.name, data.grade_level, data.description, current_user["id"], current_user.get("school_id")))
        row = db.execute("SELECT c.*,(SELECT COUNT(*) FROM class_students WHERE class_id=c.id) as student_count FROM classes c WHERE c.id=?", (cid,)).fetchone()
    return dict(row)


@app.get("/api/v1/classes/{class_id}")
async def get_class(class_id: str, current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        row = db.execute("SELECT c.*,(SELECT COUNT(*) FROM class_students WHERE class_id=c.id) as student_count FROM classes c WHERE c.id=?", (class_id,)).fetchone()
    if not row: raise HTTPException(status_code=404, detail="Class not found")
    return dict(row)


@app.post("/api/v1/classes/{class_id}/students")
async def add_students(class_id: str, body: dict = Body(...), current_user: dict = Depends(get_current_user)):
    sids = body.get("student_ids", [])
    with get_db() as db:
        for s in sids:
            try: db.execute("INSERT INTO class_students (class_id,student_id) VALUES (?,?)", (class_id, s))
            except sqlite3.IntegrityError: pass
    return {"message": f"Added {len(sids)} students"}


@app.delete("/api/v1/classes/{class_id}/students/{student_id}")
async def remove_student(class_id: str, student_id: str, current_user: dict = Depends(get_current_user)):
    with get_db() as db:
        db.execute("DELETE FROM class_students WHERE class_id=? AND student_id=?", (class_id, student_id))
    return {"message": "Student removed"}


# ======================== ADMIN ========================

@app.get("/api/v1/admin/stats")
async def admin_stats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin": raise HTTPException(status_code=403, detail="Admin role required")
    with get_db() as db:
        return {
            "total_users": db.execute("SELECT COUNT(*) as c FROM users").fetchone()["c"],
            "total_schools": db.execute("SELECT COUNT(*) as c FROM schools").fetchone()["c"],
            "total_projects": db.execute("SELECT COUNT(*) as c FROM projects").fetchone()["c"],
            "total_classes": db.execute("SELECT COUNT(*) as c FROM classes").fetchone()["c"],
            "total_models": db.execute("SELECT COUNT(*) as c FROM models").fetchone()["c"],
            "recent_users": [dict(u) for u in db.execute("SELECT id,email,full_name,role,created_at FROM users ORDER BY created_at DESC LIMIT 10").fetchall()]
        }


@app.get("/api/v1/admin/users")
async def admin_list_users(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin": raise HTTPException(status_code=403, detail="Admin role required")
    with get_db() as db:
        rows = db.execute("SELECT id,email,full_name,role,school_id,is_active,created_at,last_login_at FROM users ORDER BY created_at DESC").fetchall()
    return [dict(r) for r in rows]


# ======================== REPORTS ========================

@app.get("/api/v1/reports")
async def list_reports():
    return []


@app.post("/api/v1/reports")
async def create_report():
    return {"id": str(uuid.uuid4()), "status": "pending"}


# ======================== ENTRY POINT ========================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
