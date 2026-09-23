import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedLayout from './components/ProtectedLayout';

import SetupPage from './pages/SetupPage';
import LoginPage from './pages/LoginPage';
import EventHighlightsPage from './pages/EventHighlightsPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import RegistrationsPage from './pages/RegistrationsPage';
import TeachersPage from './pages/TeachersPage';
import SchoolsPage from './pages/SchoolsPage';
import UsersPage from './pages/UsersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import BackupsPage from './pages/BackupsPage';
import SettingsPage from './pages/SettingsPage';
import SystemStatusPage from './pages/SystemStatusPage';
import DisplayPage from './pages/DisplayPage';
import ConnectPage from './pages/ConnectPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public Landing & Public Event Highlights Routes */}
            <Route path="/" element={<EventHighlightsPage />} />
            <Route path="/highlights" element={<EventHighlightsPage />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/display" element={<DisplayPage />} />
            <Route path="/connect" element={<ConnectPage />} />

            {/* Protected Routes (Authentication & RBAC enforced) */}
            <Route element={<ProtectedLayout allowedRoles={['ADMIN', 'REGISTRATION_OPERATOR', 'VIEWER']} />}>
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/registrations" element={<RegistrationsPage />} />
              <Route path="/teachers" element={<TeachersPage />} />
              <Route path="/schools" element={<SchoolsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Route>

            {/* Admin Only Protected Routes */}
            <Route element={<ProtectedLayout allowedRoles={['ADMIN']} />}>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
              <Route path="/backups" element={<BackupsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/system" element={<SystemStatusPage />} />
            </Route>

            {/* Fallback to Event Highlights Landing Page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
