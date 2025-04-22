import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import LandingPage from './components/landing/LandingPage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import CommandCenter from './components/game/CommandCenter';
import MarketDashboard from './components/game/MarketDashboard';
import Battlefield from './components/game/Battlefield';
import Intelligence from './components/game/Intelligence';
import Dashboard from './components/dashboard/Dashboard';
import Game from './components/game/Game';


function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />  
        <Route path="/game" element={
          <PrivateRoute>
            <Game />
          </PrivateRoute>
        } />
        <Route path="/commandcenter" element={
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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
