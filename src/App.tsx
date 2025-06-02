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
import AgentLogin from './pages/AgentLogin';
import { isAuthenticated, getUserType } from './utils/auth';
import FieldAgentList from './components/FieldAgentList';

// Update ProtectedRoute interface
interface ProtectedRouteProps {
  children: React.ReactNode | ((props: { userType: string }) => React.ReactNode);
  allowedUserTypes?: string[];
}

// ProtectedRoute component
const ProtectedRoute = ({ children, allowedUserTypes = [] }: ProtectedRouteProps) => {
  const userType = getUserType() || 'GUEST'; // Provide a default value

  if (!isAuthenticated()) {
    return <Navigate to="/admin-login" replace />;
  }

  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(userType)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (typeof children === 'function') {
    return <>{children({ userType })}</>;
  }

  return <>{children}</>;
};

// Layout for authenticated pages with sidebar and header
const DashboardLayout = () => {
  const userType = getUserType();
  
  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/admin-login" replace />;
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
          <Route index element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/agent-login" element={<AgentLogin />} />
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
            path="/farmer/:id"
            element={
              <ProtectedRoute allowedUserTypes={['ADMIN', 'AGENT']}>
                <FarmerDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer-application"
            element={
              <ProtectedRoute allowedUserTypes={['ADMIN', 'AGENT']}>
                <FarmerApplication />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
