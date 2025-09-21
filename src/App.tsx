import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { useAuthStatus } from '@/hooks/use-api';

import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import Apps from '@/pages/Apps';
import Files from '@/pages/Files';
import UserActivities from '@/pages/admin/UserActivities';

function App() {
  // Enable automatic token refresh
  useAuthStatus();

  return (
    <Routes>
      {/* Full-width landing page without layout */}
      <Route path="/" element={<Landing />} />

      {/* Other routes with layout */}
      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/apps" element={
              <ProtectedRoute>
                <Apps />
              </ProtectedRoute>
            } />

            <Route path="/files" element={
              <ProtectedRoute>
                <Files />
              </ProtectedRoute>
            } />

            {/* Admin-only routes */}
            <Route path="/admin/activities" element={
              <AdminRoute>
                <UserActivities />
              </AdminRoute>
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  );
}

export default App
