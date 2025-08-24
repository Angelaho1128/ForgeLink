import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { listTargets } from "../utils/targets.js";
import "../styles/Sidebar.css";

export default function Sidebar() {
  const [targets, setTargets] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const ownerUserId = localStorage.getItem("ownerUserId");

  const load = useCallback(async () => {
    if (!ownerUserId) return setTargets([]);
    try {
      const { targets } = await listTargets(ownerUserId);
      setTargets(targets);
    } catch (e) {
      console.error(e);
    }
  }, [ownerUserId]);

  // load on mount and whenever route changes (simple refresh)
  useEffect(() => {
    load();
  }, [load, location.key]);

  // also listen for a custom “targets changed” signal
  useEffect(() => {
    window.addEventListener("targets:changed", load);
    return () => window.removeEventListener("targets:changed", load);
  }, [load]);

  return (
    <aside className="fl-sidebar">
      <div
        className="logo-row"
        onClick={() => navigate("/enter-info")}
        role="button"
      >
        <img src="/assets/icon.png" alt="logo" className="logo" />
        <h2 className="brand">ForgeLink</h2>
      </div>

      <button className="primary ghost" onClick={() => navigate("/enter-info")}>
        Add new connections
      </button>

      <h3 className="section-title">Previous connections</h3>

      <div className="connections">
        {targets.length === 0 && (
          <div className="empty">No connections yet</div>
        )}
        {targets.map((t) => (
          <button
            key={t._id}
            className="connection"
            onClick={() => navigate(`/chat/${t._id}`)}
          >
            {t.name}
          </button>
        ))}
      </div>
    </aside>
  );
}
