import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setTokens } from '../utils/auth';
import axios from 'axios';
import { API_CONFIG } from '../config/api';
import { FaSpinner, FaPhone, FaLock, FaArrowLeft } from 'react-icons/fa';

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

      if (response.data?.detail) {
        throw new Error(response.data.detail);
      }

      // Store tokens and navigate
      setTokens(response.data, 'AGENT');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Login</h1>
            <p className="text-gray-600">Login with your phone number</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                  disabled={showOtpInput || loading}
                  required
                />
              </div>
            </div>

            {showOtpInput && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  OTP
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter OTP"
                    maxLength={6}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            )}

            <button
              onClick={showOtpInput ? handleVerifyOtp : handleSendOtp}
              disabled={loading || (!showOtpInput && !phoneNumber) || (showOtpInput && !otp)}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin h-5 w-5" />
                  <span>{showOtpInput ? 'Verifying...' : 'Sending...'}</span>
                </>
              ) : (
                <span>{showOtpInput ? 'Verify OTP' : 'Send OTP'}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center space-x-2 text-green-600 hover:text-green-700 font-medium transition-colors"
              disabled={loading}
            >
              <FaArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 