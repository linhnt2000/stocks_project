/* eslint-disable react/prop-types */

import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const RedirectIfAuthenticated = ({ element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Hiển thị loading nếu đang kiểm tra token
  }

  console.log("RedirectIfAuthenticated - isAuthenticated:", isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashbroad" /> : element;
};

export default RedirectIfAuthenticated;
