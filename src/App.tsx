import "./App.css";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Staff from "./components/Staff";
import Farmers from "./components/Farmers";
import Agent from "./components/Agent";
import BankAgent from "./components/BankAgent";
import FarmerDetails from "./components/FarmerDetails";
import FPO from "./components/FPO";
import FarmerApplication from "./components/FarmerApplication";
import Home from './pages/Home';
import AgentLogin from './pages/AgentLogin';
import AdminLogin from './pages/AdminLogin';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/agent-login" element={<AgentLogin />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/fpo" element={<FPO />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/farmers" element={<Farmers />} />
              <Route path="/agent" element={<Agent />} />
              <Route path="/bank-agent" element={<BankAgent />} />
              <Route
                path="/farmers_details/farmerId/:farmerId/applicationId/:applicationId"
                element={<FarmerDetails />}
              />
              <Route
                path="/farmers_applications/:id"
                element={<FarmerApplication />}
              />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
