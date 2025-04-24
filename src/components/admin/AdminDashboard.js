import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import PlayerManagement from './PlayerManagement';
import GameManagement from './GameManagement';
import GameRequests from './GameRequests';
import EconomyManagement from './EconomyManagement';
import EconomicDashboard from './EconomicDashboard';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('players');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'players', name: 'Players', component: <PlayerManagement /> },
    { id: 'games', name: 'Games', component: <GameManagement /> },
    { id: 'requests', name: 'Game Requests', component: <GameRequests /> },
    { id: 'economy', name: 'Economy', component: <EconomyManagement /> },
    { id: 'simulation', name: 'Economic Simulation', component: <EconomicDashboard /> }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-gray-300 focus:outline-none"
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="hidden md:flex space-x-4 mb-6 border-b border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm sm:text-base ${
                activeTab === tab.id 
                  ? 'text-blue-500 border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Mobile Navigation */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden mb-6`}>
          <div className="flex flex-col space-y-2 bg-gray-800 rounded-lg p-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-3 text-left rounded-md ${
                  activeTab === tab.id 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
