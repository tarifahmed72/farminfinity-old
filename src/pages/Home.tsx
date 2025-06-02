import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { exchangeCode, isAuthenticated, getUserType } from '../utils/auth';
import { FaUserCog } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      // If already authenticated, redirect to appropriate dashboard
      if (isAuthenticated()) {
        const userType = getUserType();
        navigate(userType === 'ADMIN' ? '/dashboard' : '/farmers');
        return;
      }

      // Check for code in URL
      const params = new URLSearchParams(location.search);
      const code = params.get('code');

      if (code) {
        setIsLoading(true);
        setError(null);
        
        try {
          const success = await exchangeCode(code);
          if (success) {
            const userType = getUserType();
            navigate(userType === 'ADMIN' ? '/dashboard' : '/farmers');
          } else {
            setError('Failed to authenticate. Please try again.');
          }
        } catch (err) {
          setError('An error occurred during authentication.');
          console.error('Auth error:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleAuth();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-700 mb-4">Farm Infinity</h1>
          <p className="text-gray-600">Welcome to Farm Infinity Admin Portal</p>
        </div>

        {isLoading ? (
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Authenticating...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => navigate('/admin-login')}
              className="w-full flex items-center justify-center gap-3 bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition duration-200 shadow-lg hover:shadow-xl"
            >
              <FaUserCog className="text-xl" />
              <span className="text-lg font-medium">Login as Admin</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 