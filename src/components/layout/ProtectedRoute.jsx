import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();

  // Handle the loading state so it doesn't instantly redirect
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>
        Loading Authentication...
      </div>
    );
  }

  // Not authenticated? Send to login.
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required and user lacks it, redirect them to their native dashboard, or default patient view
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === 'doctor') return <Navigate to="/doctor-dashboard" replace />;
    if (userRole === 'pharmacist') return <Navigate to="/pharmacy-dashboard" replace />;
    return <Navigate to="/patient-dashboard" replace />;
  }

  // Authorized user
  return <Outlet />;
};

export default ProtectedRoute;
