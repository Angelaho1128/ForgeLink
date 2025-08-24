import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getTarget, generateDraft } from "../utils/targets";
import "../styles/Chat.css";

export default function Chat() {
  const { targetId } = useParams();
  const { state } = useLocation(); // may contain { facts, sources, profileUrl }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const introShown = useRef(false);

  function pushIntroBubble({ facts = [], sources = [], profileUrl = "" }) {
    if (introShown.current) return;
    if (!facts.length && !sources.length && !profileUrl) return;
    const text = [
      "✅ Search finished.",
      profileUrl ? `Best URL: ${profileUrl}` : "",
      facts.length ? `\nHighlights:\n• ${facts.join("\n• ")}` : "",
      sources.length
        ? `\nSources:\n${sources.map((u, i) => `${i + 1}. ${u}`).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
    setMessages((m) => [{ role: "system", text }, ...m]);
    introShown.current = true;
  }

  // route state first for instant display
  useEffect(() => {
    if (state?.facts || state?.sources || state?.profileUrl)
      pushIntroBubble(state);
  }, [state]);

  // fetch target to support refresh/direct visits
  useEffect(() => {
    (async () => {
      try {
        const { target } = await getTarget(targetId);
        pushIntroBubble({
          facts: target.facts || [],
          sources: target.sources || [],
          profileUrl: target.profileUrl || "",
        });
      } catch (_) {}
    })();
  }, [targetId]);

  async function onSend() {
    const userText = input.trim();
    if (!userText) return;
    setMessages((m) => [...m, { role: "user", text: userText }]);
    setInput("");

    const thinkingId = `t-${Date.now()}`;
    setMessages((m) => [
      ...m,
      { role: "assistant", text: "…", thinking: true, id: thinkingId },
    ]);

    try {
      const { draft } = await generateDraft({
        targetId,
        userPrompt: userText,
        action: "email",
        tone: "warm",
      });
      setMessages((m) =>
        m.map((msg) =>
          msg.id === thinkingId
            ? {
                role: "assistant",
                text: draft.body || (draft.questions || []).join("\n• "),
              }
            : msg
        )
      );
    } catch (e) {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === thinkingId
            ? { role: "system", text: `❌ ${e.message}` }
            : msg
        )
      );
    }
  }

  return (
    <div className="chat-container">
      <Sidebar />
      <main className="chat-main">
        <div className="messages">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`bubble ${m.role} ${m.thinking ? "thinking" : ""}`}
            >
              {m.text}
              {m.thinking && (
                <span className="dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            className="input-box"
            placeholder="Type something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="send-btn" onClick={onSend}>
            Send
          </button>
        </div>
      </main>
    </div>
  );
}
