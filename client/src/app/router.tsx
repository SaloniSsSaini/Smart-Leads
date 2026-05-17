import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { LandingPage } from '../features/landing/pages/LandingPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { VerifyEmailPage } from '../features/auth/pages/VerifyEmailPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { LeadsPage } from '../features/leads/pages/LeadsPage';
import { LeadDetailPage } from '../features/leads/pages/LeadDetailPage';
import { BillingPage } from '../features/billing/pages/BillingPage';
import { KanbanPage } from '../features/leads/pages/KanbanPage';
import { TeamPage } from '../features/team/pages/TeamPage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';
import { AuditPage } from '../features/audit/pages/AuditPage';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/leads', element: <LeadsPage /> },
          { path: '/leads/:id', element: <LeadDetailPage /> },
          { path: '/kanban', element: <KanbanPage /> },
          { path: '/team', element: <TeamPage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/audit', element: <AuditPage /> },
          { path: '/billing', element: <BillingPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
