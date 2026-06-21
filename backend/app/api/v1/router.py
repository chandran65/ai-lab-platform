"""Main API v1 router — aggregates all sub-routers."""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.worlds import router as worlds_router
from app.api.v1.activities import router as activities_router
from app.api.v1.gamification import router as gamification_router
from app.api.v1.games import router as games_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.projects import router as projects_router
from app.api.v1.datasets import router as datasets_router
from app.api.v1.ml import router as ml_router
from app.api.v1.exec import router as exec_router
from app.api.v1.classes import router as classes_router
from app.api.v1.certificates import router as certificates_router
from app.api.v1.reports import router as reports_router
from app.api.v1.admin import router as admin_router
from app.api.v1.transpiler import router as transpiler_router

router = APIRouter(prefix="/api/v1")

router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
router.include_router(worlds_router, prefix="/worlds", tags=["Worlds"])
router.include_router(activities_router, prefix="/activities", tags=["Activities"])
router.include_router(gamification_router, prefix="/gamification", tags=["Gamification"])
router.include_router(games_router, prefix="/games", tags=["Games"])
router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
router.include_router(projects_router, prefix="/projects", tags=["Projects"])
router.include_router(datasets_router, tags=["Datasets"])
router.include_router(ml_router, prefix="/ml", tags=["Machine Learning"])
router.include_router(exec_router, prefix="/exec", tags=["Code Execution"])
router.include_router(classes_router, prefix="/classes", tags=["Classes"])
router.include_router(certificates_router, prefix="/certificates", tags=["Certificates"])
router.include_router(reports_router, prefix="/reports", tags=["Reports"])
router.include_router(admin_router, prefix="/admin", tags=["Admin"])
router.include_router(transpiler_router, prefix="/transpiler", tags=["Transpiler"])
