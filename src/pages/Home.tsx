import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { exchangeCode, isAuthenticated, getUserType } from '../utils/auth';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // If already authenticated, redirect to appropriate dashboard
        if (isAuthenticated()) {
          const userType = getUserType();
          navigate(userType === 'ADMIN' ? '/dashboard' : '/farmers');
          return;
        }

        // Check for code in URL
        const params = new URLSearchParams(location.search);
        const code = params.get('code');

        if (!code) {
          // No code present, redirect to login
          navigate('/');
          return;
        }

        setIsLoading(true);
        setError(null);
        
        const success = await exchangeCode(code);
        if (success) {
          const userType = getUserType();
          navigate(userType === 'ADMIN' ? '/dashboard' : '/farmers');
        } else {
          setError('Authentication failed. Please try logging in again.');
          setTimeout(() => navigate('/'), 3000); // Redirect after 3 seconds
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setError('An unexpected error occurred during authentication.');
        setTimeout(() => navigate('/'), 3000); // Redirect after 3 seconds
      } finally {
        setIsLoading(false);
      }
    };

    handleAuth();
  }, [navigate, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <FaExclamationTriangle className="h-5 w-5 text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
            <p className="text-sm text-red-500 mt-2">Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <FaSpinner className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
        <p className="text-gray-600">Initializing...</p>
      </div>
    </div>
  );
};

export default Home; 