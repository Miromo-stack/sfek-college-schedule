import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import SchedulePage from './pages/admin/SchedulePage';
import TeachersPage from './pages/admin/TeachersPage';
import StudentsPage from './pages/admin/StudentsPage';
import SubjectsPage from './pages/admin/SubjectsPage';
import ClassroomsPage from './pages/admin/ClassroomsPage';
import GroupsPage from './pages/admin/GroupsPage';
import DepartmentsPage from './pages/admin/DepartmentsPage';
import SemestersPage from './pages/admin/SemestersPage';
import NotificationsPage from './pages/admin/NotificationsPage';
import SettingsPage from './pages/admin/SettingsPage';
import { useAuthStore } from './store/authStore';
import LoadingSpinner from './components/ui/LoadingSpinner';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  const { isAuthenticated, fetchProfile, user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-2xl shadow-primary-500/30 border-2 border-primary-200 dark:border-slate-600 animate-pulse">
            <img src="/sfek-logo.webp" alt="SFEK" className="w-12 h-12 rounded-xl object-contain" />
          </div>
          <LoadingSpinner size="md" className="mt-4" />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: 'var(--toast-bg, #fff)',
            color: 'var(--toast-color, #1f2937)',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="teachers" element={<AdminRoute><TeachersPage /></AdminRoute>} />
          <Route path="students" element={<AdminRoute><StudentsPage /></AdminRoute>} />
          <Route path="subjects" element={<AdminRoute><SubjectsPage /></AdminRoute>} />
          <Route path="classrooms" element={<AdminRoute><ClassroomsPage /></AdminRoute>} />
          <Route path="groups" element={<AdminRoute><GroupsPage /></AdminRoute>} />
          <Route path="departments" element={<AdminRoute><DepartmentsPage /></AdminRoute>} />
          <Route path="semesters" element={<AdminRoute><SemestersPage /></AdminRoute>} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
