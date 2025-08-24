import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin } from "../utils/auth";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      await apiLogin(username, password);
      navigate("/enter-info"); // or your next route
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSignUp() {
    // carry username/password to signup
    navigate("/signup", { state: { username, password } });
  }

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="logo-section">
          <img src="/assets/icon.png" alt="Logo" className="logo-image" />
          <h1 className="app-title">ForgeLink</h1>
        </div>

        <div className="input-group">
          <label className="input-label">Username</label>
          <input
            type="text"
            className="input-field"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <input
            type="password"
            className="input-field"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="button-group">
          <button
            type="button"
            className="login-button"
            onClick={handleLogin}
            disabled={loading || !username || !password}
          >
            Log In
          </button>
          <button
            type="button"
            className="signup-button"
            onClick={handleSignUp}
            disabled={!username || !password}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
export default Login;
