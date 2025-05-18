import { useState, useEffect } from "react";
import { FaUsers, FaUserSecret, FaTachometerAlt, FaChevronRight, FaSignOutAlt } from "react-icons/fa";
import { RiBankFill } from "react-icons/ri";
import { ImUsers } from "react-icons/im";
import { HiMenu, HiX } from "react-icons/hi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IconType } from "react-icons";

interface MenuItem {
  title: string;
  icon: IconType;
  path: string;
  isMain?: boolean;
  items?: {
    title: string;
    icon: IconType;
    path: string;
  }[];
}

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
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
    // Add your logout logic here
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      icon: FaTachometerAlt,
      path: "/dashboard",
      isMain: true
    },
    {
      title: "Users",
      icon: FaUsers,
      path: "",
      items: [
        { title: "Staffs", icon: FaUsers, path: "/staff" },
        { title: "Farmers", icon: FaUsers, path: "/farmers" },
        { title: "FPO", icon: ImUsers, path: "/fpo" },
        { title: "Agent", icon: FaUserSecret, path: "/agent" },
        { title: "Bank Agent", icon: RiBankFill, path: "/bank-agent" }
      ]
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
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-gray-100 transform transition-all duration-300 ease-in-out h-screen lg:h-full overflow-hidden group`}
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
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent p-4 space-y-6 mt-16 lg:mt-0">
            {menuItems.map((section, idx) => (
              <div key={idx} className="relative">
                {section.isMain ? (
                  <Link
                    to={section.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActiveRoute(section.path)
                        ? "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/20"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <section.icon className={`text-xl ${isActiveRoute(section.path) ? "animate-pulse" : ""}`} />
                    <span className="font-medium">{section.title}</span>
                  </Link>
                ) : (
                  <div>
                    <button
                      onClick={() => setActiveSubmenu(activeSubmenu === section.title ? null : section.title)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between px-4 py-2 text-sm font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-200 transition-colors">
                        <span>{section.title}</span>
                        <FaChevronRight className={`transform transition-transform duration-200 ${
                          activeSubmenu === section.title ? "rotate-90" : ""
                        }`} />
                      </div>
                    </button>
                    <div className={`space-y-1 mt-2 transition-all duration-200 ${
                      activeSubmenu === section.title ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
                    }`}>
                      {section.items?.map((item, itemIdx) => (
                        <Link
                          key={itemIdx}
                          to={item.path}
                          className={`flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all duration-200 group/item ${
                            isActiveRoute(item.path)
                              ? "bg-gray-800 text-white"
                              : "text-gray-400 hover:text-gray-100 hover:bg-white/5"
                          }`}
                        >
                          <item.icon className={`text-lg transition-colors duration-200 ${
                            isActiveRoute(item.path) 
                              ? "text-green-500" 
                              : "text-gray-500 group-hover/item:text-gray-300"
                          }`} />
                          <span className="font-medium">{item.title}</span>
                          <FaChevronRight className={`ml-auto text-xs transition-all duration-200 ${
                            isActiveRoute(item.path) 
                              ? "text-green-500 translate-x-1" 
                              : "text-gray-600 group-hover/item:translate-x-1"
                          }`} />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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



