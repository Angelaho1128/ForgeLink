import React from "react";
import { Routes, Route } from "react-router-dom";
import Chat from "./pages/Chat.jsx";
import EnterInfo from "./pages/EnterInfo.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/enter-info" element={<EnterInfo />} />
    </Routes>
  );
}

export default App;
