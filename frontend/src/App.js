import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
import DeviceSetup from './components/DeviceSetup';
import { CryptoService } from './crypto/CryptoService';
import { AuthService } from './services/AuthService';

function App() {
  const [user, setUser] = useState(null);
  const [deviceSetup, setDeviceSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check if user is logged in
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
        
        // Check if device is set up
        const deviceKeys = await CryptoService.getDeviceKeys();
        setDeviceSetup(!!deviceKeys);
      }
    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setUser(null);
    setDeviceSetup(false);
    localStorage.removeItem('user');
  };

  const handleDeviceSetup = () => {
    setDeviceSetup(true);
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register onRegister={handleLogin} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/setup" 
            element={user && !deviceSetup ? <DeviceSetup onSetup={handleDeviceSetup} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/" 
            element={
              user ? 
                (deviceSetup ? <Chat user={user} onLogout={handleLogout} /> : <Navigate to="/setup" />) :
                <Navigate to="/login" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;