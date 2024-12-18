import React, { useState } from 'react';
import Chatbot from './Chatbot';
import axios from 'axios';
import config from './config';
import './App.css';
import ManageUsers from './ManageUsers';
import ManagePrompts from './Manageprompts';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [adminToken, setAdminToken] = useState(null);
  const [adminView, setAdminView] = useState('manageUsers'); // Track admin's current view

  const handleLogout = () => {
    setToken('');
    setAdminToken(null);
    setIsLoggedIn(false);
    setShowAdminDashboard(false);
  };

  // Updated handleAdminLogin function to use the local backend URL
  const handleAdminLogin = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:5000/admin/login', { 
        username, 
        password 
      }, { withCredentials: true });

      setAdminToken(response.data.token);
      setShowLogin(false);
      setShowAdminDashboard(true);
      setError('');
    } catch (error) {
      setError('Admin login failed: ' + (error.response?.data?.message || 'Unauthorized'));
    }
  };

  const handleUserLogin = async (username, password) => {
    try {
      const response = await axios.post(config.api.loginUrl, { 
        username, 
        password 
      }, { withCredentials: true });

      setToken(response.data.token);
      setIsLoggedIn(true);
      setShowLogin(false);
      setError('');
    } catch (error) {
      setError('Login failed: ' + (error.response?.data?.message || 'Unauthorized'));
    }
  };

  return (
    <div className="App">
      <Header
        onRegister={() => setShowRegister(true)}
        onLogin={() => setShowLogin(true)}
        isLoggedIn={isLoggedIn || showAdminDashboard}
        onLogout={handleLogout}
        showAdminDashboard={showAdminDashboard}
        setAdminView={setAdminView}
      />
      {showAdminDashboard ? (
        <>
          {adminView === 'manageUsers' && <ManageUsers adminToken={adminToken} />}
          {adminView === 'managePrompts' && <ManagePrompts adminToken={adminToken} />}
        </>
      ) : (
        <>
          <Body />
          <Footer />
          {isLoggedIn && <Chatbot token={token} />}
          {showLogin && (
            <LoginModal
              show={showLogin}
              onClose={() => setShowLogin(false)}
              onUserLogin={(username, password) => handleUserLogin(username, password)}
              onAdminLogin={(username, password) => handleAdminLogin(username, password)}
              error={error}
              onRegister={() => {
                setShowLogin(false);
                setShowRegister(true);
              }}
            />
          )}
          {showRegister && (
            <RegisterModal
              show={showRegister}
              onClose={() => setShowRegister(false)}
              onSuccess={() => {
                setShowRegister(false);
                setShowLogin(true);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

function Header({ onRegister, onLogin, isLoggedIn, onLogout, showAdminDashboard, setAdminView }) {
  return (
    <header className="header">
      <h1>{config.header.title}</h1>
      <nav>
        <ul>
          {config.header.links.map((link, idx) => (
            <li key={idx}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
          {!isLoggedIn ? (
            <li><button onClick={onLogin} className="nav-button">Login</button></li>
          ) : (
            <>
              {showAdminDashboard && (
                <>
                  <li><button onClick={() => setAdminView('manageUsers')} className="nav-button">Manage Users</button></li>
                  <li><button onClick={() => setAdminView('managePrompts')} className="nav-button">Manage Prompts</button></li>
                </>
              )}
              <li><button onClick={onLogout} className="nav-button">Logout</button></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

function Body() {
  return (
    <section className="body-content">
      <h2>{config.body.intro.title}</h2>
      <p>{config.body.intro.description}</p>
      <div className="image-section">
        {config.body.images.map((image, idx) => (
          <img key={idx} src={image.src} alt={image.alt} />
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <p>{config.footer.text}</p>
      <div className="social-links">
        {config.footer.links.map((link, idx) => (
          <a key={idx} href={link.href}>{link.label}</a>
        ))}
      </div>
    </footer>
  );
}

function LoginModal({ show, onClose, onUserLogin, onAdminLogin, error, onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = () => {
    if (isAdmin) {
      onAdminLogin(username, password);
    } else {
      onUserLogin(username, password);
    }
  };

  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{isAdmin ? 'Admin Login' : 'User Login'}</h2>
        {error && <p className="error-message">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="modal-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="modal-input"
        />
        <div className="login-toggle">
          <label>
            <input type="checkbox" checked={isAdmin} onChange={() => setIsAdmin(!isAdmin)} />
            Admin Login
          </label>
        </div>
        <button onClick={handleLogin} className="modal-button">Login</button>
        <button onClick={onClose} className="close-button">Close</button>
        <p>
          Not Yet Registered?{' '}
          <span onClick={onRegister} className="register-link">Register</span>
        </p>
      </div>
    </div>
  );
}

function RegisterModal({ show, onClose, onSuccess }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mailId, setMailId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      await axios.post(config.api.registerUrl, { firstName, lastName, mailId, username, password });
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
    }
  };

  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Register</h2>
        {error && <p className="error-message">{error}</p>}
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="modal-input"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="modal-input"
        />
        <input
          type="email"
          placeholder="Mail ID"
          value={mailId}
          onChange={(e) => setMailId(e.target.value)}
          className="modal-input"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="modal-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="modal-input"
        />
        <button onClick={handleRegister} className="modal-button">Register</button>
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
}

export default App;