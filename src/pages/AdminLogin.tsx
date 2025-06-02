import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { GiftIcon } from '../components/icons/GiftIcon';
import axios from 'axios';
import { API_CONFIG, USER_TYPES } from '../config/api';
import { setTokens } from '../utils/auth';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', userId.trim());
      formData.append('password', password.trim());
      formData.append('user_type', USER_TYPES.ADMIN);

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.AUTH_ENDPOINTS.LOGIN}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          timeout: API_CONFIG.TIMEOUT
        }
      );

      const { data } = response;
      
      // Store tokens and user type
      setTokens(data, USER_TYPES.ADMIN);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="flex min-h-screen">
        {/* Left side - Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <GiftIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-600">Please enter your details to sign in</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition"
                  placeholder="Enter your user ID"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition"
                    placeholder="Enter your password"
                    minLength={6}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    disabled={isLoading}
                  >
                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin h-5 w-5" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign in'
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full text-green-600 hover:text-green-700 font-medium transition-colors mt-4"
                disabled={isLoading}
              >
                ← Back to Home
              </button>
            </form>
          </div>
        </div>

        {/* Right side - Welcome Image */}
        <div className="hidden md:block w-1/2 bg-[#F2FFF2] p-12">
          <div className="h-full flex flex-col justify-center items-center">
            <h2 className="text-2xl text-gray-800 mb-4">Nice to see you again</h2>
            <h1 className="text-4xl font-bold text-green-600 mb-8">Welcome back</h1>
            <img
              src="/welcome-illustration.svg"
              alt="Welcome illustration"
              className="max-w-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 