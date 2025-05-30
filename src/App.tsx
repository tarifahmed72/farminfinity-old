import "./App.css";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Staff from "./components/Staff";
import Farmers from "./components/Farmers";
import Agent from "./components/Agent";
import BankAgent from "./components/BankAgent";
import FarmerDetails from "./components/FarmerDetails";
import FPO from "./components/FPO";
import FarmerApplication from "./components/FarmerApplication";
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import { isAuthenticated, getUserType, refreshAccessToken } from './utils/auth';
import { useEffect } from 'react';
import FieldAgentList from './components/FieldAgentList';

// Protected Route component with improved auth handling
const ProtectedRoute = ({ children, allowedUserTypes = ['ADMIN', 'AGENT'] }: { children: React.ReactNode, allowedUserTypes?: string[] }) => {
  useEffect(() => {
    // Try to refresh token on protected route mount
    const tryRefreshToken = async () => {
      if (!isAuthenticated()) {
        await refreshAccessToken();
      }
    };
    tryRefreshToken();
  }, []);

  // Check authentication using the auth utility
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const userType = getUserType();
  if (!userType || !allowedUserTypes.includes(userType)) {
    // If user type is not allowed, redirect to appropriate dashboard
    if (userType === 'ADMIN') {
      return <Navigate to="/dashboard" replace />;
    } else if (userType === 'AGENT') {
      return <Navigate to="/farmers" replace />;
    }
    // If unknown user type, redirect to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Layout for authenticated pages with sidebar and header
const DashboardLayout = () => {
  const userType = getUserType();
  
  // If not authenticated, redirect to home
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="flex min-h-screen">
      {userType === 'ADMIN' && <Sidebar />}
      <div className="flex-1">
        <Header />
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

// Layout for authentication pages
const AuthLayout = () => {
  return <Outlet />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes - No Sidebar/Header */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/admin-login" element={<AdminLogin />} />
        </Route>

        {/* Protected Routes - With Sidebar/Header */}
        <Route element={<DashboardLayout />}>
          {/* Admin only routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedUserTypes={['ADMIN']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fpo"
            element={
              <ProtectedRoute allowedUserTypes={['ADMIN']}>
                <FPO />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedUserTypes={['ADMIN']}>
                <Staff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent"
            element={
              <ProtectedRoute allowedUserTypes={['ADMIN']}>
                <Agent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bank-agent"
            element={
              <ProtectedRoute allowedUserTypes={['ADMIN']}>
                <BankAgent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/field-agents"
            element={
              <ProtectedRoute allowedUserTypes={['ADMIN']}>
                <FieldAgentList />
              </ProtectedRoute>
            }
          />

          {/* Routes accessible by both Admin and Agent */}
          <Route
            path="/farmers"
            element={
              <ProtectedRoute allowedUserTypes={['ADMIN', 'AGENT']}>
                <Farmers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmers_details/farmerId/:farmerId/applicationId/:applicationId"
            element={
              <ProtectedRoute allowedUserTypes={['ADMIN', 'AGENT']}>
                <FarmerDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmers_applications/:id"
            element={
              <ProtectedRoute allowedUserTypes={['ADMIN', 'AGENT']}>
                <FarmerApplication />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch all route - redirect to appropriate dashboard */}
        <Route
          path="*"
          element={
            <Navigate to="/" replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
