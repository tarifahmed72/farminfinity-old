import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { clearTokens } from '../utils/auth';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearTokens();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm px-6 py-3">
      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <FaSignOutAlt className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header; 