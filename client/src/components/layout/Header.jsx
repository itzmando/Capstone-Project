import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../auth/AuthModal';

const Header = () => {
  const { isLoggedIn, user, logout, getAuthHeader } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [userInfo, setUserInfo] = useState(null);
  const [userActivity, setUserActivity] = useState({
    reviews: [],
    comments: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (isLoggedIn && user?.id) {
        try {
          const response = await fetch('/api/users/profile', {
            headers: getAuthHeader()
          });
          
          if (response.ok) {
            const data = await response.json();
            setUserInfo(data);
          } else if (response.status === 401) {
            logout();
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      }
    };
    fetchUserInfo();
  }, [isLoggedIn, user, getAuthHeader, logout]);

  useEffect(() => {
    let mounted = true;

    const fetchUserContent = async () => {
      if (!isLoggedIn || !showDropdown) return;

      try {
        const [reviewsRes, commentsRes] = await Promise.all([
          fetch('/api/users/reviews', { headers: getAuthHeader() }),
          fetch('/api/users/comments', { headers: getAuthHeader() })
        ]);

        if (!mounted) return;

        if (reviewsRes.ok && commentsRes.ok) {
          const [reviews, comments] = await Promise.all([
            reviewsRes.json(),
            commentsRes.json()
          ]);

          setUserActivity({ reviews, comments });
        }
      } catch (error) {
        console.error('Error fetching user content:', error);
      }
    };

    fetchUserContent();

    const handleContentUpdate = () => {
      if (showDropdown) {
        fetchUserContent();
      }
    };

    window.addEventListener('userContentUpdated', handleContentUpdate);

    return () => {
      mounted = false;
      window.removeEventListener('userContentUpdated', handleContentUpdate);
    };
  }, [showDropdown, isLoggedIn, getAuthHeader]);

  const handleLoginClick = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleRegisterClick = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    setUserInfo(null);
    setUserActivity({ reviews: [], comments: [] });
    navigate('/');
  };

  return (
    <>
      <header className="bg-gradient-to-r from-purple-600 to-blue-500 shadow-lg p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-2xl font-bold text-white hover:text-purple-100">
              Travel
            </Link>
            <Link 
              to="/search"
              className="flex items-center text-white hover:text-purple-100"
            >
              <Search size={20} className="mr-1" />
              <span>Search</span>
            </Link>
          </div>
          
          {isLoggedIn ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 text-white hover:text-purple-100"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <span className="hidden md:inline">
                  {userInfo?.username || user?.username}
                </span>
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-50 ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">
                      {userInfo?.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {userInfo?.email}
                    </p>
                  </div>
                  
                  <Link 
                    to="/my-reviews" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowDropdown(false)}
                  >
                    My Reviews ({userActivity.reviews.length})
                  </Link>
                  
                  <Link 
                    to="/my-comments" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowDropdown(false)}
                  >
                    My Comments ({userActivity.comments.length})
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-x-4">
              <button 
                onClick={handleLoginClick}
                className="text-white hover:text-purple-100"
              >
                Login
              </button>
              <button
                onClick={handleRegisterClick}
                className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </>
  );
};

export default Header;