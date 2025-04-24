import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';

const AdminRoute = ({ children }) => {
  const { isAdmin, allAdmins, loading } = useAdmin();
  console.log('AdminRoute', { isAdmin, allAdmins, loading });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default AdminRoute;
