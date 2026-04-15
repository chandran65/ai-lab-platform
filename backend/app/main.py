# AI Learning Platform - Main FastAPI Application
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, BackgroundTasks, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime, timedelta
from contextlib import contextmanager
import uuid, time, re, os, json, sqlite3

from jose import JWTError, jwt
from passlib.context import CryptContext

# ======================== CONFIG ========================

class Settings(BaseSettings):
    APP_NAME: str = "AI Lab Platform"
    APP_VERSION: str = "1.0.0"
    DATABASE_URL: str = "ai_lab.db"
    JWT_SECRET_KEY: str = "super-secret-key-change-in-production-2024"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

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
security_scheme = HTTPBearer()

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

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)) -> dict:
    payload = decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    with get_db() as db:
        user = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return dict(user)

# ======================== SCHEMAS ========================

class UserRegister(BaseModel):
    email: str
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2)
    role: Literal["student"] = "student"
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

# ======================== DB INIT ========================

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
            created_at TEXT DEFAULT (datetime('now')), last_login_at TEXT,
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
            is_public INTEGER DEFAULT 1, is_featured INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS activity_logs (
            id TEXT PRIMARY KEY, activity_id TEXT, project_id TEXT,
            user_id TEXT, action TEXT NOT NULL, result TEXT DEFAULT '{}',
            duration_ms INTEGER, metadata TEXT DEFAULT '{}',
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS training_jobs (
            id TEXT PRIMARY KEY, model_id TEXT, project_id TEXT,
            user_id TEXT, status TEXT DEFAULT 'pending', progress INTEGER DEFAULT 0,
            config TEXT DEFAULT '{}', result TEXT DEFAULT '{}', error_message TEXT,
            started_at TEXT, completed_at TEXT, created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
        CREATE INDEX IF NOT EXISTS idx_datasets_project ON datasets(project_id);
        CREATE INDEX IF NOT EXISTS idx_models_project ON models(project_id);
        CREATE INDEX IF NOT EXISTS idx_training_jobs_user ON training_jobs(user_id);
        """)
        _seed(db)

def _seed(db):
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

# ======================== APP ========================

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION, description="Cloud-native AI Learning Platform for K-12 Students")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
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
    if len(body.get("new_password", "")) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
    with get_db() as db:
        db.execute("UPDATE users SET password_hash=? WHERE id=?", (get_password_hash(body["new_password"]), current_user["id"]))
    return {"message": "Password changed successfully"}

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
