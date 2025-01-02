import './App.css'
import React, { useState, useEffect } from 'react';

const App = () => {
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);
  const [user, setUser] = React.useState(null);
  const [token, setToken] = React.useState(localStorage.getItem('token'));

  // Navigation functions
  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Auth functions
  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Fetch user data if token exists
  React.useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await fetch('http://localhost:3000/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          logout();
        }
      }
    };

    fetchUser();
  }, [token]);

  // Navigation handler
  React.useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderContent = () => {
    switch (currentPath) {
      case '/login':
        return (
          <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <h2 className="text-center text-3xl font-bold">Sign in</h2>
              {/* Login form */}
              <form className="mt-8 space-y-6">
                <input
                  type="email"
                  placeholder="Email"
                  className="block w-full px-3 py-2 border rounded-md"
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="block w-full px-3 py-2 border rounded-md"
                />
                <button
                  className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                >
                  Sign in
                </button>
              </form>
            </div>
          </div>
        );
      case '/signup':
        return (
          <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <h2 className="text-center text-3xl font-bold">Sign up</h2>
              {/* Signup form */}
              <form className="mt-8 space-y-6">
                <input
                  type="text"
                  placeholder="Username"
                  className="block w-full px-3 py-2 border rounded-md"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="block w-full px-3 py-2 border rounded-md"
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="block w-full px-3 py-2 border rounded-md"
                />
                <button
                  className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                >
                  Sign up
                </button>
              </form>
            </div>
          </div>
        );
      default:
        return (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Welcome to Travel Reviews</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Placeholder cards */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-48 bg-gray-200 rounded-md mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Travel Location {i}</h3>
                  <p className="text-gray-600">Sample description for this amazing travel destination.</p>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="text-xl font-bold text-gray-800"
              >
                Travel Reviews
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-600">Welcome, {user.username}</span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main>{renderContent()}</main>
    </div>
  );
};

export default App;