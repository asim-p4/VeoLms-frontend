import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/courses" element={<MainLayout><CoursesPage /></MainLayout>} />
        <Route path="/courses/:id" element={<MainLayout><CourseDetailPage /></MainLayout>} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Student Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><StudentDashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/learn/:id" element={<ProtectedRoute><WatchLessonPage /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout><AdminDashboardPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/courses" element={<ProtectedRoute requireAdmin><AdminLayout><CourseManagementPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/courses/new" element={<ProtectedRoute requireAdmin><AdminLayout><CreateCoursePage /></AdminLayout></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
