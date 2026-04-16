import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import AIAssistant from './components/AIAssistant';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Modules from './pages/Modules';
import ModuleDetail from './pages/ModuleDetail';
import PhishingSimulation from './pages/PhishingSimulation';
import ThreatAnalysis from './pages/ThreatAnalysis';
import KnowledgeHub from './pages/KnowledgeHub';
import Progress from './pages/Progress';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import './styles/global.css';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      <AIAssistant />
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
      } />
      <Route path="/modules" element={
        <ProtectedRoute><AppLayout><Modules /></AppLayout></ProtectedRoute>
      } />
      <Route path="/modules/:id" element={
        <ProtectedRoute><AppLayout><ModuleDetail /></AppLayout></ProtectedRoute>
      } />
      <Route path="/simulation" element={
        <ProtectedRoute><AppLayout><PhishingSimulation /></AppLayout></ProtectedRoute>
      } />
      <Route path="/threat-analysis" element={
        <ProtectedRoute><AppLayout><ThreatAnalysis /></AppLayout></ProtectedRoute>
      } />
      <Route path="/knowledge-hub" element={
        <ProtectedRoute><AppLayout><KnowledgeHub /></AppLayout></ProtectedRoute>
      } />
      <Route path="/progress" element={
        <ProtectedRoute><AppLayout><Progress /></AppLayout></ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute><AppLayout><Leaderboard /></AppLayout></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute adminOnly><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
