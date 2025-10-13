import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";



const UserDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  return (
    <div>
      <h1>This is the User Dashboard</h1>
      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Logout
      </button>
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">User Dashboard</h1>
      <Link to="/chat" className="underline text-blue-600">Go to Chat</Link>
    </div>
      
      <Link to="/broadcast" className="underline text-blue-600">Open Broadcast</Link>

    </div>
  );
};

export default UserDashboard;
