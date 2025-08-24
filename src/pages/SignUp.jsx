import React from "react";
import "../styles/SignUp.css";

const SignUp = () => {
  return (
    <div className="signup-page-container">
      <div className="signup-card">
        <div className="logo-section">
          <img src="/assets/icon.png" alt="ForgeLink Logo" className="logo-image" />
          <h1 className="app-title">ForgeLink</h1>
        </div>

        <form>
          <div className="input-group">
            <label htmlFor="name" className="input-label">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="input-field"
            />
          </div>
          <div className="input-group">
            <label htmlFor="headline" className="input-label">Headline</label>
            <input
              type="text"
              id="headline"
              name="headline"
              className="input-field"
            />
          </div>
          <div className="button-group">
            <button type="submit" className="confirm-button">
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
