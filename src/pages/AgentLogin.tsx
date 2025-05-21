import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setTokens } from '../utils/auth';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

export default function AgentLogin() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(`${API_CONFIG.BASE_URL}/send-otp`, {
        phone_number: phoneNumber.trim(),
        user_type: "AGENT"
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data?.detail) {
        throw new Error(response.data.detail);
      }

      setShowOtpInput(true);
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post(`${API_CONFIG.BASE_URL}/verify-otp`, {
        phone_number: phoneNumber.trim(),
        otp: otp.trim(),
        user_type: "AGENT"
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const { data } = response;

      if (!data.access_token) {
        throw new Error('Invalid response from server');
      }

      // Store tokens and user type
      setTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token || '',
        token_type: data.token_type || 'Bearer',
        expires_in: data.expires_in || 3600
      });

      // Store user type
      localStorage.setItem('user_type', 'AGENT');

      // Navigate to the agent's farmers page
      navigate('/farmers');
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setError(err.response?.data?.detail || err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-800 mb-2">Agent Login</h1>
            <p className="text-gray-600">Login with your phone number</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your phone number"
                disabled={showOtpInput || loading}
                required
              />
            </div>

            {showOtpInput && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter OTP"
                  maxLength={6}
                  disabled={loading}
                  required
                />
              </div>
            )}

            <button
              onClick={showOtpInput ? handleVerifyOtp : handleSendOtp}
              disabled={loading || (!showOtpInput && !phoneNumber) || (showOtpInput && !otp)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {showOtpInput ? 'Verifying...' : 'Sending...'}
                </span>
              ) : (
                showOtpInput ? 'Verify OTP' : 'Send OTP'
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
          </div>
        </div>
      </div>
    </div>
  );
} 