import React, { useState, useEffect } from "react";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import SignIn from "./components/SignIn";
import { HomePage } from "./components/HomePage";
import { AdminDashboard } from "./components/AdminDashboard";
import { Navigation } from "./components/Navigation";
import { useAuth } from "./hooks/useAuth.js";

const App = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { auth, login, register, logout, isAdmin } = useAuth();

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  const renderContent = () => {
    switch (currentPath) {
      case "/login":
        return <Login login={login} />;
      case "/SignIn":
        return <SignIn signin={signin} />;
      case "/signup":
        return <Register register={register} />;
      case "/admin":
        return isAdmin ? <AdminDashboard /> : navigate("/");
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation
        auth={auth}
        isAdmin={isAdmin}
        navigate={navigate}
        logout={logout}
      />
      <main>{renderContent()}</main>
    </div>
  );
};

export default App;
