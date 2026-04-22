import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import './styles/global.css';

import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import GoalsPage from './pages/GoalsPage';
import InvestmentsPage from './pages/InvestmentsPage';
import SimulatorPage from './pages/SimulatorPage';
import WealthCoachPage from './pages/WealthCoachPage';
import ChatbotPage from './pages/ChatbotPage';
import TransactionsPage from './pages/TransactionsPage';
import RiskAlertsPage from './pages/RiskAlertsPage';
import ProfilePage from './pages/ProfilePage';
import AggregatorPage from './pages/AggregatorPage';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/onboarding" element={<PrivateRoute><OnboardingPage /></PrivateRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"    element={<DashboardPage />} />
        <Route path="goals"        element={<GoalsPage />} />
        <Route path="investments"  element={<InvestmentsPage />} />
        <Route path="simulator"    element={<SimulatorPage />} />
        <Route path="aggregate"    element={<AggregatorPage />} />
        <Route path="coach"        element={<WealthCoachPage />} />
        <Route path="chat"         element={<ChatbotPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="risk-alerts"  element={<RiskAlertsPage />} />
        <Route path="profile"      element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#131D30',
              color: '#E8F0FE',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '13px',
              backdropFilter: 'blur(20px)',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#0A0E1A' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: '#0A0E1A' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
