
import { BrowserRouter, Routes, Route, Navigate,useLocation } from 'react-router-dom';
import { AuthProvider,useAuth } from './components/context/AuthContext';
import ProtectedRoute from './components/context/ProtectedRoute';
import RedirectIfAuthenticated from './components/context/RedirectIfAuthenticated';
import Login from './pages/login/Login';
import Stock from './pages/stock/Stock';
import Guide from './pages/guide/NewGuide';
import Signup from './pages/signup/Signup';
import Tracking from './pages/tracking/Tracking';
import Forecast from './pages/forecast/forecast';
import Dashbroad from './pages/dashbroad/Dashbroad';
import './App.css';
import './grid.css';
import TopBar from './components/topbar/topBar';


const App = () => {
  const location = useLocation();
  const showTopBar = !['/', '/signup'].includes(location.pathname);
  const { stockName } = useAuth();

  return (
    <>
      {showTopBar && <TopBar />}
      <Routes>
        <Route
          path="/"
          element={<RedirectIfAuthenticated element={<Login />} />}
        />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route
          path="/dashbroad"
          element={<ProtectedRoute element={<Dashbroad />} />}
        />
        <Route 
          path={`/stock/ticker=${stockName}`}
          element={<ProtectedRoute element={<Stock />} />} />
        <Route
          path="/guide"
          element={<ProtectedRoute element={<Guide />} />}
        />
        <Route
          path="/forecast"
          element={<ProtectedRoute element={<Forecast />} />}
        />
        <Route
          path="/tracking"
          element={<ProtectedRoute element={<Tracking />} />}
        />
      </Routes>
    </>

  );
};

const MainApp = () => (
  <AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>
);

export default MainApp;
