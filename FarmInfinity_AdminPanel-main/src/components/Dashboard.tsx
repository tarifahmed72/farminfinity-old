import  { useState, useEffect } from "react";

import { Loader2 } from "lucide-react";

const Dashboard = () => {

  
  const [farmerCount, setFarmerCount] = useState<number | null>(25);
  const [fpoCount, setFpoCount] = useState<number | null>(null);
  const [agentCount, setAgentCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initKeycloak = async () => {
      try {
       
        const token = localStorage.getItem("keycloak-token")

        // Fetch counts
        const [farmers, fpos, agents] = await Promise.all([
          fetch("https://dev-api.farmeasytechnologies.com/api/farmers/?page=1&limit=1", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }).then(res => res.json()), // <-- COMMA here, not semicolon
          
          fetch("https://dev-api.farmeasytechnologies.com/api/fpos/?skip=0&limit=1000", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }).then(res => res.json()),
        
          fetch("https://dev-api.farmeasytechnologies.com/api/field_agents/?skip=0&limit=1000", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }).then(res => res.json()),
        ]);
        
        console.log(farmers)
        setFarmerCount(farmers.total || 0);
        console.log(fpos)
        setFpoCount(fpos.length || 0);
        console.log(agents)
        setAgentCount(agents.length || 0);
      } catch (error) {
        console.error("Failed to initialize Keycloak or fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

   initKeycloak()
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-100 p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Total Farmers</h2>
            <p className="text-3xl font-bold">{farmerCount ?? "N/A"}</p>
          </div>

          <div className="bg-green-100 p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-green-800 mb-2">Total FPOs</h2>
            <p className="text-3xl font-bold">{fpoCount ?? "N/A"}</p>
          </div>

          <div className="bg-purple-100 p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-purple-800 mb-2">Total Field Agents</h2>
            <p className="text-3xl font-bold">{agentCount ?? "N/A"}</p>
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