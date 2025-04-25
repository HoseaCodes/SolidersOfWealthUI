import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PlayerActions from './PlayerActions';
import { getFirestore, addDoc, doc, getDoc, updateDoc, setDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import ResponsiveNavbar from './Navbar';
import WeeklyMovesDashboard from './WeeklyMovesDashboard';
import { validateAction } from '../../utils';
import Battlefield from './Battlefield';
import MarketDashboard from './MarketDashboard';
import IntelligenceBoard from './IntelligenceBoard';
import IntelligenceBriefing from './IntelligenceBriefing';
import CurrentAction from './CurrentAction';
import Gameboard from './Gameboard';
import ActionsRemaining from './ActionsRemaining';
import EconomicStatusAlert from './EconomicStatusAlert';
import { marketStatus } from '../../constants';

const CommandCenter = () => {
  const { gameId } = useParams();
  const [activeTab, setActiveTab] = useState('command');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [soldiers, setSoldiers] = useState(60); // Initialize from database, not hardcoded
  const [actionsRemaining, setActionsRemaining] = useState(3);
  const [currentAction, setCurrentAction] = useState(null);
  const [notifications] = useState(3);
  const [soldierInvestments, setSoldierInvestments] = useState({
    stocks: 0,
    realEstate: 0,
    crypto: 0,
    business: 0
  });
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [attackSoldiers, setAttackSoldiers] = useState(50);
  const [gameData, setGameData] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weeklyIntelligence, setWeeklyIntelligence] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [weeklyMoves, setWeeklyMoves] = useState([]);
  const [maxMoves, setMaxMoves] = useState(3);
  const [movesSubmitted, setMovesSubmitted] = useState(false);
  const [isEditingMoves, setIsEditingMoves] = useState(false);
  const { currentUser } = useAuth();
  const db = getFirestore();
  const playerId = currentUser?.uid;

  // Load game data based on gameId
  useEffect(() => {
    const loadGameData = async () => {
      if (gameId) {
        try {
          setLoading(true);
          const gameDocRef = doc(db, 'games', gameId);
          const gameDoc = await getDoc(gameDocRef);
          
          if (gameDoc.exists()) {
            setGameData({
              id: gameDoc.id,
              ...gameDoc.data()
            });
            
            // Load current week from game data
            const weekData = gameDoc.data().currentWeek || 1;
            setCurrentWeek(weekData);
          } else {
            console.error('Game not found');
            setErrorMessage('Game not found. Please check the game ID.');
            // Handle game not found error
          }
        } catch (error) {
          console.error('Error loading game data:', error);
          setErrorMessage(`Error loading game data: ${error.message}`);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadGameData();
  }, [gameId, db]);

  // Load player-specific data
  useEffect(() => {
    const loadPlayerData = async () => {
      if (gameId && playerId) {
        try {
          // Get player document from the game
          const playerDocRef = doc(db, 'games', gameId, 'players', playerId);
          const playerDoc = await getDoc(playerDocRef);
          
          if (playerDoc.exists()) {
            // Player exists, load their data
            const data = playerDoc.data();
            setPlayerData(data);
            setActionsRemaining(data.actionsRemaining || 3);
            // Ensure soldier count comes from database
            setSoldiers(data.soldiers || 165); // Use database value or default
            
            // Load current investments if available
            if (data.investments) {
              setSoldierInvestments(data.investments);
            }
          } else {
            console.log("Player document doesn't exist yet - will be created when first action is taken");
            // Set default values for a new player
            setSoldiers(165); // Default starting soldiers
            setActionsRemaining(3); // Default starting actions
          }
          // Try to load intelligence with all filters first
          try {
            // Load intelligence specific to this player
            const intelligenceRef = collection(db, 'games', gameId, 'intelligence');
            const q = query(
              intelligenceRef,
              where('targetPlayerId', '==', playerId),
              where('week', '==', currentWeek),
              orderBy('timestamp', 'desc')
            );
            
            const intelligenceSnapshot = await getDocs(q);
            const intelligenceData = intelligenceSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            setWeeklyIntelligence(intelligenceData);
          } catch (error) {
            console.warn('Intelligence query requires an index. Falling back to simpler query:', error);
            
            // If the composite index doesn't exist, fall back to a simpler query
            try {
              const intelligenceRef = collection(db, 'games', gameId, 'intelligence');
              const simpleQuery = query(
                intelligenceRef,
                where('targetPlayerId', '==', playerId)
              );
              
              const intelligenceSnapshot = await getDocs(simpleQuery);
              const intelligenceData = intelligenceSnapshot.docs
                .map(doc => ({
                  id: doc.id,
                  ...doc.data()
                }))
                // Filter for current week and sort by timestamp manually
                .filter(intel => intel.week === currentWeek)
                .sort((a, b) => {
                  // Sort by timestamp in descending order (newest first)
                  const timestampA = a.timestamp?.toDate?.() || new Date(0);
                  const timestampB = b.timestamp?.toDate?.() || new Date(0);
                  return timestampB - timestampA;
                });
              
              setWeeklyIntelligence(intelligenceData);
            } catch (fallbackError) {
              console.error('Error loading intelligence with fallback query:', fallbackError);
              setWeeklyIntelligence([]);
            }
          }
        } catch (error) {
          console.error('Error loading player data:', error);
          setErrorMessage(`Error loading player data: ${error.message}`);
        }
      }
    };
    
    loadPlayerData();
  }, [gameId, playerId, db, currentWeek]);

  // Load weekly moves data
  useEffect(() => {
    const loadPlayerWeeklyMoves = async () => {
      if (gameId && playerId) {
        try {
          // Check if player has already submitted moves for this week
          const playerMovesRef = collection(db, 'games', gameId, 'weeklyMoves');
          const q = query(
            playerMovesRef,
            where('playerId', '==', playerId),
            where('week', '==', currentWeek)
          );
          
          const movesSnapshot = await getDocs(q);
          
          if (!movesSnapshot.empty) {
            // Player has already submitted moves for this week
            const moveDoc = movesSnapshot.docs[0];
            const moveData = moveDoc.data();
            
            setWeeklyMoves(moveData.moves || []);
            setMovesSubmitted(true);
          } else {
            // No moves submitted for this week
            setWeeklyMoves([]);
            setMovesSubmitted(false);
          }
        } catch (error) {
          console.error('Error loading weekly moves:', error);
          setErrorMessage(`Error loading weekly moves: ${error.message}`);
        }
      }
    };
    
    loadPlayerWeeklyMoves();
  }, [gameId, playerId, db, currentWeek]);
  
  // Default players data
  const players = [
    {
      id: 'you',
      name: 'YOU',
      title: 'Commander Alpha',
      soldiers: soldiers || 90, // Use dynamic soldier count from state
      weeklySoldierIncome: 50,
      actionsPerWeek: 3,
      actionsRemaining: actionsRemaining, // Use dynamic actions remaining
      defense: 'Strong',
      defenseLevel: 75,
      investments: soldierInvestments, // Use dynamic investments
      isYou: true
    },
    {
      id: 'grace',
      name: 'Grace Anderson',
      title: 'Commander Echo',
      soldiers: 100,
      weeklySoldierIncome: 50,
      actionsPerWeek: 3,
      actionsRemaining: 3,
      defense: 'Very Strong',
      defenseLevel: 90,
      alliance: 'ally',
      investmentsHidden: true
    },
    {
      id: 'romado',
      name: 'Romado S.',
      title: 'Commander Zulu',
      soldiers: 100,
      weeklySoldierIncome: 50,
      actionsPerWeek: 3,
      actionsRemaining: 3,
      defense: 'Moderate',
      defenseLevel: 45,
      alliance: 'neutral',
      investments: { crypto: 60, business: 20, cash: 20 }
    },
    {
      id: 'charles',
      name: 'Charles Nolen II',
      title: 'Commander Delta',
      soldiers: 100,
      weeklySoldierIncome: 50,
      actionsPerWeek: 3,
      actionsRemaining: 3,
      defense: 'Weak',
      defenseLevel: 25,
      alliance: 'enemy',
      investments: { stocks: 70, realEstate: 10, cash: 20 }
    }
  ];

  const battlefieldTiles = [
    { type: 'empty' }, { type: 'player', player: 'charles', soldiers: 25 }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' },
    { type: 'empty' }, { type: 'market', name: 'Crypto', change: '+20%', color: 'gold' }, { type: 'empty' }, { type: 'market', name: 'Finance', change: '-15%', color: 'blue' }, { type: 'empty' },
    { type: 'empty' }, { type: 'player', player: 'you', soldiers: 50 }, { type: 'empty' }, { type: 'empty' }, { type: 'player', player: 'romado', soldiers: 45 },
    { type: 'empty' }, { type: 'empty' }, { type: 'alliance', name: 'Alliance', desc: 'Opportunity' }, { type: 'empty' }, { type: 'empty' },
    { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'player', player: 'grace', soldiers: 70 }, { type: 'empty' }
  ];

  // FIXED: Modified to allow multiple actions of the same type
  const addWeeklyMove = (moveData) => {
    // Check if we've reached the maximum number of moves
    if (weeklyMoves.length >= maxMoves && !isEditingMoves) {
      setErrorMessage(`You can only select up to ${maxMoves} moves per week`);
      return false;
    }
    
    // Don't allow adding moves if they're already submitted (unless editing)
    if (movesSubmitted && !isEditingMoves) {
      setErrorMessage("Your moves for this week have already been submitted. Edit your moves to make changes.");
      return false;
    }
    
    // Determine the move type
    const moveType = moveData.investment ? 'investment' : 
                    moveData.offensive ? 'offensive' : 
                    moveData.defensive ? 'defensive' : 'unknown';
    
    // Add the move to the array - allow multiple of same type
    if (isEditingMoves) {
      // If editing, we might replace or add
      const updatedMoves = [...weeklyMoves];
      
      // Check if we're at max moves
      if (updatedMoves.length < maxMoves) {
        updatedMoves.push({
          ...moveData,
          type: moveType
        });
        setWeeklyMoves(updatedMoves);
      } else {
        setErrorMessage(`You can only select up to ${maxMoves} moves per week`);
        return false;
      }
    } else {
      // If not editing, add to the existing moves
      setWeeklyMoves([
        ...weeklyMoves, 
        {
          ...moveData,
          type: moveType
        }
      ]);
    }
    
    return true;
  };

  // Add function to submit all weekly moves to the database
  const submitWeeklyMoves = async () => {
    if (weeklyMoves.length === 0) {
      setErrorMessage("You must select at least one move before submitting");
      return;
    }
    
    if (gameId && playerId) {
      try {
        // First create or update the player document
        const playerDocRef = doc(db, 'games', gameId, 'players', playerId);
        const playerDoc = await getDoc(playerDocRef);
        
        if (!playerDoc.exists()) {
          // Create player document if it doesn't exist
          await setDoc(playerDocRef, {
            playerId,
            playerName: currentUser?.displayName || "Unknown Player",
            soldiers: soldiers,
            actionsRemaining: 0, // All actions used for this week
            investments: soldierInvestments,
            createdAt: new Date(),
            lastUpdated: new Date()
          });
          console.log("Created new player document");
        } else {
          // Update existing document to show all actions used
          await updateDoc(playerDocRef, {
            actionsRemaining: 0,
            lastUpdated: new Date()
          });
        }
        
        // Find existing weekly moves document for this week
        const weeklyMovesRef = collection(db, 'games', gameId, 'weeklyMoves');
        const q = query(
          weeklyMovesRef,
          where('playerId', '==', playerId),
          where('week', '==', currentWeek)
        );
        
        const existingMoves = await getDocs(q);
        
        if (!existingMoves.empty) {
          // Update existing document
          const moveDocRef = doc(db, 'games', gameId, 'weeklyMoves', existingMoves.docs[0].id);
          await updateDoc(moveDocRef, {
            moves: weeklyMoves,
            lastUpdated: new Date()
          });
        } else {
          // Create new document for this week's moves
          await addDoc(weeklyMovesRef, {
            playerId,
            playerName: currentUser?.displayName || "You",
            week: currentWeek,
            timestamp: new Date(),
            moves: weeklyMoves,
            status: 'pending' // Will be processed at end of week
          });
        }
        
        // Update local state
        setMovesSubmitted(true);
        setIsEditingMoves(false);
        setActionsRemaining(0);
        
        // Set success message
        setErrorMessage(null);
        setSuccessMessage("Your moves for this week have been submitted successfully!");
        
        // Clear success message after a few seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
        
      } catch (error) {
        console.error('Error submitting weekly moves:', error);
        setErrorMessage(`Failed to submit moves: ${error.message}`);
      }
    }
  };

  // Add function to toggle editing mode
  const toggleEditMoves = () => {
    setIsEditingMoves(!isEditingMoves);
    
    if (!isEditingMoves) {
      // When entering edit mode, restore actions
      setActionsRemaining(3);
    } else {
      // When exiting edit mode, mark actions as used
      setActionsRemaining(0);
    }
  };

  // Add function to remove a move from the weekly moves list
  const removeWeeklyMove = (index) => {
    const updatedMoves = [...weeklyMoves];
    updatedMoves.splice(index, 1);
    setWeeklyMoves(updatedMoves);
  };

  const handleBattlefieldAction = (actionType, targetPlayerId) => {
    // If no actions remaining or moves submitted, don't allow new actions
    if (actionsRemaining <= 0 && !isEditingMoves) {
      setErrorMessage("No actions remaining this week");
      return;
    }
    
    if (movesSubmitted && !isEditingMoves) {
      setErrorMessage("Your moves for this week have already been submitted. Edit your moves to make changes.");
      return;
    }
    
    if (weeklyMoves.length >= maxMoves && !isEditingMoves) {
      setErrorMessage(`You can only select up to ${maxMoves} moves per week`);
      return;
    }
    
    const targetPlayer = players.find(p => p.id === targetPlayerId);
    const actionData = {
      offensive: {
        type: actionType,
        targetPlayer: targetPlayerId,
        targetName: targetPlayer?.name || 'Unknown Commander'
      }
    };
    
    // Validate and clean the action data
    const validationResult = validateAction(actionData);
    
    if (!validationResult.valid) {
      setErrorMessage(validationResult.message);
      return;
    }
    
    // Use the cleaned data
    const cleanedActionData = validationResult.cleanedData;
    
    // Add to weekly moves
    const moveAdded = addWeeklyMove(cleanedActionData);
    
    if (moveAdded) {
      // Only decrement actions if move was successfully added
      if (!isEditingMoves) {
        setActionsRemaining(prevActions => Math.max(0, prevActions - 1));
      }
      setCurrentAction(cleanedActionData);
      // Return to command center to show the selection
      setActiveTab('command');
    }
  };

  const handleMarketInvestment = (market, amount) => {
    // If no actions remaining or moves submitted, don't allow new actions
    if (actionsRemaining <= 0 && !isEditingMoves) {
      setErrorMessage("No actions remaining this week");
      return;
    }
    
    if (movesSubmitted && !isEditingMoves) {
      setErrorMessage("Your moves for this week have already been submitted. Edit your moves to make changes.");
      return;
    }
    
    if (weeklyMoves.length >= maxMoves && !isEditingMoves) {
      setErrorMessage(`You can only select up to ${maxMoves} moves per week`);
      return;
    }
    
    // Validate amount
    if (amount > soldiers) {
      setErrorMessage(`Cannot invest ${amount} soldiers when you only have ${soldiers}`);
      return;
    }
    
    const actionData = {
      investment: {
        type: 'invest',
        amount: amount,
        market: market
      }
    };
    
    // Validate and clean the action data
    const validationResult = validateAction(actionData);
    
    if (!validationResult.valid) {
      setErrorMessage(validationResult.message);
      return;
    }
    
    // Use the cleaned data
    const cleanedActionData = validationResult.cleanedData;
    
    // Add to weekly moves
    const moveAdded = addWeeklyMove(cleanedActionData);
    
    if (moveAdded) {
      // Decrement actions remaining if not in edit mode
      if (!isEditingMoves) {
        setActionsRemaining(prevActions => Math.max(0, prevActions - 1));
      }
      setCurrentAction(cleanedActionData);
      // Switch back to command tab after investment
      setActiveTab('command');
    }
  };

  const handleActionSubmit = async (actionData) => {
    // If no actions remaining or moves submitted, don't allow new actions
    if (actionsRemaining <= 0 && !isEditingMoves) {
      setErrorMessage("No actions remaining this week");
      return;
    }
    
    if (movesSubmitted && !isEditingMoves) {
      setErrorMessage("Your moves for this week have already been submitted. Edit your moves to make changes.");
      return;
    }
    
    if (weeklyMoves.length >= maxMoves && !isEditingMoves) {
      setErrorMessage(`You can only select up to ${maxMoves} moves per week`);
      return;
    }
    
    // Validate the action
    const validationResult = validateAction(actionData);
    
    if (!validationResult.valid) {
      setErrorMessage(validationResult.message);
      return;
    }
    
    // Use the cleaned data
    const cleanedActionData = validationResult.cleanedData;
    
    // Add to weekly moves
    const moveAdded = addWeeklyMove(cleanedActionData);
    
    if (!moveAdded) {
      return; // If move wasn't added, don't continue
    }
    
    // Update actions remaining AFTER move is added
    if (!isEditingMoves) {
      setActionsRemaining(prevActions => Math.max(0, prevActions - 1));
    }
    
    setCurrentAction(cleanedActionData);
  };

  const handleViewMarket = () => {
    setActiveTab('market');
  };

  const handleViewBattlefield = () => {
    setActiveTab('battlefield');
  };

  const [intelligenceTab, setIntelligenceTab] = useState('leaderboard');
  const [playerStatsData, setPlayerStatsData] = useState({
    soldierGrowth: 15,
    attackSuccess: 60,
    defenseRate: 75,
    investmentROI: 10,
    wins: 0,
    successfulAttacks: 1,
    failedAttacks: 1,
    successfulDefenses: 3,
    failedDefenses: 1,
    totalAttacks: 2,
    totalDefenses: 4
  });

  const [achievements, setAchievements] = useState([
    { id: 1, name: 'First Blood', description: 'Successfully attack another commander', unlocked: true },
    { id: 2, name: 'Diversified Portfolio', description: 'Invest in 3 different markets', unlocked: true },
    { id: 3, name: 'War Profiteer', description: 'Capture 50+ soldiers in a single week', unlocked: false },
    { id: 4, name: 'Market Guru', description: 'Achieve 30%+ return in any market', unlocked: false }
  ]);

  const [weeklyHighlights, setWeeklyHighlights] = useState({
    topInvestor: { name: 'Romado S.', achievement: '+48% Crypto Return' },
    battlefieldCommander: { name: 'Charles Nolen II', achievement: '3 Successful Attacks' },
    defensiveStrategist: { name: 'Grace Anderson', achievement: '100% Defense Rate' }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a2639] flex items-center justify-center">
        <div className="text-white text-xl">Loading battle data...</div>
      </div>
    );
  }

  return (
    <section id="command-center" className="p-6 mb-16">
      <div className="max-w-6xl mx-auto bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
        {/* Top Navigation Bar */}
        <ResponsiveNavbar />
        
        {/* Game Information Banner */}
        {gameData && (
          <div className="px-6 pt-4 pb-2 bg-gradient-to-r from-gray-800 to-gray-900">
            <h2 className="text-2xl font-bold text-[#D4AF37]">{gameData.name || 'Battalion Command'}</h2>
            <div className="flex flex-wrap items-center text-sm text-gray-400 mt-1">
              <span className="mr-4">Battle ID: {gameId}</span>
              {gameData.startDate && <span className="mr-4">Begins: {new Date(gameData.startDate).toLocaleString()}</span>}
              {gameData.endDate && <span className="mr-4">Ends: {new Date(gameData.endDate).toLocaleString()}</span>}
              {gameData.players && <span className="mr-4">Commanders: {gameData.players.length}</span>}
              {gameData.currentWeek && <span>Current Week: {gameData.currentWeek}</span>}
            </div>
          </div>
        )}
        
        {/* Command Center Tabs */}
        <div className="flex border-b border-gray-700">
          <button 
            onClick={() => setActiveTab('command')} 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'command' ? 'bg-gray-900 text-white border-t-2 border-gold' : 'text-gray-400 hover:text-white'}`}
          >
            COMMAND
          </button>
          <button 
            onClick={() => setActiveTab('market')} 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'market' ? 'bg-gray-900 text-white border-t-2 border-gold' : 'text-gray-400 hover:text-white'}`}
          >
            MARKET
          </button>
          <button 
            onClick={() => setActiveTab('battlefield')} 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'battlefield' ? 'bg-gray-900 text-white border-t-2 border-gold' : 'text-gray-400 hover:text-white'}`}
          >
            BATTLEFIELD
          </button>
          <button 
            onClick={() => setActiveTab('intelligence')} 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'intelligence' ? 'bg-gray-900 text-white border-t-2 border-gold' : 'text-gray-400 hover:text-white'}`}
          >
            INTELLIGENCE
          </button>
        </div>
        
        {/* Main Content */}
        <div className="p-6">
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="bg-red-900 text-white px-6 py-4 rounded-lg mb-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold mb-1">ERROR</h3>
                <p>{errorMessage}</p>
              </div>
              <button 
                onClick={() => setErrorMessage(null)}
                className="text-white hover:text-red-300"
              >
                ✕
              </button>
            </div>
          )}
          
          {/* Success Message Alert */}
          {successMessage && (
            <div className="bg-green-900 text-white px-6 py-4 rounded-lg mb-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold mb-1">SUCCESS</h3>
                <p>{successMessage}</p>
              </div>
              <button 
                onClick={() => setSuccessMessage(null)}
                className="text-white hover:text-green-300"
              >
                ✕
              </button>
            </div>
          )}
          
          {activeTab === 'market' ? (
            <MarketDashboard
              marketStatus={marketStatus}
              errorMessage={errorMessage}
              successMessage={successMessage}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
              isEditingMoves={isEditingMoves}
              actionsRemaining={actionsRemaining}
              handleMarketInvestment={handleMarketInvestment}
              movesSubmitted={movesSubmitted}
              weeklyMoves={weeklyMoves}
              maxMoves={maxMoves}
              soldiers={soldiers}
              soldierInvestments={soldierInvestments}
              setActiveTab={setActiveTab}
            />
          ) : activeTab === 'battlefield' ? (
              <Battlefield  
              players={players}
              battlefieldTiles={battlefieldTiles}
              marketStatus={marketStatus}
              errorMessage={errorMessage}
              successMessage={successMessage}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
              isEditingMoves={isEditingMoves}
              actionsRemaining={actionsRemaining}
              handleBattlefieldAction={handleBattlefieldAction}
              movesSubmitted={movesSubmitted}
              weeklyMoves={weeklyMoves}
              maxMoves={maxMoves}
              setActiveTab={setActiveTab}
              />
          ) : activeTab === 'intelligence' ? (
              <IntelligenceBoard
                players={players}
                playerStatsData={playerStatsData}
                achievements={achievements}
                marketStatus={marketStatus}
                errorMessage={errorMessage}
                successMessage={successMessage}
                setErrorMessage={setErrorMessage}
                setSuccessMessage={setSuccessMessage}
                intelligenceTab={intelligenceTab}
                setIntelligenceTab={setIntelligenceTab}
                weeklyHighlights={weeklyHighlights}
                currentWeek={currentWeek}
              />
          ) : (
            <>
              <EconomicStatusAlert marketStatus={marketStatus} />
              
              <WeeklyMovesDashboard
                weeklyMoves={weeklyMoves}
                isEditingMoves={isEditingMoves}
                removeWeeklyMove={removeWeeklyMove}
                addWeeklyMove={addWeeklyMove}
                submitWeeklyMoves={submitWeeklyMoves}
                movesSubmitted={movesSubmitted} 
                currentWeek={currentWeek}
                maxMoves={maxMoves}
                toggleEditMoves={toggleEditMoves}
              />
              
              <ActionsRemaining
                currentWeek={currentWeek}
                actionsRemaining={actionsRemaining}
                isEditingMoves={isEditingMoves}
              />
              <CurrentAction
                currentAction={currentAction}
                marketStatus={marketStatus}
              />
              
              <PlayerActions 
                gameId={gameId}
                playerId={playerId}
                currentWeek={currentWeek}
                soldiers={soldiers}
                actionsRemaining={isEditingMoves ? 3 : actionsRemaining}
                disabled={movesSubmitted && !isEditingMoves}
                onActionSubmit={handleActionSubmit}
                onViewMarket={handleViewMarket}
                onViewBattlefield={handleViewBattlefield}
              />
              
              <Gameboard 
                gameData={gameData}
                setActiveTab={setActiveTab}
              />
              
              <IntelligenceBriefing
                weeklyIntelligence={weeklyIntelligence}
                currentWeek={currentWeek}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default CommandCenter;