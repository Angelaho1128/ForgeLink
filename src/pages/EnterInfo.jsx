import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { resolveTarget } from "../utils/targets";
import "../styles/EnterInfo.css";

export default function EnterInfo() {
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const navigate = useNavigate();

  async function onSubmit() {
    if (!name || !headline) return;
    try {
      const { target } = await resolveTarget({ name, headline });
      window.dispatchEvent(new Event("targets:changed"));
      navigate(`/chat/${target._id}`, {
        state: {
          facts: target.facts || [],
          sources: target.sources || [],
          profileUrl: target.profileUrl || "",
        },
      });
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="enterinfo-container">
      <Sidebar />
      <main className="main-section">
        <h1 className="main-heading">Who would you like to get to know?</h1>
        <input
          className="main-input"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="main-input"
          placeholder="Enter headline"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
        />
        <button
          className="submit-btn"
          onClick={onSubmit}
          disabled={!name || !headline}
        >
          Submit
        </button>
      </main>
    </div>
  );
}
