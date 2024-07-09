import "./Signup.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import toasts from "../../components/toasts/Toasts";

const Signup = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleSignup = () => {
        axios.post('http://127.0.0.1:8000/signup/', {
            username,
            password
        }, {
            headers: {
                "Content-Type": "application/json",
            }
        })
        .then(response => {
            if (response.status !== 200) {
                throw new Error("Đăng ký không thành công");
            }
            toasts.successTopCenter("Đăng ký thành công!");
            setTimeout(function () {
                navigate("/login");
            }, 1800);
            
        })
        .catch(error => {
            setError(error.message);
        });
    }
    

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
          switch (e.currentTarget.name) {
            case "username":
              // eslint-disable-next-line no-case-declarations
              const passwordInput = document.getElementById(
                "passwordInput"
              ) ;
              if (passwordInput) {
                passwordInput.focus();
              }
              break;
            case "password":
              handleSignup();
              break;
            default:
              break;
          }
        }
      };

    return (
        <>
            <div className="signup">
                <div className="signup__container">
                    <div className="signup__container-main">
                        <h1>Đăng ký</h1>
                        <p className="error">{error}</p>
                        <input
                            type="text"
                            placeholder="Tên đăng nhập"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button onClick={handleSignup}>Đăng ký</button>
                        <div className="login">
                            <span>Bạn đã có tài khoản?</span>
                            <span
                                className="signup-button"
                                onClick={() => navigate("/login")}
                            >
                                Đăng nhập
                            </span>
                        </div>

                    </div>
                </div>
            </div>
            <ToastContainer />
        </>
    );

}

export default Signup;