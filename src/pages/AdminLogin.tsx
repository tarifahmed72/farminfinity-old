import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden w-full max-w-6xl flex">
        {/* Left side - Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="flex items-center gap-2 mb-8">
            <GiftIcon className="w-8 h-8 text-green-600" />
            <span className="text-xl font-semibold text-gray-800">FarmInfinity</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Log in.</h1>
          <p className="text-gray-600 mb-8">
            Log in with your data that you entered during your registration
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition"
                placeholder="Enter your ID"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition"
                  placeholder="minimum 6 characters"
                  minLength={6}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  disabled={isLoading}
                >
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
                disabled={isLoading}
              >
                Forget password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging in...
                </div>
              ) : (
                'Log in'
              )}
            </button>
          </form>
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