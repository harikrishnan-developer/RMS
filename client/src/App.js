import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { checkAuth } from './redux/slices/authSlice';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';

// Dashboard Pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import BlockHeadDashboard from './pages/dashboard/BlockHeadDashboard';
import Dashboard from './pages/dashboard/Dashboard';

// Management Pages
import BedsManagement from './pages/management/BedsManagement';
import BlocksManagement from './pages/management/BlocksManagement';
import CourseManagement from './pages/management/CourseManagement';
import RequestsManagement from './pages/management/RequestsManagement';
import RoomsManagement from './pages/management/RoomsManagement';
import SelectRoomForBeds from './pages/management/SelectRoomForBeds';
import UsersManagement from './pages/management/UsersManagement';

// Reports Page
import ReportsPage from './pages/reports/ReportsPage';

// Shared Pages
import NotFound from './pages/NotFound';
import Notifications from './pages/shared/Notifications';
import Profile from './pages/shared/Profile';

// Protected Route Component
const ProtectedRoute = ({ element, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return element;
};

function App() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);
  
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>
        
        {/* Main App Routes */}
        <Route element={<MainLayout />}>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          {/* Dashboard Routes */}
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute element={<Dashboard />} allowedRoles={['systemAdmin', 'admin', 'blockHead']} />} 
          />
          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['admin']} />}
          />
          <Route
            path="/blockhead/dashboard"
            element={<ProtectedRoute element={<BlockHeadDashboard />} allowedRoles={['blockHead']} />}
          />
          
          {/* Management Routes */}
          <Route 
            path="/management/users" 
            element={<ProtectedRoute element={<UsersManagement />} allowedRoles={['systemAdmin']} />} 
          />
          <Route 
            path="/management/blocks" 
            element={<ProtectedRoute element={<BlocksManagement />} allowedRoles={['systemAdmin', 'admin']} />} 
          />
          <Route 
            path="/management/blocks/:blockId/rooms" 
            element={<ProtectedRoute element={<RoomsManagement />} allowedRoles={['systemAdmin', 'admin', 'blockHead']} />} 
          />
           <Route 
            path="/management/rooms" 
            element={<ProtectedRoute element={<RoomsManagement />} allowedRoles={['systemAdmin', 'admin']} />} 
          />
          {/* Route for Course Management (System Admin only) */}
          <Route 
            path="/management/courses" 
            element={<ProtectedRoute element={<CourseManagement />} allowedRoles={['systemAdmin']} />} 
          />
          
          <Route 
            path="/management/select-room-for-beds/:blockId?" 
            element={<ProtectedRoute element={<SelectRoomForBeds />} allowedRoles={['systemAdmin', 'admin', 'blockHead']} />}
          />
          <Route 
            path="/management/beds/:roomId" 
            element={<ProtectedRoute element={<BedsManagement />} allowedRoles={['systemAdmin', 'admin', 'blockHead']} />} 
          />
          <Route 
            path="/management/requests" 
            element={<ProtectedRoute element={<RequestsManagement />} allowedRoles={['systemAdmin', 'admin', 'blockHead']} />} 
          />
          
          {/* Reports Route */}
          <Route 
            path="/reports" 
            element={<ProtectedRoute element={<ReportsPage />} allowedRoles={['systemAdmin', 'admin']} />}
          />
          
          {/* Shared Routes */}
          <Route 
            path="/profile" 
            element={<ProtectedRoute element={<Profile />} allowedRoles={['systemAdmin', 'admin', 'blockHead']} />} 
          />
          <Route 
            path="/notifications" 
            element={<ProtectedRoute element={<Notifications />} allowedRoles={['systemAdmin', 'admin', 'blockHead']} />} 
          />
          
          {/* Not Found Page */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

