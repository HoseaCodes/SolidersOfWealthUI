import React, { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

const ResponsiveNavbar = ({ setShowRules, setShowComingSoon, currentUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gray-800 px-4 sm:px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Logo - always visible */}
        <div className="flex items-center">
          <span className="text-lg sm:text-xl font-bold text-white font-impact uppercase tracking-wider">SOLDIERS OF WEALTH</span>
        </div>
        
        {/* Mobile menu button */}
        <div className="block sm:hidden">
          <button 
            onClick={toggleMenu}
            className="text-gray-300 hover:text-white focus:outline-none"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
        
        {/* Desktop navigation - hidden on mobile */}
        <div className="hidden sm:flex items-center space-x-4">
          <button onClick={() => setShowRules(true)} className="text-gray-300 hover:text-white">
            Game Rules
          </button>
          <button onClick={() => setShowComingSoon(true)} className="text-gray-300 hover:text-white">
            FAQ
          </button>
          <button onClick={() => setShowComingSoon(true)} className="text-gray-300 hover:text-white">
            Leaderboard
          </button>
          <div className="relative">
            <button className="flex items-center space-x-2">
              <span className="text-white">{currentUser?.email}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu - conditionally rendered */}
      {isMenuOpen && (
        <div className="sm:hidden mt-4 pt-4 border-t border-gray-700">
          <div className="flex flex-col space-y-3">
            <button 
              onClick={() => {
                setShowRules(true);
                setIsMenuOpen(false);
              }} 
              className="text-gray-300 hover:text-white py-2"
            >
              Game Rules
            </button>
            <button 
              onClick={() => {
                setShowComingSoon(true);
                setIsMenuOpen(false);
              }} 
              className="text-gray-300 hover:text-white py-2"
            >
              FAQ
            </button>
            <button 
              onClick={() => {
                setShowComingSoon(true);
                setIsMenuOpen(false);
              }} 
              className="text-gray-300 hover:text-white py-2"
            >
              Leaderboard
            </button>
            <div className="py-2 self-center">
              <span className="text-white">{currentUser?.email}</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const Navbar = () => {
  const [showRules, setShowRules] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const currentUser = { email: "player@example.com" };
  
  return (
    <div className="flex flex-col">
      <ResponsiveNavbar 
        setShowRules={setShowRules}
        setShowComingSoon={setShowComingSoon}
        currentUser={currentUser}
      />
      
      <div className="p-4">
        {showRules && (
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="font-bold">Game Rules</h2>
            <p>Rules content would appear here</p>
            <button 
              onClick={() => setShowRules(false)}
              className="mt-2 px-3 py-1 bg-gray-800 text-white rounded"
            >
              Close
            </button>
          </div>
        )}
        
        {showComingSoon && (
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="font-bold">Coming Soon</h2>
            <p>This feature is coming soon!</p>
            <button 
              onClick={() => setShowComingSoon(false)}
              className="mt-2 px-3 py-1 bg-gray-800 text-white rounded"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;