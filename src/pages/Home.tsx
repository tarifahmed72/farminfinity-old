import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { exchangeCodeForToken } from '../utils/auth';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('code');

    if (code) {
      handleCodeExchange(code);
    }
  }, [location]);

  const handleCodeExchange = async (code: string) => {
    const success = await exchangeCodeForToken(code);
    if (success) {
      navigate('/dashboard');
    } else {
      // Handle error - could show an error message
      console.error('Failed to exchange code for token');
    }
  };

  const handleAdminLogin = () => {
    navigate('/admin-login');
  };

  const handleAgentLogin = () => {
    navigate('/agent-login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Farm Infinity</h1>
          <p className="text-gray-600">Choose your login method</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleAdminLogin}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center justify-center"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Login as Admin
          </button>

          <button
            onClick={handleAgentLogin}
            className="w-full bg-white hover:bg-gray-50 text-green-600 font-semibold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out border border-green-200 flex items-center justify-center"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Login as Agent
          </button>
        </div>
      </div>
    </div>
  );
} 