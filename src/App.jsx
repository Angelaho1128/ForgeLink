import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login.jsx";
import App_test from "./App_test.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/test" element={<App_test />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
