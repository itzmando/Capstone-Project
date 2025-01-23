import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from './SearchBar';

export const Navigation = ({ auth, isAdmin, logout, onSearch }) => {
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-blue-600"
            >
              Travel Review
            </button>
          </div>

          {/* Search */}
          <div className="flex-grow max-w-2xl">
            <SearchBar onSearch={onSearch} />
          </div>

          {/* Auth Buttons */}
          <div className="flex-shrink-0">
            {auth.user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-600">Welcome, {auth.user.username}</span>
                {isAdmin && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="text-gray-600 hover:text-blue-600"
                  >
                    Admin
                  </button>
                )}
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-blue-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="text-gray-600 hover:text-blue-600"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="text-gray-600 hover:text-blue-600"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};