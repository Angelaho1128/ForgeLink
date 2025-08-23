import React from 'react';
import '../styles/Login.css';

const LoginPage = () => {
  return (
    <div className="login-page-container">
        <div className="login-card">
        <div className="logo-section">
          <img src="/assets/icon.png" alt="ForgeLink Logo" className="logo-image" />
          <h1 className="app-title">ForgeLink</h1>
        </div>

        <form>
          <div className="input-group">
            <label htmlFor="username" className="input-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="input-field"
              placeholder=""
            />
          </div>
          <div className="input-group">
            <label htmlFor="password" className="input-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="input-field"
              placeholder=""
            />
          </div>
          <div className="button-group">
            <button
              type="submit"
              className="login-button"
            >
              Log in
            </button>
            <button
              type="button"
              className="signup-button"
            >
              Sign up
            </button>
          </div>
        </form>
        </div>
    </div>
  );
};

export default LoginPage;
