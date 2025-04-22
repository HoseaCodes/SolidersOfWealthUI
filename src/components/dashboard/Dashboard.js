import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../../styles/dashboard.css';
import { FaBook, FaGraduationCap, FaComments } from 'react-icons/fa';
import Modal from '../common/Modal';
import Rulebook from '../game/Rulebook';
import Training from '../game/Training';
import Forum from '../game/Forum';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [playerStats, setPlayerStats] = useState(null);
  const [showRulebook, setShowRulebook] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [showForum, setShowForum] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const upcomingGames = [
    {
      id: 1,
      name: "SEASON 2: CRYPTO WARS",
      startDate: "April 28",
      endDate: "May 26",
      spotsLeft: 20,
      commandersEnlisted: 24,
      difficulty: "Beginner",
      difficultyLevel: 2
    },
    {
      id: 2,
      name: "ELITE SQUAD: TACTICAL FINANCE",
      startDate: "May 5",
      endDate: "June 2",
      spotsLeft: 8,
      commandersEnlisted: 12,
      difficulty: "Advanced",
      difficultyLevel: 4
    }
  ];

  const pastSeasons = [
    {
      id: 1,
      name: "SEASON 1: FIRST STRIKE",
      date: "March 2025",
      players: 44,
      winner: "Charles Nolen II",
      image: "/images/season1.jpg"
    },
    {
      id: 2,
      name: "PRIVATE: EXECUTIVE LEAGUE",
      date: "February 2025",
      players: 10,
      winner: "Grace Anderson",
      image: "/images/private-league.jpg"
    },
    {
      id: 3,
      name: "BETA: MARKET INCURSION",
      date: "January 2025",
      players: 32,
      winner: "Romado S.",
      image: "/images/beta.jpg"
    },
    {
      id: 4,
      name: "ALPHA: TESTING GROUNDS",
      date: "December 2024",
      players: 16,
      winner: "Eric-Allen Frazier",
      image: "/images/alpha.jpg"
    }
  ];

  useEffect(() => {
    async function fetchPlayerData() {
      if (!currentUser) return;

      const playerRef = doc(db, 'players', currentUser.uid);
      const playerDoc = await getDoc(playerRef);

      if (playerDoc.exists()) {
        setPlayerStats(playerDoc.data());
      }

      setLoading(false);
    }

    fetchPlayerData();
  }, [currentUser]);

  async function handleGameRequest(gameId) {
    if (!currentUser) return;

    setLoading(true);
    const playerRef = doc(db, 'players', currentUser.uid);

    try {
      await setDoc(playerRef, {
        ...playerStats,
        gameRequestStatus: 'pending',
        requestedGameId: gameId,
        requestedAt: new Date().toISOString()
      }, { merge: true });

      // Refresh player data
      const updatedDoc = await getDoc(playerRef);
      setPlayerStats(updatedDoc.data());
    } catch (error) {
      console.error('Error requesting game access:', error);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <section id="signup-dashboard" className="p-6">
        <div className="max-w-6xl mx-auto bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
          {/* Top Navigation Bar */}
          <nav className="bg-gray-800 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold text-white military-header">SOLDIERS OF WEALTH</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="#" className="text-gray-300 hover:text-white">Game Rules</Link>
              <Link to="#" className="text-gray-300 hover:text-white">FAQ</Link>
              <Link to="#" className="text-gray-300 hover:text-white">Leaderboard</Link>
              <div className="relative">
                <button className="flex items-center space-x-2">
                  <span className="text-white">{currentUser.email}</span>
                </button>
              </div>
            </div>
          </nav>
          
          {/* Welcome Banner */}
          <div className="relative">
            <div className="h-64 bg-gray-800"></div>
            <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center px-12 text-center">
              <h1 className="text-4xl font-bold text-white mb-3 military-header">WELCOME TO THE RANKS, COMMANDER</h1>
              <p className="text-xl text-gray-300">Your account has been successfully created. Prepare for battle in the financial markets.</p>
            </div>
          </div>
          
          {/* Signup Completion Status */}
          <div className="p-8">
            {/* Onboarding Progress */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 military-header">COMMANDER ONBOARDING</h2>
              <div className="grid grid-cols-4 gap-3">
                <div className="step-complete p-3 rounded-md text-center">
                  <div className="h-10 w-10 rounded-full bg-white text-green-800 flex items-center justify-center mx-auto mb-2 font-bold text-lg">✓</div>
                  <p className="font-bold">Create Account</p>
                  <p className="text-sm text-gray-300">Complete</p>
                </div>
                
                <div className="step-next p-3 rounded-md text-center">
                  <div className="h-10 w-10 rounded-full bg-white text-gray-800 flex items-center justify-center mx-auto mb-2 font-bold text-lg">2</div>
                  <p className="font-bold">Join Battle</p>
                  <p className="text-sm">Action Required</p>
                </div>
                
                <div className="step-upcoming p-3 rounded-md text-center">
                  <div className="h-10 w-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center mx-auto mb-2 font-bold text-lg">3</div>
                  <p className="font-bold text-gray-400">Training</p>
                  <p className="text-sm text-gray-500">Locked</p>
                </div>
                
                <div className="step-upcoming p-3 rounded-md text-center">
                  <div className="h-10 w-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center mx-auto mb-2 font-bold text-lg">4</div>
                  <p className="font-bold text-gray-400">First Mission</p>
                  <p className="text-sm text-gray-500">Locked</p>
                </div>
              </div>
            </div>
            
            {/* Next Step Card */}
            <div className="game-card rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold military-header">ENLIST IN THE NEXT BATTLE</h3>
                <span className="text-yellow-300 px-3 py-1 bg-green-900 bg-opacity-30 rounded-full text-sm font-bold">ACTION REQUIRED</span>
              </div>
              
              <p className="text-gray-300 mb-6">To begin your journey in wealth accumulation, you must join an upcoming battle. Select from the available options below.</p>
              
              <div className="space-y-4">
                {upcomingGames.map(game => (
                  <div key={game.id} className="upcoming-game rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h4 className="font-bold">{game.name}</h4>
                        <p className="text-sm text-gray-400">Begins {game.startDate} - Ends {game.endDate}</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-yellow-400 font-bold">{game.spotsLeft} SPOTS LEFT</span>
                        <span className="text-xs text-gray-400">{game.commandersEnlisted} Commanders Enlisted</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-300 mr-3">Difficulty:</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`h-4 w-4 ${i < game.difficultyLevel ? 'bg-green-600' : 'bg-gray-600'} rounded-full`}
                            ></span>
                          ))}
                        </div>
                        <span className="ml-2 text-sm">{game.difficulty}</span>
                      </div>
                      <button
                        className="px-4 py-2 button-military rounded-md"
                        onClick={() => handleGameRequest(game.id)}
                        disabled={loading || playerStats?.gameRequestStatus === 'pending'}
                      >
                        Request to Join
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Game Info & Resources */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="game-card rounded-lg p-5">
                <div className="h-12 w-12 rounded-full bg-blue-800 flex items-center justify-center mb-4 mx-auto">
                  <FaBook className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-center mb-2">GAME RULES</h4>
                <p className="text-sm text-gray-400 text-center mb-4">Learn how to play, understand investment options, attack mechanics, and victory conditions.</p>
                <div className="text-center">
                  <button 
                    onClick={() => setShowRulebook(true)}
                    className="text-blue-400 hover:underline text-sm"
                  >
                    View Complete Rulebook
                  </button>
                </div>
              </div>
              
              <div className="game-card rounded-lg p-5">
                <div className="h-12 w-12 rounded-full bg-green-800 flex items-center justify-center mb-4 mx-auto">
                  <FaGraduationCap className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-center mb-2">TRAINING MATERIALS</h4>
                <p className="text-sm text-gray-400 text-center mb-4">Study investment strategies, combat tactics, and expert analysis of previous seasons.</p>
                <div className="text-center">
                  <button 
                    onClick={() => setShowTraining(true)}
                    className="text-blue-400 hover:underline text-sm"
                  >
                    Browse Training Library
                  </button>
                </div>
              </div>
              
              <div className="game-card rounded-lg p-5">
                <div className="h-12 w-12 rounded-full bg-yellow-600 flex items-center justify-center mb-4 mx-auto">
                  <FaComments className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-center mb-2">COMMUNITY FORUM</h4>
                <p className="text-sm text-gray-400 text-center mb-4">Connect with other commanders, share strategies, and form powerful alliances.</p>
                <div className="text-center">
                  <button 
                    onClick={() => setShowForum(true)}
                    className="text-blue-400 hover:underline text-sm"
                  >
                    Join Discussions
                  </button>
                </div>
              </div>
            </div>
            
            {/* Past Seasons Showcase */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 military-header">PAST SEASONS</h2>
              <div className="battlefield-pattern p-5 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {pastSeasons.map(season => (
                    <div key={season.id} className="game-card rounded-lg overflow-hidden">
                      <div className="h-32 bg-gray-700"></div>
                      <div className="p-3">
                        <h4 className="font-bold">{season.name}</h4>
                        <p className="text-xs text-gray-400 mb-2">{season.date}</p>
                        <div className="flex justify-between text-sm">
                          <span>{season.players} Players</span>
                          <span className="text-yellow-400">{season.winner}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <footer className="bg-gray-800 p-6 border-t border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-500 mt-2"> 2025 Soldiers of Wealth. All rights reserved.</p>
              </div>
              <div className="flex flex-wrap justify-center space-x-4">
                <Link to="#" className="text-gray-400 hover:text-white">Terms of Service</Link>
                <Link to="#" className="text-gray-400 hover:text-white">Privacy Policy</Link>
                <Link to="#" className="text-gray-400 hover:text-white">Support</Link>
                <Link to="#" className="text-gray-400 hover:text-white">Contact</Link>
              </div>
            </div>
          </footer>
        </div>
      </section>
      
      {/* Rulebook Modal */}
      <Modal
        isOpen={showRulebook}
        onClose={() => setShowRulebook(false)}
        title="SOLDIERS OF WEALTH RULEBOOK"
      >
        <Rulebook />
      </Modal>

      {/* Training Modal */}
      <Modal
        isOpen={showTraining}
        onClose={() => setShowTraining(false)}
        title="TRAINING LIBRARY"
      >
        <Training />
      </Modal>

      {/* Forum Modal */}
      <Modal
        isOpen={showForum}
        onClose={() => setShowForum(false)}
        title="COMMUNITY FORUM"
      >
        <Forum />
      </Modal>
    </>
  );
}
