import React, { useState } from "react";
import "../styles/Chat.css";

const Chat = () => {
  const [messages, setMessages] = useState(["Hello! This is a sample message."]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, input]);
      setInput("");
    }
  };

  return (
    <div className="chat-container">
      <aside className="sidebar">
        <div className="logo-section">
          <img src="/assets/icon.png" alt="logo" className="sidebar-logo" />
          <h2 className="sidebar-title">ForgeLink</h2>
        </div>
        <button className="sidebar-btn">Add new connections</button>
        <h3 className="sidebar-subtitle">Previous connections</h3>
        <button className="connection-btn">Angela Ho</button>
        <button className="connection-btn">Vienna Zhao</button>
      </aside>

      <main className="chat-main">
        <div className="messages">
          {messages.map((msg, i) => (
            <p key={i} className="message">{msg}</p>
          ))}
        </div>
        <div className="chat-input">
          <input
            className="input-box"
            placeholder="Type something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="send-btn" onClick={sendMessage}>Send</button>
        </div>
      </main>
    </div>
  );
};

export default Chat;
