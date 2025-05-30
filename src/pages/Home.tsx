import { useNavigate } from 'react-router-dom';
import { FaUserCog } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-700 mb-4">Farm Infinity</h1>
          <p className="text-gray-600">Welcome to Farm Infinity Admin Portal</p>
        </div>

        <div className="space-y-4">
          {/* Admin Login Button */}
          <button
            onClick={() => navigate('/admin-login')}
            className="w-full flex items-center justify-center gap-3 bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition duration-200 shadow-lg hover:shadow-xl"
          >
            <FaUserCog className="text-xl" />
            <span className="text-lg font-medium">Login as Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home; 