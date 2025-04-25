import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { EconomicProvider } from './components/admin/contexts/EconomicContext';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import GameRoute from './components/auth/GameRoute';
import LandingPage from './components/landing/LandingPage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Game from './components/game/Game';
import CommandCenter from './components/game/CommandCenter';
import Dashboard from './components/dashboard/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import Profile from './components/profile/Profile';
import TrainingLibrary from './components/training/TrainingLibrary';
import TrainingAdmin from './components/training/TrainingAdmin';

function App() {
  return (
      <AuthProvider>
        <EconomicProvider>
          <div className="App min-h-screen bg-gray-900 text-white">
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
                  <GameRoute>
                    <CommandCenter />
                  </GameRoute>
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              <Route path="/training" element={
                <PrivateRoute>
                  <TrainingLibrary />
                </PrivateRoute>
              } />
              <Route path="/admin/training" element={
                <AdminRoute>
                  <TrainingAdmin />
                </AdminRoute>
              } />
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </EconomicProvider>
      </AuthProvider>
  );
}

export default App;
