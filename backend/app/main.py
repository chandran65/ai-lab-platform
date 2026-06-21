"""
Mindora Platform — Main FastAPI Application.

Slimmed-down entry point that includes the refactored API v1 router.
Database initialization and seed data are preserved for backward
compatibility with the existing SQLite schema.
"""

from __future__ import annotations

import json
import os
import uuid
from contextlib import contextmanager

import sqlite3

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings

from app.core.security import get_password_hash


# ── Legacy Settings (kept for DB path and seed data) ──────────────

class LegacySettings(BaseSettings):
    APP_NAME: str = "Mindora"
    APP_VERSION: str = "2.0.0"
    DATABASE_URL: str = "ai_lab.db"

    model_config = {"extra": "ignore"}


settings = LegacySettings()
DB_PATH = os.environ.get("DB_PATH", settings.DATABASE_URL)


# ── Legacy Database (raw sqlite3 for init / seed only) ────────────

def get_db_connection():
    """Return a raw sqlite3 connection (used only during startup init)."""
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


# ── Database Initialization ───────────────────────────────────────

def init_db():
    """Create tables and seed demo data if they don't exist."""
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
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
        CREATE INDEX IF NOT EXISTS idx_datasets_project ON datasets(project_id);
        CREATE INDEX IF NOT EXISTS idx_models_project ON models(project_id);
        CREATE INDEX IF NOT EXISTS idx_training_jobs_user ON training_jobs(user_id);
        """)
        _seed(db)


def _seed(db):
    """Populate the database with demo data on first run."""
    if db.execute("SELECT COUNT(*) as c FROM activities").fetchone()["c"] > 0:
        return

    acts = [
        ("Image Classifier", "Build an AI that recognizes and classifies images into categories.", "image_classifier", json.dumps(list(range(1, 13))), "beginner", 1),
        ("Text Classifier", "Create an AI that understands and categorizes text sentiment.", "text_classifier", json.dumps(list(range(4, 13))), "intermediate", 1),
        ("Audio Classifier", "Build a sound recognition AI that identifies different audio patterns.", "audio_classifier", json.dumps(list(range(7, 13))), "advanced", 1),
        ("Object Detection", "Create an AI that locates and identifies objects in images.", "object_detection", json.dumps(list(range(9, 13))), "advanced", 0),
        ("Pose Detection", "Build an AI that detects human poses and movements.", "pose_detection", json.dumps(list(range(6, 13))), "intermediate", 0),
    ]
    for n, d, t, g, diff, f in acts:
        db.execute("INSERT INTO activities (id,name,description,activity_type,grade_levels,difficulty,is_featured) VALUES (?,?,?,?,?,?,?)",
                   (str(uuid.uuid4()), n, d, t, g, diff, f))

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

    cid = str(uuid.uuid4())
    db.execute("INSERT INTO classes (id,name,grade_level,description,teacher_id,school_id) VALUES (?,?,?,?,?,?)",
               (cid, "AI Fundamentals", 8, "Introduction to AI", tid, sid))
    db.execute("INSERT INTO class_students (class_id,student_id) VALUES (?,?)", (cid, stid))

    for pt, pn in [("image_classifier", "My Pet Classifier"), ("text_classifier", "Sentiment Analyzer")]:
        db.execute("INSERT INTO projects (id,name,description,project_type,user_id,class_id,school_id) VALUES (?,?,?,?,?,?,?)",
                   (str(uuid.uuid4()), pn, f"A {pt.replace('_',' ')} project", pt, stid, cid, sid))


# ── Worlds & Experiments Seed (async via SQLAlchemy) ──────────────

async def seed_worlds_and_experiments():
    """Seed 4 learning worlds, 20 experiments, badges, and achievements.
    
    Called from async startup to avoid RuntimeError from asyncio.run()
    inside a running event loop.
    """
    from app.seed_data import seed_database
    
    try:
        counts = await seed_database()
        print(f"  + Worlds/experiments seeded: {counts}")
    except Exception as e:
        print(f"  - World seed skipped: {e}")


# ── FastAPI Application ───────────────────────────────────────────

app = FastAPI(
    title="Mindora",
    version="2.0.0",
    description="AI & Computational Thinking Platform for K-12 Students",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the refactored API v1 router (clean architecture)
from app.api.v1.router import router as api_v1_router
app.include_router(api_v1_router)


@app.on_event("startup")
async def startup():
    """Initialize database tables and seed data on application startup."""
    init_db()
    await seed_worlds_and_experiments()


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.get("/")
async def root():
    from app.core.config import get_settings as get_mindora_settings
    cfg = get_mindora_settings()
    return {"message": f"Welcome to {cfg.APP_NAME}", "version": cfg.APP_VERSION}
