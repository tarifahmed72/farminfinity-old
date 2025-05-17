import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-100">
      <h1 className="text-3xl font-bold">Welcome to FarmInfinity</h1>
      <button onClick={() => navigate("/login-admin")} className="bg-blue-600 px-6 py-2 rounded text-white">Login as Admin</button>
      <button onClick={() => navigate("/login-agent")} className="bg-green-600 px-6 py-2 rounded text-white">Login as Agent</button>
    </div>
  );
};

export default HomePage;
