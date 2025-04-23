import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PlayerManagement from './PlayerManagement';
import GameManagement from './GameManagement';
import GameRequests from './GameRequests';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('players');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <Link to="/admin/economy" className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700">
              Economic Controls
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-700">
          <button
            className={`px-4 py-2 ${activeTab === 'players' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('players')}
          >
            Players
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'games' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('games')}
          >
            Games
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'requests' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('requests')}
          >
            Game Requests
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-gray-800 rounded-lg p-6">
          {activeTab === 'players' && <PlayerManagement />}
          {activeTab === 'games' && <GameManagement />}
          {activeTab === 'requests' && <GameRequests />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
