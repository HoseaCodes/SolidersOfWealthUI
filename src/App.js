import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Login from './components/auth/Login';
import CommandCenter from './components/game/CommandCenter';
import MarketDashboard from './components/game/MarketDashboard';
import Battlefield from './components/game/Battlefield';
import Intelligence from './components/game/Intelligence';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <PrivateRoute>
            <CommandCenter />
          </PrivateRoute>
        } />
        <Route path="/market" element={
          <PrivateRoute>
            <MarketDashboard />
          </PrivateRoute>
        } />
        <Route path="/battlefield" element={
          <PrivateRoute>
            <Battlefield />
          </PrivateRoute>
        } />
        <Route path="/intelligence" element={
          <PrivateRoute>
            <Intelligence />
          </PrivateRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
