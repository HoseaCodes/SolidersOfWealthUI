// Navbar.js - Updated to show correct week and moves due time
import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';

const ResponsiveNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications] = useState(3);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [totalWeeks, setTotalWeeks] = useState(4);
  const [movesDueTime, setMovesDueTime] = useState('');
  const [soldiers, setSoldiers] = useState(165);
  const { gameId } = useParams();
  const navigate = useNavigate();
  const db = getFirestore();
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Load game and player data
  useEffect(() => {
    const loadGameData = async () => {
      if (gameId) {
        try {
          const gameDocRef = doc(db, 'games', gameId);
          const gameDoc = await getDoc(gameDocRef);
          
          if (gameDoc.exists()) {
            const data = gameDoc.data();
            setCurrentWeek(data.currentWeek || 1);
            setTotalWeeks(data.totalWeeks || 4);
          }
        } catch (error) {
          console.error('Error loading game data for navbar:', error);
        }
      }
    };
    
    loadGameData();
  }, [gameId, db]);

  // Calculate time remaining until Sunday midnight
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const sunday = new Date();
      sunday.setDate(now.getDate() + (7 + 0 - now.getDay()) % 7); // Next Sunday
      sunday.setHours(23, 59, 59, 999); // Set to 11:59:59 PM
      
      const diffMs = sunday - now;
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      return `${diffHrs}:${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`;
    };
    
    const timer = setInterval(() => {
      setMovesDueTime(calculateTimeRemaining());
    }, 1000);
    
    // Initial calculation
    setMovesDueTime(calculateTimeRemaining());
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <nav className="bg-gray-800 px-4 md:px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Logo and brand name */}
        <div className="flex items-center">
          <img src="/images/logo.png" alt="Logo" className="h-8 w-8 md:h-10 md:w-10 mr-2 md:mr-3" />
          <span className="text-lg md:text-xl font-bold text-white">SOLDIERS OF WEALTH</span>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={toggleMenu}
            className="text-gray-400 hover:text-white focus:outline-none"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
          <div className="soldier-counter px-3 py-1 md:px-4 md:py-2 rounded-lg flex items-center bg-gray-700">
            <img src="/images/soldier.png" alt="Soldier Icon" className="h-6 w-6 md:h-8 md:w-8 mr-2" />
            <span className="text-base md:text-xl font-bold text-white">{soldiers} SOLDIERS</span>
          </div>
          
          <div className="flex items-center text-gray-400">
            <span className="text-sm md:text-base mr-1">Week:</span>
            <span className="text-sm md:text-base text-white font-bold">{currentWeek}</span>
            <span className="text-sm md:text-base mx-1">/</span>
            <span className="text-sm md:text-base">{totalWeeks}</span>
          </div>
          
          <div className="text-gray-400 text-sm md:text-base">
            <span>Moves Due: </span>
            <span className="text-yellow-400 font-bold">{movesDueTime}</span>
          </div>
          
          <div className="relative">
            <button className="relative">
              <FaUserCircle className="h-8 w-8 md:h-10 md:w-10 text-gray-400" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                  {notifications}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden mt-4 space-y-4 py-2">
          <div className="soldier-counter px-4 py-2 rounded-lg flex items-center justify-center bg-gray-700">
            <img src="/images/soldier.png" alt="Soldier Icon" className="h-6 w-6 mr-2" />
            <span className="text-lg font-bold text-white">{soldiers} SOLDIERS</span>
          </div>
          
          <div className="flex items-center justify-center text-gray-400">
            <span className="mr-1">Week:</span>
            <span className="text-white font-bold">{currentWeek}</span>
            <span className="mx-1">/</span>
            <span>{totalWeeks}</span>
          </div>
          
          <div className="text-gray-400 text-center">
            <span>Moves Due: </span>
            <span className="text-yellow-400 font-bold">{movesDueTime}</span>
          </div>
          
          <div className="flex justify-center relative">
            <button onClick={() => navigate(`/profile`)} className="relative">
              <FaUserCircle className="h-8 w-8 text-gray-400" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                  {notifications}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default ResponsiveNavbar;