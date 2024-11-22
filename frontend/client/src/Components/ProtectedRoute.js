import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ component: Component }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');

  return isAuthenticated ? <Component /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;