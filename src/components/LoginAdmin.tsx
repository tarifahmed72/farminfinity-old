import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setTokens } from '../utils/auth';
import axios from 'axios';

const BASE_URL = 'https://dev-api.farmeasytechnologies.com/api';

interface ValidationError {
  type: string;
  loc: string[];
  msg: string;
  input: any;
}

export default function LoginAdmin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!password.trim()) {
      setError('Password is required');
      return false;
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    if (password.trim().length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const formatValidationErrors = (errors: ValidationError[]) => {
    if (!Array.isArray(errors)) return 'Invalid response format';
    return errors.map(err => {
      if (err.loc && err.loc.includes('body')) {
        const field = err.loc[err.loc.length - 1];
        return `${field}: ${err.msg}`;
      }
      return err.msg;
    }).join('\n');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    setError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Create form data using URLSearchParams
      const formData = new URLSearchParams();
      formData.append('username', username.trim());
      formData.append('password', password.trim());
      formData.append('user_type', 'ADMIN');  // Add user type

      // Log the request data for debugging
      console.log('Login Request:', {
        url: `${BASE_URL}/login`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: formData.toString()
      });

      const response = await axios.post(
        `${BASE_URL}/login`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000, // 10 second timeout
        }
      ).catch((err) => {
        if (err.code === 'ECONNABORTED') {
          throw new Error('Login request timed out. Please try again.');
        }
        if (!err.response) {
          throw new Error('Network error. Please check your connection and try again.');
        }
        throw err;
      });

      // Log the response for debugging
      console.log('Login Response:', response.data);

      const { data } = response;

      if (data.access_token) {
        // Store tokens
        setTokens({
          access_token: data.access_token,
          refresh_token: data.refresh_token || '',
          token_type: data.token_type || 'Bearer',
          expires_in: data.expires_in || 3600
        });
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      // Enhanced error logging
      console.error('Login error details:', {
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
        error: err
      });

      // Handle validation errors
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          setError(formatValidationErrors(err.response.data.detail));
        } else {
          setError(err.response.data.detail);
        }
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-800 mb-2">Admin Login</h1>
            <p className="text-gray-600">Login with your credentials</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md whitespace-pre-line">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(''); // Clear error when user types
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your username"
                required
                minLength={3}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(''); // Clear error when user types
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your password"
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full mt-4 text-green-600 hover:text-green-700 font-medium"
              disabled={loading}
            >
              ← Back to Home
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
