import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { KnowledgeProvider } from './context/KnowledgeContext';
import { ToastProvider } from './context/ToastContext';
import ScrollToTop from './components/ScrollToTop';
import AuthGuard from './components/AuthGuard';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import Dashboard from './pages/Dashboard';
import KnowledgeBase from './pages/KnowledgeBase';
import AdminPanel from './pages/AdminPanel';
import AdminProfile from './pages/AdminProfile';
import Users from './pages/Users';
import SeedIntelligence from './pages/SeedIntelligence';
import DiseaseIntelligence from './pages/DiseaseIntelligence';
import HistoryReports from './pages/HistoryReports';
import Login from './pages/auth/Login';
import VerifyOTP from './pages/auth/VerifyOTP';
import Signup from './pages/auth/Signup';
import ProfileSetup from './pages/auth/ProfileSetup';
import UserDashboard from './pages/UserDashboard';

function App() {
  return (
    <AuthProvider>
      <KnowledgeProvider>
        <ToastProvider>
          <BrowserRouter>
          <ScrollToTop />
        <Routes>
          <Route path="/" element={<Navigate to="/user" replace />} />
          
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
          </Route>

          {/* User (Farmer) Routes - Protected */}
          <Route element={<AuthGuard allowedRoles={['farmer']} />}>
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<UserDashboard />} />
              <Route path="seed" element={<SeedIntelligence />} />
              <Route path="disease" element={<DiseaseIntelligence />} />
              <Route path="history" element={<HistoryReports />} />
              <Route path="knowledge-base" element={<KnowledgeBase />} />
              <Route path="profile" element={<Users />} />
            </Route>
          </Route>

          {/* Admin Routes - Protected */}
          <Route element={<AuthGuard allowedRoles={['admin', 'researcher']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="management" element={<AdminPanel />} />
              <Route path="knowledge-base" element={<KnowledgeBase />} />
              <Route path="seed-intelligence" element={<SeedIntelligence />} />
              <Route path="disease-intelligence" element={<DiseaseIntelligence />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
        </ToastProvider>
      </KnowledgeProvider>
    </AuthProvider>
  );
}

export default App;
