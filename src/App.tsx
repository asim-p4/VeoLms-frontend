import { useEffect } from 'react';
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
import { EditCoursePage } from './pages/admin/EditCoursePage';
import { StudentsPage } from './pages/admin/StudentsPage';
import { StudentDetailsPage } from './pages/admin/StudentDetailsPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { SettingsPage } from './pages/admin/SettingsPage';

import { useAuthStore } from './store/authStore';

const ProtectedRoute = ({
  allowedRoles,
}: { allowedRoles?: string[] }) => {
  const { user, isLoading } = useAuthStore();

  // Show a full-screen spinner while checkAuth is resolving on app boot.
  // Without this guard, the route renders with user=null instantly and redirects to /login
  // before the refresh token exchange has a chance to complete.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  // Not authenticated — redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but lacks required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route element={<MainLayout />}>
            <Route path="dashboard" element={<StudentDashboard />} />
          </Route>

          <Route path="learn/:id" element={<WatchLessonPage />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="admin" element={<AdminDashboardPage />} />
            <Route path="admin/courses" element={<CourseManagementPage />} />
            <Route path="admin/courses/new" element={<CreateCoursePage />} />
            <Route path="admin/courses/:id/edit" element={<EditCoursePage />} />
            <Route path="admin/students" element={<StudentsPage />} />
            <Route path="admin/students/:id" element={<StudentDetailsPage />} />
            <Route path="admin/analytics" element={<AnalyticsPage />} />
            <Route path="admin/settings" element={<SettingsPage />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;