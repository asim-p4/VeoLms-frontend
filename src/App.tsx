import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';

import { MainLayout } from './components/layout/MainLayout';
import { AdminLayout } from './components/layout/AdminLayout';

import { HomePage } from './pages/public/HomePage';
import { CoursesPage } from './pages/public/CoursesPage';
import { CourseDetailPage } from './pages/public/CourseDetailPage';

import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';

import { DashboardPage as StudentDashboard } from './pages/student/DashboardPage';
import { WatchLessonPage } from './pages/student/WatchLessonPage';

import { AdminDashboardPage } from './pages/admin/DashboardPage';
import { CourseManagementPage } from './pages/admin/CourseManagementPage';
import { CreateCoursePage } from './pages/admin/CreateCoursePage';

import { useAuthStore } from './store/authStore';

const ProtectedRoute = ({
  requireAdmin = false,
}: { requireAdmin?: boolean }) => {
  const user = useAuthStore((state) => state.user);

  // when user is not login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // when user try to acces admin routes
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:id" element={<CourseDetailPage />} />
        </Route>

        {/* AUTH ROUTES */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* STUDENT ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="dashboard" element={<StudentDashboard />} />
          </Route>

          <Route path="learn/:id" element={<WatchLessonPage />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route path="admin" element={<AdminDashboardPage />} />

            <Route
              path="admin/courses"
              element={<CourseManagementPage />}
            />

            <Route
              path="admin/courses/new"
              element={<CreateCoursePage />}
            />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;