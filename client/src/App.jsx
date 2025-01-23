import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { HomePage } from "./components/HomePage";
import { Dashboard } from "./components/Dashboard.jsx"
import { AdminDashboard } from "./components/AdminDashboard";
import { Navigation } from "./components/Navigation";
import { useAuth } from "./hooks/useAuth.js";

const App = () => {
  const { auth, login, register, logout, isAdmin } = useAuth();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Navigation 
          auth={auth} 
          isAdmin={isAdmin} 
          logout={logout} 
        />
        <main className="pt-16">
          <Routes>
            <Route path="/login" element={<Login login={login} />} />
            <Route path="/signup" element={<Register register={register} />} />
            <Route path="/dashboard" element={auth.user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;