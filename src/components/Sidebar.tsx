import { useState, useEffect } from "react";
import { FaUsers, FaUserSecret, FaTachometerAlt, FaSignOutAlt } from "react-icons/fa";
import { RiBankFill, RiOrganizationChart } from "react-icons/ri";
import { HiMenu, HiX } from "react-icons/hi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IconType } from "react-icons";

interface MenuItem {
  title: string;
  icon: IconType;
  path: string;
  description?: string;
}

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close sidebar on route change in mobile view
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const isActiveRoute = (route: string) => {
    return location.pathname === route || location.pathname.startsWith(route + '/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      icon: FaTachometerAlt,
      path: "/dashboard",
      description: "Overview & Analytics"
    },
    {
      title: "Staff Management",
      icon: FaUsers,
      path: "/staff",
      description: "Manage Staff Members"
    },
    {
      title: "Farmers",
      icon: FaUsers,
      path: "/farmers",
      description: "Farmer Database"
    },
    {
      title: "FPO",
      icon: RiOrganizationChart,
      path: "/fpo",
      description: "Producer Organizations"
    },
    {
      title: "Agents",
      icon: FaUserSecret,
      path: "/agent",
      description: "Field Agents"
    },
    {
      title: "Bank Agents",
      icon: RiBankFill,
      path: "/bank-agent",
      description: "Financial Partners"
    }
  ];

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <Link to="/" className="flex items-center space-x-3">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          <span className="font-semibold text-lg">FarmInfinity</span>
        </Link>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 active:scale-95"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-gray-100 transform transition-all duration-300 ease-in-out h-screen lg:h-full overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="hidden lg:flex items-center space-x-3 p-6 border-b border-gray-800/50">
            <Link to="/" className="flex items-center space-x-3 transition-transform hover:scale-105">
              <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
              <span className="font-semibold text-xl">FarmInfinity</span>
            </Link>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent p-4 space-y-2 mt-16 lg:mt-0">
            {menuItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                  isActiveRoute(item.path)
                    ? "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/20"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg ${
                  isActiveRoute(item.path)
                    ? "bg-white/20"
                    : "bg-gray-800/50 group-hover:bg-gray-800"
                }`}>
                  <item.icon className={`text-xl transition-transform duration-200 ${
                    isActiveRoute(item.path)
                      ? "scale-110"
                      : "group-hover:scale-110"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.title}</p>
                  <p className={`text-xs truncate transition-colors ${
                    isActiveRoute(item.path)
                      ? "text-white/80"
                      : "text-gray-500 group-hover:text-gray-400"
                  }`}>{item.description}</p>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  isActiveRoute(item.path)
                    ? "bg-white scale-100"
                    : "bg-gray-600 scale-0 group-hover:scale-100"
                }`} />
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800/50">
            <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors duration-200">
              <img 
                src="/logo.png" 
                alt="User" 
                className="h-10 w-10 rounded-full ring-2 ring-green-500/20 p-0.5"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">admin@farminfinity.com</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                title="Logout"
              >
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;



