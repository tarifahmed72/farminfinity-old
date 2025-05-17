import { useState } from "react";
import { FaUsers, FaUserSecret, FaTachometerAlt, FaChevronRight } from "react-icons/fa";
import { RiBankFill } from "react-icons/ri";
import { ImUsers } from "react-icons/im";
import { HiMenu } from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";
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
  const location = useLocation();

  const isActiveRoute = (route: string) => {
    return location.pathname === route || location.pathname.startsWith(route + '/');
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <HiMenu className="text-2xl" />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 text-gray-100 transform transition-transform duration-200 ease-in-out h-screen lg:h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900`}
      >
        {/* Logo */}
        <div className="hidden lg:block p-6 border-b border-gray-800">
          <Link to="/" className="block">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto mx-auto" />
          </Link>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-4 mt-16 lg:mt-0">
          {menuItems.map((section, idx) => (
            <div key={idx}>
              {section.isMain ? (
                <Link
                  to={section.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActiveRoute(section.path)
                      ? "bg-green-600 text-white shadow-md"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <section.icon className="text-lg" />
                  <span className="font-medium">{section.title}</span>
                </Link>
              ) : (
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
                    {section.title}
                  </div>
                  <div className="space-y-1">
                    {section.items?.map((item, itemIdx) => (
                      <Link
                        key={itemIdx}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group ${
                          isActiveRoute(item.path)
                            ? "bg-gray-800 text-white"
                            : "text-gray-400 hover:text-gray-100 hover:bg-gray-800/50"
                        }`}
                      >
                        <item.icon className={`text-lg ${isActiveRoute(item.path) ? "text-green-500" : "text-gray-500 group-hover:text-gray-300"}`} />
                        <span>{item.title}</span>
                        <FaChevronRight className={`ml-auto text-xs transition-transform ${isActiveRoute(item.path) ? "text-green-500" : "text-gray-600"} group-hover:translate-x-1`} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors">
            <img src="/logo.png" alt="User" className="h-8 w-8 rounded-full bg-gray-700" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">admin@farminfinity.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;



