import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { exchangeCode, isAuthenticated, getUserType } from '../utils/auth';
import { FaSpinner } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Immediately check if user is authenticated
    if (isAuthenticated()) {
      const userType = getUserType();
      if (userType === 'ADMIN') {
        navigate('/dashboard');
      } else if (userType === 'AGENT') {
        navigate('/farmers');
      } else {
        navigate('/admin-login');
      }
      return;
    }

    // If not authenticated, check for code
    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    if (code) {
      // If we have a code, try to exchange it
      exchangeCode(code)
        .then(success => {
          if (success) {
            const userType = getUserType();
            if (userType === 'ADMIN') {
              navigate('/dashboard');
            } else if (userType === 'AGENT') {
              navigate('/farmers');
            } else {
              navigate('/admin-login');
            }
          } else {
            navigate('/admin-login');
          }
        })
        .catch(err => {
          console.error('Authentication error:', err);
          navigate('/admin-login');
        });
    } else {
      // No code and not authenticated, redirect to admin login
      navigate('/admin-login');
    }
  }, [navigate, location]);

  // Show loading state while checking auth/redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <FaSpinner className="h-12 w-12 animate-spin text-green-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2 w-2 bg-green-600 rounded-full"></div>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">Welcome to Farm Infinity</h2>
            <p className="text-gray-600">Initializing your session...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 