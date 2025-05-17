import { useState } from "react";
import axios from "axios";

const BASE_URL = 'https://dev-api.farmeasytechnologies.com/api';

const LoginAgent = () => {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      setError("");
      await axios.post(`${BASE_URL}/send-otp`, {
        phone_number: phone,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      setOtpSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP");
      console.error("Error sending OTP:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.post(`${BASE_URL}/verify-otp`, {
        phone_number: phone,
        otp: Number(otp),
        officer: false,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (res.data?.token) {
        localStorage.setItem("keycloak-token", res.data.token);
        window.location.href = "/dashboard";
      } else {
        setError("Invalid response from server");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to verify OTP");
      console.error("Error verifying OTP:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login to FarmInfinity
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="mt-8 space-y-6">
          {!otpSent ? (
            <div className="space-y-4">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter Phone Number"
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                disabled={loading}
              />
              <button
                onClick={handleSendOtp}
                disabled={loading || !phone}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                disabled={loading}
              />
              <button
                onClick={handleVerifyOtp}
                disabled={loading || !otp}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginAgent;
