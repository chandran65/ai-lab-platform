import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Lazy-loaded pages — split into separate chunks by route
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Activities = lazy(() => import("./pages/Activities"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const BlockEditor = lazy(() => import("./pages/BlockEditor"));
const Notebook = lazy(() => import("./pages/Notebook"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const AdminConsole = lazy(() => import("./pages/AdminConsole"));
const MLEnvironment = lazy(() => import("./pages/MLEnvironment"));
const CreateProject = lazy(() => import("./pages/CreateProject"));
const GameHub = lazy(() => import("./pages/GameHub"));
const Profile = lazy(() => import("./pages/Profile"));
const Certificates = lazy(() => import("./pages/Certificates"));

// Games (also lazy-loaded)
const TrainBuilder = lazy(() => import("./games/train/TrainBuilder"));
const TurtlePath = lazy(() => import("./games/turtle/TurtlePath"));
const WeatherApp = lazy(() => import("./games/weather/App"));
const FeedPuppy = lazy(() => import("./games/puppy/FeedPuppy"));
const ColourMagic = lazy(() => import("./games/color/ColourMagic"));
const BeeFlowerPath = lazy(() => import("./games/bee/BeeFlowerPath"));

// Worlds
const WorldExplorer = lazy(() => import("./features/worlds/pages/WorldExplorer"));
const WorldPage = lazy(() => import("./features/worlds/pages/WorldPage"));

function PageLoading() {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 bg-[#5e2d8b] rounded-full animate-ping opacity-20" />
        <div className="absolute inset-2 border-t-4 border-[#5e2d8b] rounded-full animate-spin" />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Suspense fallback={<PageLoading />}><GameHub /></Suspense>} />
            <Route path="/worlds" element={<Suspense fallback={<PageLoading />}><WorldExplorer /></Suspense>} />
            <Route path="/worlds/:slug" element={<Suspense fallback={<PageLoading />}><WorldPage /></Suspense>} />
            <Route path="/profile" element={<Suspense fallback={<PageLoading />}><Profile /></Suspense>} />
            <Route path="/certificates" element={<Suspense fallback={<PageLoading />}><Certificates /></Suspense>} />
            <Route path="/games/weather" element={<Suspense fallback={<PageLoading />}><WeatherApp /></Suspense>} />
            <Route path="/games/train" element={<Suspense fallback={<PageLoading />}><TrainBuilder /></Suspense>} />
            <Route path="/games/turtle" element={<Suspense fallback={<PageLoading />}><TurtlePath /></Suspense>} />
            <Route path="/games/puppy" element={<Suspense fallback={<PageLoading />}><FeedPuppy /></Suspense>} />
            <Route path="/games/color" element={<Suspense fallback={<PageLoading />}><ColourMagic /></Suspense>} />
            <Route path="/games/bee" element={<Suspense fallback={<PageLoading />}><BeeFlowerPath /></Suspense>} />
            <Route path="/sandbox" element={<Suspense fallback={<PageLoading />}><Dashboard /></Suspense>} />
            <Route path="/activities" element={<Suspense fallback={<PageLoading />}><Activities /></Suspense>} />
            <Route path="/projects" element={<Suspense fallback={<PageLoading />}><Projects /></Suspense>} />
            <Route path="/create-project" element={<Suspense fallback={<PageLoading />}><CreateProject /></Suspense>} />
            <Route path="/projects/:id" element={<Suspense fallback={<PageLoading />}><ProjectDetail /></Suspense>} />
            <Route path="/block-editor" element={<Suspense fallback={<PageLoading />}><BlockEditor /></Suspense>} />
            <Route path="/notebook" element={<Suspense fallback={<PageLoading />}><Notebook /></Suspense>} />
            <Route path="/ml-environment" element={<Suspense fallback={<PageLoading />}><MLEnvironment /></Suspense>} />
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                  <Suspense fallback={<PageLoading />}><TeacherDashboard /></Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Suspense fallback={<PageLoading />}><AdminConsole /></Suspense>
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
