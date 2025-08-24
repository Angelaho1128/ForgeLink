import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { listTargets, deleteTarget } from "../utils/targets";
import "../styles/Sidebar.css";

export default function Sidebar() {
  const [targets, setTargets] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const currentId = location.pathname.startsWith("/chat/")
    ? location.pathname.split("/chat/")[1]
    : null;

  const load = useCallback(async () => {
    try {
      const { targets } = await listTargets();
      setTargets(targets);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, location.key]);
  useEffect(() => {
    const f = () => load();
    window.addEventListener("targets:changed", f);
    return () => window.removeEventListener("targets:changed", f);
  }, [load]);

  async function onDelete(id) {
    if (!confirm("Delete this connection?")) return;
    try {
      await deleteTarget(id);
      if (id === currentId) navigate("/enter-info");
      load();
    } catch (e) {
      alert(e.message);
    }
  }

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
          <div key={t._id} className="connection-row">
            <button
              className="connection"
              onClick={() => navigate(`/chat/${t._id}`)}
              title={t.headline || ""}
            >
              {t.name}
            </button>
            <button
              className="delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(t._id);
              }}
              aria-label={`Delete ${t.name}`}
              title="Delete"
            >
              <img src="/assets/removeIcon.png" alt="" />
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
