/* eslint-disable no-case-declarations */
import  { useState } from "react";
import "./Login.css";
import bg from "../../assets/team.jpg";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import toasts from "../../components/toasts/Toasts";
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../components/context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();  // Get the login function from context

  const handleLogin = () => {
    // Send login information to the server for authentication
    fetch("http://127.0.0.1:8000/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Tài khoản hoặc mật khẩu không chính xác!");
        }
        return response.json();
      })
      .then((data) => {
        // Store token in localStorage
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("isNoti", false);
        toasts.successTopCenter("Đăng nhập thành công!");
        login();  // Call the login function to update the authentication state
        setTimeout(function () {
          navigate("/dashbroad");
        }, 100);

      })
      .catch((error) => {
        setError(error.message);
        toasts.errorTopCenter("Có lỗi từ server!");
      });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      switch (e.currentTarget.name) {
        case "username":
          const passwordInput = document.getElementById(
            "passwordInput"
          ) ;
          if (passwordInput) {
            passwordInput.focus();
          }
          break;
        case "password":
          handleLogin();
          break;
        default:
          break;
      }
    }
  };

  return (
    <>
      <div className=" login-grid">
        <div className="login-container">
          <div className="wrap">
            <div className="login-image">
              <img src={bg} alt="Team" />
            </div>
            <div className="login-form">
              <span style={{
                fontSize:'24px',
                fontWeight: '700',
              }}>Đăng nhập</span>
              {error && <p className="error-message">{error}</p>}
              <input
                className="input-field"
                type="text"
                placeholder="Tên người dùng"
                name="username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                onKeyDown={handleKeyDown}
              />
              <input
                id="passwordInput"
                className="input-field"
                type="password"
                placeholder="Mật khẩu"
                name="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                onKeyDown={handleKeyDown}
              />
              <button className="login-button" onClick={handleLogin}>
                Đăng nhập
              </button>
              <div className="signup">
              <span>Bạn chưa có tài khoản?</span>
              <span
                className="signup-button"
                onClick={() => navigate("/signup")}
              >
                Đăng ký
              </span>
            </div>
            </div>
            <div className="login-text">
              <h3> Chào mừng bạn đến với phần mềm của chúng tôi!</h3>
            </div>

          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Login;
