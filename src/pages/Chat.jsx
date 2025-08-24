import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getTarget, generateDraft } from "../utils/targets";
import "../styles/Chat.css";

export default function Chat() {
  const { targetId } = useParams();
  const { state } = useLocation(); // maybe contains { sources, profileUrl }
  const ownerUserId = localStorage.getItem("ownerUserId");

  const [target, setTarget] = useState(null);
  const [messages, setMessages] = useState([]); // {role:'user'|'assistant'|'system', text, thinking?}
  const [input, setInput] = useState("");

  // load target + optionally show BrowserUse sources from route state
  useEffect(() => {
    (async () => {
      try {
        const { target } = await getTarget(targetId);
        setTarget(target);
        if (state?.sources && state.sources.length) {
          setMessages((m) => [
            ...m,
            {
              role: "system",
              text:
                "✅ BrowserUse search finished.\n" +
                (state.profileUrl ? `Best URL: ${state.profileUrl}\n` : "") +
                "Sources:\n" +
                state.sources.map((u, i) => `${i + 1}. ${u}`).join("\n"),
            },
          ]);
        }
      } catch (e) {
        /* ignore */
      }
    })();
  }, [targetId]);

  async function onSend() {
    const userText = input.trim();
    if (!userText) return;
    setMessages((m) => [...m, { role: "user", text: userText }]);
    setInput("");

    // add a "thinking" bubble
    const thinkingId = `t-${Date.now()}`;
    setMessages((m) => [
      ...m,
      { role: "assistant", text: "…", thinking: true, id: thinkingId },
    ]);

    try {
      const { draft } = await generateDraft({
        ownerUserId,
        targetId,
        userPrompt: userText,
        action: "email", // or "questions"
        tone: "warm",
      });
      // replace the thinking bubble with the model output
      setMessages((m) =>
        m.map((msg) =>
          msg.id === thinkingId
            ? {
                role: "assistant",
                text: draft.body || (draft.questions || []).join("\n• "),
                id: thinkingId,
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
        {target && <h2 className="target-name">{target.name}</h2>}

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
