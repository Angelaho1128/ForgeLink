import React, { useState } from "react";
import "../styles/EnterInfo.css";

const EnterInfo = () => {
  const [connections, setConnections] = useState(["Angela Ho", "Vienna Zhao"]);

  return (
    <div className="enterinfo-container">
      <aside className="sidebar">
        <div className="logo-section">
          <img src="/assets/icon.png" alt="logo" className="sidebar-logo" />
          <h2 className="sidebar-title">ForgeLink</h2>
        </div>
        <button className="sidebar-btn">Add new connections</button>
        <h3 className="sidebar-subtitle">Previous connections</h3>
        <div className="connections-list">
          {connections.map((c, i) => (
            <button key={i} className="connection-btn">{c}</button>
          ))}
        </div>
      </aside>

      <main className="main-section">
        <h1 className="main-heading">Who would you like to get to know?</h1>
        <input className="main-input" placeholder="Enter name" />
        <input className="main-input" placeholder="Enter headline" />
        <button className="submit-btn">Submit</button>
      </main>
    </div>
  );
};

export default EnterInfo;
