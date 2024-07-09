/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stockName, setStockName] = useState('TCB');
  const [guide, setGuide] = useState('Giới thiệu');

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false); // Đảm bảo loading được set thành false sau khi kiểm tra token
  }, []);

  console.log("AuthContext - isAuthenticated:", isAuthenticated);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const updateStockName = (newStockName) => {
    setStockName(newStockName);
  };

  const updateGuide = (newGuide) => {
    setGuide(newGuide);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading, stockName, updateStockName, guide, updateGuide }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
