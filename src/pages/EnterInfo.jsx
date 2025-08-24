import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { resolveTarget } from "../utils/targets";
import "../styles/EnterInfo.css";

const EnterInfo = () => {
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const ownerUserId = localStorage.getItem("ownerUserId");
  const navigate = useNavigate();

  async function onSubmit() {
    if (!ownerUserId || !name || !headline) return;
    try {
      const { target } = await resolveTarget({ ownerUserId, name, headline });
      // refresh sidebar and go to chat, passing sources so we can show them right away
      window.dispatchEvent(new Event("targets:changed"));
      navigate(`/chat/${target._id}`, {
        state: {
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
};
export default EnterInfo;
