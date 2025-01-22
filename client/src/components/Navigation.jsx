import React from 'react';

export const Navigation = ({ auth, isAdmin, navigate, logout }) => {
  return (
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
            {auth.user && isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 rounded-md text-blue-600 hover:bg-blue-50"
              >
                Admin Dashboard
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {auth.user ? (
              <>
                <span className="text-gray-600">Welcome, {auth.user.username}</span>
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
  );
};