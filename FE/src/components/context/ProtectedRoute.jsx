/* eslint-disable react/prop-types */

import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Hiển thị loading nếu đang kiểm tra token
  }

  return isAuthenticated ? element : <Navigate to="/" />;
};

export default ProtectedRoute;


