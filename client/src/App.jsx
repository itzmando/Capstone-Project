import './App.css'
import React, { useState, useEffect } from 'react';

const App = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [auth, setAuth] = useState({});
  const [error, setError] = useState('');

  // Navigation functions
  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  useEffect(() => {
    attemptLoginWithToken();
  }, []);

  const attemptLoginWithToken = async () => {
    const token = window.localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch('/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const userData = await response.json();
          setAuth({ token, user: userData });
        } else {
          window.localStorage.removeItem('token');
          setAuth({});
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        window.localStorage.removeItem('token');
        setAuth({});
      }
    }
  };

  const login = async ({ email, password }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      console.log("data", data);
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      window.localStorage.setItem('token', data);
      await attemptLoginWithToken();
      navigate('/');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async ({ username, email, password, full_name }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, full_name }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      // After successful registration, log the user in
      await login({ email, password });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    window.localStorage.removeItem('token');
    setAuth({});
    navigate('/');
  };

  // Components
  const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (ev) => {
      ev.preventDefault();
      try {
        await login({ email, password });
      } catch (ex) {
        setError(ex.message);
      }
    };

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-bold">Sign in</h2>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="block w-full px-3 py-2 border rounded-md"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="block w-full px-3 py-2 border rounded-md"
            />
            <button
              type="submit"
              disabled={!email || !password}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  };

  const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (ev) => {
      ev.preventDefault();
      try {
        await register({ username, email, password, full_name: fullName });
      } catch (ex) {
        setError(ex.message);
      }
    };

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-bold">Sign up</h2>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              minLength={3}
              className="block w-full px-3 py-2 border rounded-md"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="block w-full px-3 py-2 border rounded-md"
            />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              required
              className="block w-full px-3 py-2 border rounded-md"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={8}
              className="block w-full px-3 py-2 border rounded-md"
            />
            <button
              type="submit"
              disabled={!username || !email || !password || !fullName}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              Sign up
            </button>
          </form>
        </div>
      </div>
    );
  };

  const HomePage = () => {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchPlaces = async () => {
        try {
          const response = await fetch('/api/places');
          const data = await response.json();
          setPlaces(data.places);
        } catch (err) {
          console.error('Error fetching places:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchPlaces();
    }, []);

    if (loading) {
      return <div className="text-center py-8">Loading...</div>;
    }

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Welcome to Travel Reviews</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place) => (
            <div key={place.place_id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-2">{place.name}</h3>
              <p className="text-gray-600 mb-2">{place.description}</p>
              <div className="text-sm text-gray-500">
                <p>Category: {place.category_name}</p>
                <p>Location: {place.city_name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentPath) {
      case '/login':
        return <Login />;
      case '/signup':
        return <Register />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
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

      <main>{renderContent()}</main>
    </div>
  );
};

export default App;