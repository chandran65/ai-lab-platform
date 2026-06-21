import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken && !error.config._retry) {
        error.config._retry = true;
        try {
          const res = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          localStorage.setItem("access_token", res.data.access_token);
          localStorage.setItem("refresh_token", res.data.refresh_token);
          error.config.headers.Authorization = `Bearer ${res.data.access_token}`;
          return api(error.config);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: { email: string; password: string; full_name: string; role: string }) =>
    api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
  updateMe: (data: Record<string, unknown>) => api.put("/auth/me", data),
  changePassword: (old_password: string, new_password: string) =>
    api.put("/auth/password", { old_password, new_password }),
  toggleEnforcement: (enabled: boolean) => api.post("/auth/toggle-enforcement", { enabled }),
  getEnforcementStatus: () => api.get("/auth/enforcement-status"),
};

export const gamesAPI = {
  getProgress: (gameId: string) => api.get(`/games/progress/${gameId}`),
  saveProgress: (gameId: string, progressData: Record<string, unknown>) =>
    api.post(`/games/progress/${gameId}`, { progress_data: progressData }),
  getAllProgress: () => api.get("/games/progress"),
};

export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
  getRecentProjects: () => api.get("/dashboard/recent-projects"),
  getTeacherOverview: () => api.get("/dashboard/teacher"),
  getTeacherStudents: (classId?: string) => api.get("/dashboard/teacher/students", { params: classId ? { class_id: classId } : {} }),
  getTeacherSkillHeatmap: (classId?: string) => api.get("/dashboard/teacher/skills", { params: classId ? { class_id: classId } : {} }),
  getTeacherPerformance: (classId?: string) => api.get("/dashboard/teacher/performance", { params: classId ? { class_id: classId } : {} }),
  getTeacherGaps: (classId?: string) => api.get("/dashboard/teacher/gaps", { params: classId ? { class_id: classId } : {} }),
  getTeacherReadiness: (classId?: string) => api.get("/dashboard/teacher/readiness", { params: classId ? { class_id: classId } : {} }),
  getTeacherRecommendations: (classId?: string) => api.get("/dashboard/teacher/recommendations", { params: classId ? { class_id: classId } : {} }),
  getTeacherStudentDetail: (studentId: string) => api.get(`/dashboard/teacher/students/${studentId}`),
};

export const projectsAPI = {
  list: (params?: Record<string, string>) => api.get("/projects", { params }),
  create: (data: { name: string; description?: string; project_type: string; class_id?: string }) =>
    api.post("/projects", data),
  get: (id: string) => api.get(`/projects/${id}`),
  update: (id: string, data: Record<string, unknown>) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

export const datasetsAPI = {
  list: (projectId: string) => api.get(`/projects/${projectId}/datasets`),
  create: (projectId: string, data: { name: string; dataset_type: string; classes: string[] }) =>
    api.post(`/projects/${projectId}/datasets`, data),
  upload: (projectId: string, datasetId: string, files: FormData) =>
    api.post(`/projects/${projectId}/datasets/${datasetId}/upload`, files, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (projectId: string, datasetId: string) =>
    api.delete(`/projects/${projectId}/datasets/${datasetId}`),
};

export const mlAPI = {
  train: (data: { project_id: string; dataset_id: string; config: Record<string, unknown> }) =>
    api.post("/ml/train", data),
  listJobs: (projectId?: string) =>
    api.get("/ml/jobs", { params: projectId ? { project_id: projectId } : {} }),
  getJob: (jobId: string) => api.get(`/ml/jobs/${jobId}`),
  cancelJob: (jobId: string) => api.delete(`/ml/jobs/${jobId}`),
  listModels: (projectId?: string) =>
    api.get("/ml/models", { params: projectId ? { project_id: projectId } : {} }),
  getModel: (modelId: string) => api.get(`/ml/models/${modelId}`),
  predict: (modelId: string, inputData: unknown) =>
    api.post(`/ml/models/${modelId}/predict`, { input_data: inputData }),
  deleteModel: (modelId: string) => api.delete(`/ml/models/${modelId}`),
};

export const execAPI = {
  run: (data: { code: string; language?: string; timeout?: number }) =>
    api.post("/exec/run", data),
  listSessions: () => api.get("/exec/sessions"),
  interrupt: (sessionId: string) => api.post(`/exec/sessions/${sessionId}/interrupt`),
};

export const activitiesAPI = {
  list: (params?: Record<string, string | number>) => api.get("/activities", { params }),
  get: (id: string) => api.get(`/activities/${id}`),
  launch: (id: string) => api.post(`/activities/${id}/launch`),
};

export const reportsAPI = {
  getSubscriptions: () => api.get("/reports/subscriptions"),
  createSubscription: (data: { frequency: string; class_id?: string; day_of_week?: number; day_of_month?: number }) =>
    api.post("/reports/subscriptions", data),
  deleteSubscription: (id: string) => api.delete(`/reports/subscriptions/${id}`),
  triggerReport: (classId?: string) =>
    api.post("/reports/trigger", null, { params: classId ? { class_id: classId } : {} }),
};

export const classesAPI = {
  list: () => api.get("/classes"),
  create: (data: { name: string; grade_level: number; description?: string }) =>
    api.post("/classes", data),
  get: (id: string) => api.get(`/classes/${id}`),
  addStudents: (classId: string, studentIds: string[]) =>
    api.post(`/classes/${classId}/students`, { student_ids: studentIds }),
  removeStudent: (classId: string, studentId: string) =>
    api.delete(`/classes/${classId}/students/${studentId}`),
};

export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  listUsers: () => api.get("/admin/users"),
};

export const transpilerAPI = {
  toPython: (blockXml: Record<string, unknown>) => api.post("/transpiler/to-python", blockXml),
  toJavaScript: (blockXml: Record<string, unknown>) => api.post("/transpiler/to-javascript", blockXml),
};

export const worldsAPI = {
  list: () => api.get("/worlds"),
  get: (id: string) => api.get(`/worlds/${id}`),
  getBySlug: (slug: string) => api.get(`/worlds/slug/${slug}`),
  getActivities: (worldId: string) => api.get(`/worlds/${worldId}/activities`),
};

export const certificatesAPI = {
  list: () => api.get("/certificates"),
  get: (id: string) => api.get(`/certificates/${id}`),
  download: (id: string) => api.get(`/certificates/${id}/download`, { responseType: "blob" }),
  generateWorld: (worldId: string) => api.post(`/certificates/generate/world/${worldId}`),
  generateSkill: (skillId: string, score: number) =>
    api.post(`/certificates/generate/skill/${skillId}?score=${score}`),
  generateCourse: (completedWorlds: string[]) =>
    api.post("/certificates/generate/course", completedWorlds),
};

export const gamificationAPI = {
  completeExperiment: (worldId: string, experimentId: string, data?: { xp_earned?: number; time_spent_ms?: number; score?: number }) =>
    api.post(`/gamification/worlds/${worldId}/experiments/${experimentId}/complete`, data ?? {}),
  getProgress: () => api.get("/gamification/progress"),
  getWorldProgress: (worldId: string) => api.get(`/gamification/worlds/${worldId}/progress`),
  getBadges: () => api.get("/gamification/badges"),
  getAchievements: () => api.get("/gamification/achievements"),
  getSkills: () => api.get("/gamification/skills"),
  getSkillHistory: () => api.get("/gamification/skills/history"),
  getLeaderboard: () => api.get("/gamification/leaderboard"),
};

export const braincoreAPI = {
  getEnergy: () => api.get("/braincore/energy"),
  getStatus: () => api.get("/braincore/status"),
  updateEnergy: (data: Record<string, number>) => api.post("/braincore/energy", data),
};

export const companionAPI = {
  getMyCompanion: () => api.get("/companion"),
  getAvailable: () => api.get("/companion/available"),
  selectCompanion: (companionId: string) => api.post("/companion/select", { companion_id: companionId }),
  equipItem: (itemId: string, action: "equip" | "unequip") =>
    api.post("/companion/items/equip", { item_id: itemId, action }),
  getItems: () => api.get("/companion/items"),
  awardXp: (amount: number) => api.post("/companion/xp", { amount }),
};

export default api;
