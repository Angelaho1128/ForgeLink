import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/enter-info");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="logo-section">
          {/* Just reference the path directly, no import needed */}
          <img src="/assets/icon.png" alt="Logo" className="logo-image" />
          <h1 className="app-title">ForgeLink</h1>
        </div>

        <div className="input-group">
          <label className="input-label">Username</label>
          <input type="text" className="input-field" placeholder="Enter your username" />
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <input type="password" className="input-field" placeholder="Enter your password" />
        </div>

        <div className="button-group">
          <button type="button" className="login-button" onClick={handleLogin}>
            Log In
          </button>
          <button type="button" className="signup-button" onClick={handleSignUp}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
