import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Activities from "./pages/Activities";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import BlockEditor from "./pages/BlockEditor";
import Notebook from "./pages/Notebook";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminConsole from "./pages/AdminConsole";
import MLEnvironment from "./pages/MLEnvironment";
import CreateProject from "./pages/CreateProject";

import GameHub from "./pages/GameHub";
import TrainBuilder from "./games/train/TrainBuilder";
import TurtlePath from "./games/turtle/TurtlePath";
// @ts-ignore
import WeatherApp from "./games/weather/App";
import FeedPuppy from "./games/puppy/FeedPuppy";
import ColourMagic from "./games/color/ColourMagic";
import BeeFlowerPath from "./games/bee/BeeFlowerPath";

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
            <Route path="/dashboard" element={<GameHub />} />
            <Route path="/games/weather" element={<WeatherApp />} />
            <Route path="/games/train" element={<TrainBuilder />} />
            <Route path="/games/turtle" element={<TurtlePath />} />
            <Route path="/games/puppy" element={<FeedPuppy />} />
            <Route path="/games/color" element={<ColourMagic />} />
            <Route path="/games/bee" element={<BeeFlowerPath />} />
            <Route path="/sandbox" element={<Dashboard />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/block-editor" element={<BlockEditor />} />
            <Route path="/notebook" element={<Notebook />} />
            <Route path="/ml-environment" element={<MLEnvironment />} />
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminConsole />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
