import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signup as apiSignup } from "../utils/auth";
import "../styles/SignUp.css";

const SignUp = () => {
  const { state } = useLocation(); // contains username, password from Login
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");

  useEffect(() => {
    if (!state?.username || !state?.password) navigate("/login");
  }, [state, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await apiSignup({
        username: state.username,
        password: state.password,
        name,
        headline,
      });
      navigate("/enter-info");
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="signup-page-container">
      <div className="signup-card">
        <div className="logo-section">
          <img
            src="/assets/icon.png"
            alt="ForgeLink Logo"
            className="logo-image"
          />
          <h1 className="app-title">ForgeLink</h1>
        </div>

        <form onSubmit={onSubmit}>
          <div className="input-group">
            <label htmlFor="name" className="input-label">
              Name
            </label>
            <input
              id="name"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="headline" className="input-label">
              Headline
            </label>
            <input
              id="headline"
              className="input-field"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>
          <div className="button-group">
            <button
              type="submit"
              className="confirm-button"
              disabled={!name || !headline}
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default SignUp;
