import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminTrainers from './pages/AdminTrainers';
import SheetsPage from './pages/SheetsPage';

function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main style={{
        flex: 1,
        overflowY: 'auto',
        minWidth: 0,
        /* Offset for mobile top bar and bottom nav */
      }}>
        {/* Mobile spacing top */}
        <div className="mobile-spacer-top" style={{ display: 'none', height: 56 }} />
        {children}
        {/* Mobile spacing bottom */}
        <div className="mobile-spacer-bottom" style={{ display: 'none', height: 72 }} />
      </main>
      <style>{`
        @media (max-width: 768px) {
          .mobile-spacer-top { display: block !important; }
          .mobile-spacer-bottom { display: block !important; }
        }
      `}</style>
    </div>
  );
}

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #333', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) }}`}</style>
        <span style={{ color: '#444', fontSize: 13 }}>Loading…</span>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />} />
      <Route path="/dashboard"         element={<ProtectedRoute requiredRole="employee"><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/history" element={<ProtectedRoute requiredRole="employee"><Dashboard /></ProtectedRoute>} />
      <Route path="/admin"             element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/trainers"    element={<ProtectedRoute requiredRole="admin"><AdminTrainers /></ProtectedRoute>} />
      <Route path="/admin/schedule"    element={<ProtectedRoute requiredRole="admin"><AdminTrainers /></ProtectedRoute>} />
      <Route path="/admin/sheets"      element={<ProtectedRoute requiredRole="admin"><SheetsPage /></ProtectedRoute>} />
      <Route path="*"                  element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
