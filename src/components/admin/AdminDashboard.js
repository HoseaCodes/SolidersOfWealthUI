import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PlayerManagement from './PlayerManagement';
import GameManagement from './GameManagement';
import GameRequests from './GameRequests';
import EconomyManagement from './EconomyManagement';
import EconomicDashboard from './EconomicDashboard';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('players');

  const tabs = [
    { id: 'players', name: 'Players', component: <PlayerManagement /> },
    { id: 'games', name: 'Games', component: <GameManagement /> },
    { id: 'requests', name: 'Game Requests', component: <GameRequests /> },
    { id: 'economy', name: 'Economy', component: <EconomyManagement /> },
    { id: 'simulation', name: 'Economic Simulation', component: <EconomicDashboard /> }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 ${activeTab === tab.id ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-gray-800 rounded-lg p-6">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
