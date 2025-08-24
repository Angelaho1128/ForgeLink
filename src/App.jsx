import React from "react";
import { Routes, Route } from "react-router-dom";
import Chat from "./pages/Chat.jsx";
import EnterInfo from "./pages/EnterInfo.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login.jsx";
import App_test from "./App_test.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/test" element={<App_test />} />
      </Routes>
    </BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/enter-info" element={<EnterInfo />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  );
}

export default App;

