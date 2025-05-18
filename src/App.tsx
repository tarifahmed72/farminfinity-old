import "./App.css";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Staff from "./components/Staff";
import Farmers from "./components/Farmers";
import Agent from "./components/Agent";
import BankAgent from "./components/BankAgent";
import FarmerDetails from "./components/FarmerDetails";
import FPO from "./components/FPO";
import FarmerApplication from "./components/FarmerApplication";

function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
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
