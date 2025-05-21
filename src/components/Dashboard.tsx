import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaBuilding, FaUserTie } from "react-icons/fa";
import axiosInstance from '../utils/axios';

interface DashboardStats {
  totalFarmers: number;
  totalFPOs: number;
  totalAgents: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalFarmers: 0,
    totalFPOs: 0,
    totalAgents: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [farmersRes, fposRes, agentsRes] = await Promise.all([
          axiosInstance.get("/farmers/?page=1&limit=1"),
          axiosInstance.get("/fpos/?skip=0&limit=1000"),
          axiosInstance.get("/field_agents/?skip=0&limit=1000")
        ]);

        setStats({
          totalFarmers: farmersRes.data.total || 0,
          totalFPOs: fposRes.data.total || 0,
          totalAgents: agentsRes.data.total || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, Admin 👋
          </h1>
          <p className="text-gray-500 mt-2">Glad to see you back!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaUsers className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-600">Total Farmers</h2>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalFarmers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <FaBuilding className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-600">Total FPOs</h2>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalFPOs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <FaUserTie className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-600">Total Agents</h2>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalAgents}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-10">
        
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


// interface CustomJwtPayload extends JwtPayload { realm_access?: { roles: string[]; }; groups?: string[]; }

// const Sidebar = () => { const token = localStorage.getItem("token"); const decoded = token ? jwtDecode<CustomJwtPayload>(token) : null;

// const [isOpen, setIsOpen] = useState(false);

// const isAdmin = decoded?.realm_access?.roles?.includes("administrator"); const isAgent = decoded?.groups?.includes("/Officers/Field Agents");

// return ( <> {/* Mobile Menu Toggle */} <div className="lg:hidden p-4 bg-gray-900 text-white"> <button onClick={() => setIsOpen(!isOpen)} className="text-2xl"> <HiMenu /> </button> </div>

// javascript
// Copy
// Edit
//   {/* Sidebar */}
//   <div
//     className={`${
//       isOpen ? "block" : "hidden"
//     } lg:block bg-gray-900 text-amber-50 w-64 p-4 h-screen space-y-4 fixed lg:static z-50 overflow-y-auto transition-all duration-300`}
//   >
//     {/* Logo */}
//     <div className="mb-6">
//       <a href="/" className="block">
//         <img src="/logo.png" alt="Logo" className="h-12 w-auto mx-auto" />
//       </a>
//     </div>

//     {/* Dashboard */}
//     <div className="font-semibold flex items-center gap-2 py-4 px-2 hover:bg-gray-900 rounded cursor-pointer">
//       <RiDashboardLine />
//       <Link to="/dashboard">Dashboard</Link>
//     </div>

//     {/* Users Section */}
//     {(isAdmin || isAgent) && (
//       <div>
//         <div className="text-sm text-gray-300 uppercase font-bold mt-6 mb-2 px-2">
//           Users
//         </div>
//         <div className="space-y-2 pl-2">
//           {isAdmin && (
//             <>
//               <div className="flex items-center gap-2 px-2 py-2 hover:bg-gray-800 rounded">
//                 <FaUsers />
//                 <Link to="/staff">Staffs</Link>
//               </div>
//               <div className="flex items-center gap-2 px-2 py-2 hover:bg-gray-800 rounded">
//                 <ImUsers />
//                 <Link to="/fpo">FPO</Link>
//               </div>
//               <div className="flex items-center gap-2 px-2 py-2 hover:bg-gray-800 rounded">
//                 <FaUserSecret />
//                 <Link to="/agent">Agent</Link>
//               </div>
//               <div className="flex items-center gap-2 px-2 py-2 hover:bg-gray-800 rounded">
//                 <RiBankFill />
//                 <Link to="/bank-agent">Bank Agent</Link>
//               </div>
//             </>
//           )}
//           {(isAdmin || isAgent) && (
//             <div className="flex items-center gap-2 px-2 py-2 hover:bg-gray-800 rounded">
//               <FaUsers />
//               <Link to="/farmers">Farmers</Link>
//             </div>
//           )}
//         </div>
//       </div>
//     )}

//     {/* Loan Management */}
//     {isAdmin && (
//       <div>
//         <div className="text-sm text-gray-300 uppercase font-bold mt-6 mb-2 px-2">
//           Loan Management
//         </div>
//         <div className="space-y-2 pl-2">
//           <div className="flex items-center gap-2 px-2 py-2 hover:bg-gray-800 rounded">
//             <TbUserSquareRounded />
//             <span>Borrower</span>
//           </div>
//           <div className="flex items-center gap-2 px-2 py-2 hover:bg-gray-800 rounded">
//             <TbCashBanknote />
//             <span>Loan</span>
//           </div>
//         </div>
//       </div>
//     )}
//   </div>
// </>
// ); };

// export default Sidebar;