import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestore, collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { FaBook, FaGraduationCap, FaComments, FaPlay, FaClock, FaCheckCircle, FaHourglassHalf, FaLock } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '../common/Modal';
import Rulebook from '../game/Rulebook';
import Training from '../game/Training';
import Forum from '../forum/Forum';
// import Forum from '../game/Forum';
import GameRules from '../game/GameRules';

const Dashboard = () => {
  const [upcomingGames, setUpcomingGames] = useState([]);
  const [activeGames, setActiveGames] = useState([]);
  const [pastGames, setPastGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playerStats, setPlayerStats] = useState(null);
  const [showRulebook, setShowRulebook] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [showForum, setShowForum] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [gameRequests, setGameRequests] = useState({});
  const [nextBattle, setNextBattle] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const db = getFirestore();

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      // Get upcoming games
      const upcomingQuery = query(
        collection(db, 'games'),
        where('status', '==', 'upcoming')
      );
      const upcomingSnapshot = await getDocs(upcomingQuery);
      const upcomingGames = upcomingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUpcomingGames(upcomingGames);

      // Get active games where the current user is a player
      const activeQuery = query(
        collection(db, 'games'),
        where('status', '==', 'active'),
        where('players', 'array-contains', currentUser.uid)
      );
      const activeSnapshot = await getDocs(activeQuery);
      const activeGames = activeSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActiveGames(activeGames);

      // Get past games
      const pastGamesSnapshot = await getDocs(collection(db, 'pastGames'));
      const pastGamesData = pastGamesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPastGames(pastGamesData);

      setLoading(false);
    } catch (error) {
      console.error('Error loading games:', error);
      setError('Failed to load games');
      setLoading(false);
    }
  };

  const handleEnlist = async (gameId) => {
    try {
      const gameRef = doc(db, 'games', gameId);
      const game = upcomingGames.find(g => g.id === gameId);
      
      if (game.spotsLeft <= 0) {
        setError('No spots left in this game');
        return;
      }

      await updateDoc(gameRef, {
        players: [...(game.players || []), currentUser.uid],
        spotsLeft: game.spotsLeft - 1,
        commandersEnlisted: (game.commandersEnlisted || 0) + 1,
        lastUpdated: new Date().toISOString()
      });

      // Refresh games
      loadGames();
    } catch (error) {
      console.error('Error enlisting in game:', error);
      setError('Failed to enlist in game');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const formatTimeRemaining = (hours) => {
    if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) {
      return `${days} day${days === 1 ? '' : 's'}`;
    }
    return `${days} day${days === 1 ? '' : 's'} ${remainingHours} hour${remainingHours === 1 ? '' : 's'}`;
  };

  const formatHistoricalDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getBattleStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      const timeUntil = Math.ceil((start - now) / (1000 * 60 * 60));
      return {
        status: 'upcoming',
        label: 'Battle Begins Soon',
        icon: FaClock,
        timeUntil,
        timeUntilFormatted: formatTimeRemaining(timeUntil)
      };
    } else if (now >= start && now <= end) {
      const timeLeft = Math.ceil((end - now) / (1000 * 60 * 60));
      return {
        status: 'active',
        label: 'Battle In Progress',
        icon: FaCheckCircle,
        timeLeft,
        timeLeftFormatted: formatTimeRemaining(timeLeft)
      };
    } else {
      return {
        status: 'ended',
        label: 'Battle Ended',
        icon: FaHourglassHalf,
      };
    }
  };

  const getBattleRequestStatus = (gameId) => {
    const request = gameRequests[gameId];
    if (!request) return null;
    
    if (request.status === 'approved') {
      const battleStatus = getBattleStatus(
        upcomingGames.find(g => g.id === gameId)?.startDate,
        upcomingGames.find(g => g.id === gameId)?.endDate
      );
      if (battleStatus.status === 'active') {
        return { text: 'Battle Active', className: 'bg-green-600 text-white' };
      } else if (battleStatus.status === 'upcoming') {
        return { text: 'Approved - Starting Soon', className: 'bg-yellow-600 text-white' };
      } else {
        return { text: 'Battle Ended', className: 'bg-gray-600 text-white' };
      }
    } else if (request.status === 'pending') {
      return { text: 'Enlistment Pending', className: 'bg-gray-600 text-gray-400' };
    } else if (request.status === 'rejected') {
      return { text: 'Enlistment Rejected', className: 'bg-red-600 text-white' };
    }
    return null;
  };

  const canEnterBattle = (battle) => {
    if (!battle || !battle.requestData || battle.requestData.status !== 'approved') {
      return false;
    }

    const battleStatus = getBattleStatus(battle.startDate, battle.endDate);
    return battleStatus.status === 'active';
  };

  const handleGameRequest = async (gameId, gameName) => {
    if (!currentUser) {
      toast.error('Please sign in to request to join.');
      return;
    }

    if (gameRequests[gameId]) {
      toast.info('You have already requested to join this battle. Please wait for approval.');
      return;
    }

    try {
      toast.info('Sending enlistment request...', { autoClose: 2000 });
      
      const requestData = {
        userId: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || 'Anonymous Soldier',
        gameId: gameId,
        gameName: gameName,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const requestId = `${currentUser.uid}-${gameId}-${Date.now()}`;
      await updateDoc(doc(db, 'joinRequests', requestId), requestData);
      
      setGameRequests(prev => ({
        ...prev,
        [gameId]: requestData
      }));
      
      toast.success(`Enlistment request for ${gameName} sent successfully! We will review your application shortly.`);
    } catch (error) {
      console.error('Error sending game request:', error);
      toast.error('Failed to send enlistment request. Please try again.');
    }
  };

  useEffect(() => {
    const checkGameRequests = async () => {
      if (!currentUser) return;
      
      try {
        const requestsRef = collection(db, 'joinRequests');
        const q = query(requestsRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const requests = {};
        let approvedBattle = null;
        const now = new Date();

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          requests[data.gameId] = data;
          
          // Find the next approved battle
          if (data.status === 'approved') {
            const game = upcomingGames.find(g => g.id === data.gameId);
            if (game) {
              const battleEnd = new Date(game.endDate);
              // Only consider battles that haven't ended yet
              if (battleEnd > now) {
                if (!approvedBattle || new Date(game.startDate) < new Date(approvedBattle.startDate)) {
                  approvedBattle = {
                    ...game,
                    requestData: data
                  };
                }
              }
            }
          }
        });
        
        setGameRequests(requests);
        setNextBattle(approvedBattle);
        setLoading(false);
      } catch (error) {
        console.error('Error checking game requests:', error);
        setLoading(false);
      }
    };

    checkGameRequests();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a2639] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <section className="p-6 min-h-screen bg-[#1a2639]">
        <div className="max-w-6xl mx-auto bg-gray-900 rounded-lg overflow-hidden shadow-2xl border-2 border-[#4A5D23] hover:border-[#D4AF37] transition-all">
          {/* Top Navigation Bar */}
          <nav className="bg-gray-800 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold text-white font-impact uppercase tracking-wider">SOLDIERS OF WEALTH</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button onClick={() => setShowRules(true)} className="text-gray-300 hover:text-white">Game Rules</button>
              <button onClick={() => setShowComingSoon(true)} className="text-gray-300 hover:text-white">FAQ</button>
              <button onClick={() => setShowComingSoon(true)} className="text-gray-300 hover:text-white">Leaderboard</button>
              <Link to="/profile" className="relative">
                <button className="flex items-center space-x-2">
                  <span className="text-white">{currentUser.email}</span>
                </button>
              </Link>
            </div>
          </nav>

          {/* Main Content */}
          <div className="p-6">
            {/* Hero Section - Next Battle */}
            <div className="mb-8 bg-gray-800 p-6 rounded-lg border-2 border-[#4A5D23] hover:border-[#D4AF37] transition-all">
              <h2 className="text-3xl font-bold mb-4 font-impact uppercase tracking-wider">
                {nextBattle ? 'YOUR NEXT BATTLE' : 'NO ACTIVE BATTLES'}
              </h2>
              {nextBattle ? (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-bold text-[#D4AF37] mb-2">{nextBattle.name}</h3>
                    <p className="text-gray-300 mb-2">Battle Begins: <span className="text-[#D4AF37] font-bold">{formatDate(nextBattle.startDate)}</span></p>
                    <p className="text-gray-300 mb-2">Battle Ends: <span className="text-[#D4AF37] font-bold">{formatDate(nextBattle.endDate)}</span></p>
                    <p className="text-gray-300">Entry Fee: <span className="text-[#D4AF37] font-bold">{nextBattle.entryFee} Gold</span></p>
                    <p className="text-gray-300">Potential Reward: <span className="text-[#D4AF37] font-bold">{nextBattle.reward} Gold</span></p>
                    <div className="flex items-center mt-3">
                      <span className="text-sm text-gray-300 mr-3">Difficulty:</span>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`h-4 w-4 ${i < nextBattle.difficultyLevel ? 'bg-green-600' : 'bg-gray-600'} rounded-full`}
                          ></span>
                        ))}
                      </div>
                      <span className="ml-2 text-sm">{nextBattle.difficulty}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start space-y-4">
                    {(() => {
                      const battleStatus = getBattleStatus(nextBattle.startDate, nextBattle.endDate);
                      const StatusIcon = battleStatus.icon;
                      const isApproved = nextBattle.requestData?.status === 'approved';
                      const canEnter = canEnterBattle(nextBattle);
                      
                      return (
                        <>
                          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                            !isApproved
                              ? 'bg-red-600 bg-opacity-20 text-red-400'
                              : battleStatus.status === 'active' 
                                ? 'bg-green-600 bg-opacity-20 text-green-400'
                                : battleStatus.status === 'upcoming'
                                  ? 'bg-yellow-600 bg-opacity-20 text-yellow-400'
                                  : 'bg-red-600 bg-opacity-20 text-red-400'
                          }`}>
                            {!isApproved ? <FaLock className="text-lg" /> : <StatusIcon className="text-lg" />}
                            <span className="font-bold">
                              {!isApproved 
                                ? 'Approval Required'
                                : <>
                                    {battleStatus.label}
                                    {battleStatus.status === 'upcoming' && ` (${battleStatus.timeUntilFormatted})`}
                                    {battleStatus.status === 'active' && ` (${battleStatus.timeLeftFormatted} left)`}
                                  </>
                              }
                            </span>
                          </div>
                          <button
                            onClick={() => navigate(`/game/${nextBattle.id}`)}
                            disabled={!canEnter}
                            className={`w-full md:w-auto px-8 py-4 rounded font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center space-x-2
                              ${canEnter
                                ? 'bg-[#D4AF37] text-[#1a2639] hover:bg-[#e5c158] hover:transform hover:scale-105'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              }`}
                          >
                            <FaPlay className="text-lg" />
                            <span>
                              {!isApproved 
                                ? 'Approval Required'
                                : battleStatus.status === 'upcoming'
                                  ? 'Battle Not Started'
                                  : battleStatus.status === 'ended'
                                    ? 'Battle Ended'
                                    : 'Enter Battle'
                              }
                            </span>
                          </button>
                        </>
                      );
                    })()}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowRulebook(true)}
                        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                      >
                        <FaBook className="text-xl" />
                        <span>Rulebook</span>
                      </button>
                      <button
                        onClick={() => setShowTraining(true)}
                        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                      >
                        <FaGraduationCap className="text-xl" />
                        <span>Training</span>
                      </button>
                      <button
                        onClick={() => setShowForum(true)}
                        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                      >
                        <FaComments className="text-xl" />
                        <span>Forum</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-300 mb-4">You have no approved battles at this time. Request to join a battle below to begin your journey.</p>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => setShowRulebook(true)}
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                    >
                      <FaBook className="text-xl" />
                      <span>Rulebook</span>
                    </button>
                    <button
                      onClick={() => setShowTraining(true)}
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                    >
                      <FaGraduationCap className="text-xl" />
                      <span>Training</span>
                    </button>
                    <button
                      onClick={() => setShowForum(true)}
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                    >
                      <FaComments className="text-xl" />
                      <span>Forum</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Welcome Banner */}
            <div className="relative">
              <div className="h-64 bg-gray-800"></div>
              <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center px-12 text-center">
                <h1 className="text-4xl font-bold mb-3 font-impact uppercase tracking-wider">WELCOME TO THE RANKS, COMMANDER</h1>
                <p className="text-xl text-gray-300">Your account has been successfully created. Prepare for battle in the financial markets.</p>
              </div>
            </div>
            
            {/* Signup Completion Status */}
            <div className="p-8">
              {/* Onboarding Progress */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 font-impact uppercase tracking-wider">COMMANDER ONBOARDING</h2>
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-[#4A5D23] p-3 rounded-md text-center">
                    <div className="h-10 w-10 rounded-full bg-white text-green-800 flex items-center justify-center mx-auto mb-2 font-bold text-lg">✓</div>
                    <p className="font-bold">Create Account</p>
                    <p className="text-sm text-gray-300">Complete</p>
                  </div>
                  
                  <div className="bg-[#D4AF37] text-[#1a2639] p-3 rounded-md text-center">
                    <div className="h-10 w-10 rounded-full bg-white text-gray-800 flex items-center justify-center mx-auto mb-2 font-bold text-lg">2</div>
                    <p className="font-bold">Join Battle</p>
                    <p className="text-sm">Action Required</p>
                  </div>
                  
                  <div className="bg-gray-800 border border-dashed border-[#4A5D23] p-3 rounded-md text-center">
                    <div className="h-10 w-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center mx-auto mb-2 font-bold text-lg">3</div>
                    <p className="font-bold text-gray-400">Training</p>
                    <p className="text-sm text-gray-500">Locked</p>
                  </div>
                  
                  <div className="bg-gray-800 border border-dashed border-[#4A5D23] p-3 rounded-md text-center">
                    <div className="h-10 w-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center mx-auto mb-2 font-bold text-lg">4</div>
                    <p className="font-bold text-gray-400">First Mission</p>
                    <p className="text-sm text-gray-500">Locked</p>
                  </div>
                </div>
              </div>
              
              {/* Next Step Card */}
              <div className="bg-gray-800 border-2 border-[#4A5D23] hover:border-[#D4AF37] transition-all rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold font-impact uppercase tracking-wider">AVAILABLE BATTLES</h3>
                  <span className="text-yellow-300 px-3 py-1 bg-green-900 bg-opacity-30 rounded-full text-sm font-bold">ACTIVE RECRUITMENT</span>
                </div>
                
                <p className="text-gray-300 mb-6">Choose your battlefield wisely, Commander. Each battle offers unique challenges and rewards.</p>
                
                <div className="space-y-4">
                  {upcomingGames.map(game => (
                    <div key={game.id} className="bg-[rgba(74,93,35,0.2)] border-l-4 border-[#4A5D23] rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h4 className="font-bold">{game.name}</h4>
                          <p className="text-sm text-gray-400">
                            Begins {formatDate(game.startDate)}
                            <br />
                            Ends {formatDate(game.endDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="block text-yellow-400 font-bold">{game.spotsLeft} SPOTS LEFT</span>
                          <span className="text-xs text-gray-400">{game.commandersEnlisted} Commanders Enlisted</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-300 mr-3">Difficulty:</span>
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`h-4 w-4 ${i < game.difficultyLevel ? 'bg-green-600' : 'bg-gray-600'} rounded-full`}
                              ></span>
                            ))}
                          </div>
                          <span className="ml-2 text-sm">{game.difficulty}</span>
                        </div>
                        {(() => {
                          const status = getBattleRequestStatus(game.id);
                          if (status) {
                            return (
                              <span className={`px-4 py-2 rounded-full text-sm font-bold ${status.className}`}>
                                {status.text}
                              </span>
                            );
                          }
                          return (
                            <button
                              onClick={() => handleGameRequest(game.id, game.name)}
                              className="px-6 py-3 rounded font-bold text-sm uppercase tracking-wider transition-all bg-[#4A5D23] text-white hover:bg-[#5e7836] hover:transform hover:scale-105"
                            >
                              Request to Enlist
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Game Info & Resources */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 border-2 border-[#4A5D23] hover:border-[#D4AF37] transition-all rounded-lg p-5 transform hover:-translate-y-1">
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
                
                <div className="bg-gray-800 border-2 border-[#4A5D23] hover:border-[#D4AF37] transition-all rounded-lg p-5 transform hover:-translate-y-1">
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
                
                <div className="bg-gray-800 border-2 border-[#4A5D23] hover:border-[#D4AF37] transition-all rounded-lg p-5 transform hover:-translate-y-1">
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
              
              {/* Past Seasons Section */}
              <div className="bg-gray-800 border-2 border-[#4A5D23] hover:border-[#D4AF37] transition-all rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 font-impact uppercase tracking-wider">PAST SEASONS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastGames.map(game => (
                    <div key={game.id} className="bg-[rgba(74,93,35,0.2)] rounded-lg overflow-hidden">
                      <div className="h-48 bg-gray-700 relative overflow-hidden">
                        <img 
                          src={game.image} 
                          alt={game.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <h3 className="text-xl font-bold text-center px-4">{game.name}</h3>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-sm text-gray-400">{formatHistoricalDate(game.date)}</div>
                        <div className="mt-2">
                          <div className="text-green-400">Winner: {game.winner}</div>
                          <div className="text-gray-400">{game.players} Players</div>
                        </div>
                      </div>
                    </div>
                  ))}
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
        </div>
      </section>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Modal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        title="Game Rules"
      >
        <GameRules />
      </Modal>

      <Modal
        isOpen={showRulebook}
        onClose={() => setShowRulebook(false)}
        title="SOLDIERS OF WEALTH RULEBOOK"
      >
        <Rulebook />
      </Modal>

      <Modal
        isOpen={showTraining}
        onClose={() => setShowTraining(false)}
        title="TRAINING LIBRARY"
      >
        <Training />
      </Modal>

      <Modal
        isOpen={showForum}
        onClose={() => setShowForum(false)}
        title="COMMUNITY FORUM"
      >
        <Forum />
      </Modal>

      <Modal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
      >
        <div className="bg-gray-900 text-white p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">COMING SOON!</h2>
          <p className="text-gray-300 mb-6">
           This feature is currently in production. Stay tuned, Commander!
          </p>
          <button
            onClick={() => setShowComingSoon(false)}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            UNDERSTOOD
          </button>
        </div>
      </Modal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => setShowRulebook(true)}
          className="game-card p-6 rounded-lg hover:bg-gray-800 transition-colors flex flex-col items-center justify-center"
        >
          <FaBook className="text-3xl text-green-500 mb-2" />
          <span className="font-bold">Rulebook</span>
        </button>

        <button
          onClick={() => setShowTraining(true)}
          className="game-card p-6 rounded-lg hover:bg-gray-800 transition-colors flex flex-col items-center justify-center"
        >
          <FaGraduationCap className="text-3xl text-green-500 mb-2" />
          <span className="font-bold">Training</span>
        </button>

        <button
          onClick={() => setShowForum(true)}
          className="game-card p-6 rounded-lg hover:bg-gray-800 transition-colors flex flex-col items-center justify-center"
        >
          <FaComments className="text-3xl text-green-500 mb-2" />
          <span className="font-bold">Forum</span>
        </button>

        <button
          onClick={() => setShowComingSoon(true)}
          className="game-card p-6 rounded-lg hover:bg-gray-800 transition-colors flex flex-col items-center justify-center"
        >
          <FaPlay className="text-3xl text-green-500 mb-2" />
          <span className="font-bold">Watch Gameplay</span>
        </button>
      </div>
    </>
  );
};

export default Dashboard;
