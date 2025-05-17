import { useState } from "react";
import axios from "axios";

const LoginAgent = () => {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const handleSendOtp = async () => {
    await axios.post("https://dev-api.farmeasytechnologies.com/api/send-otp", {
      phone_number: phone,
    });
    setOtpSent(true);
  };

  const handleVerifyOtp = async () => {
    const res = await axios.post("https://dev-api.farmeasytechnologies.com/api/verify-otp", {
      phone_number: phone,
      otp: Number(otp),
      officer: false,
    });

    // save token in localStorage/session and redirect
    localStorage.setItem("token", res.data.token);
    window.location.href = "/dashboard";
  };

  return (
    <div className="p-6">
      {!otpSent ? (
        <>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="border p-2" />
          <button onClick={handleSendOtp} className="bg-blue-600 text-white px-4 py-2 ml-2">Send OTP</button>
        </>
      ) : (
        <>
          <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" className="border p-2" />
          <button onClick={handleVerifyOtp} className="bg-green-600 text-white px-4 py-2 ml-2">Verify</button>
        </>
      )}
    </div>
  );
};

export default LoginAgent;
