
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


import ProtectedRoute from './components/ProtectedRoute'
import Logout from './components/Logout';
import ScrollToTop from './components/ScrollToTop';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFound from './pages/NotFound';
import Home from './pages/Home'
import UserDashboard from './pages/UserDashboard';
import AdminPortal from './pages/AdminPortal';
// App.jsx (add the import)
import Direct from './pages/Direct';
import Broadcast from './pages/Broadcast';

import SystemBanner from './components/SystemBanner';




const App = () => {
  return (
    <Router>

      <ScrollToTop />
      <SystemBanner />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/logout" element={<Logout />} />

        {/* Protected Routes */}
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute allowedRole="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />



        <Route
          path="/broadcast"
          element={
            <ProtectedRoute allowedRole="user">
              <Broadcast />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute allowedRole="user">
              <Direct />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminPortal />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;


