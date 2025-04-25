import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PlayerActions from './PlayerActions';
import { getFirestore, addDoc, doc, getDoc, updateDoc, setDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import ResponsiveNavbar from './Navbar';

const CommandCenter = () => {
  const { gameId } = useParams(); // Get the gameId from URL parameters
  const [activeTab, setActiveTab] = useState('command');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [soldiers, setSoldiers] = useState(165);
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
            setSoldiers(data.soldiers || 165);
            
            // Load current investments if available
            if (data.investments) {
              setSoldierInvestments(data.investments);
            }
          } else {
            console.log("Player document doesn't exist yet - will be created when first action is taken");
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
      soldiers: soldiers, // Use dynamic soldier count
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

  // Handler for adding a move to the weekly moves
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
    
    // Add the move to the array
    if (isEditingMoves) {
      // If editing, replace existing moves
      const updatedMoves = [...weeklyMoves];
      
      // Find if this type of move already exists and replace it
      const existingMoveIndex = updatedMoves.findIndex(move => 
        (move.type === 'investment' && moveData.investment) ||
        (move.type === 'offensive' && moveData.offensive)
      );
      
      if (existingMoveIndex >= 0) {
        updatedMoves[existingMoveIndex] = {
          ...moveData,
          type: moveData.investment ? 'investment' : 'offensive'
        };
      } else if (updatedMoves.length < maxMoves) {
        updatedMoves.push({
          ...moveData,
          type: moveData.investment ? 'investment' : 'offensive'
        });
      } else {
        setErrorMessage(`You can only select up to ${maxMoves} moves per week`);
        return false;
      }
      
      setWeeklyMoves(updatedMoves);
    } else {
      // If not editing, add to the existing moves
      setWeeklyMoves([
        ...weeklyMoves, 
        {
          ...moveData,
          type: moveData.investment ? 'investment' : 'offensive'
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

  // Add function to render the weekly moves dashboard
  const renderWeeklyMovesDashboard = () => {
    return (
      <div className="game-card p-6 rounded-lg bg-gray-800/50 border border-gray-700 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold military-header">WEEKLY MOVES</h3>
          <div className="flex items-center">
            <span className="text-sm text-gray-400 mr-2">MOVES SELECTED</span>
            <div className="flex space-x-1">
              {Array.from({ length: maxMoves }).map((_, index) => (
                <div 
                  key={index} 
                  className={`h-3 w-3 rounded-full ${index < weeklyMoves.length ? 'bg-green-500' : 'bg-gray-600'}`}
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        {weeklyMoves.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-400">No moves selected for this week.</p>
            <p className="text-sm text-gray-500 mt-2">Use the Market or Battlefield to select your moves.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {weeklyMoves.map((move, index) => (
              <div key={index} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">MOVE {index + 1}</div>
                    <div className="font-bold">
                      {move.type === 'investment' ? 
                        `INVEST ${move.investment.amount} SOLDIERS IN ${move.investment.market.toUpperCase()}` : 
                        `${move.offensive.type.toUpperCase()} ${move.offensive.targetName.toUpperCase()}`
                      }
                    </div>
                  </div>
                  {isEditingMoves && (
                    <button 
                      onClick={() => removeWeeklyMove(index)}
                      className="text-red-500 hover:text-red-300 transition-colors"
                    >
                      <span className="sr-only">Remove</span>
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 flex space-x-4 justify-end">
          {!movesSubmitted ? (
            <button
              onClick={submitWeeklyMoves}
              disabled={weeklyMoves.length === 0}
              className={`py-3 px-6 ${weeklyMoves.length > 0 ? 'bg-green-700 hover:bg-green-600' : 'bg-gray-700 cursor-not-allowed'} rounded transition-all duration-300`}
            >
              SUBMIT MOVES FOR WEEK {currentWeek}
            </button>
          ) : (
            <button
              onClick={toggleEditMoves}
              className={`py-3 px-6 ${isEditingMoves ? 'bg-red-700 hover:bg-red-600' : 'bg-blue-700 hover:bg-blue-600'} rounded transition-all duration-300`}
            >
              {isEditingMoves ? 'CANCEL EDITING' : 'EDIT MOVES FOR WEEK ' + currentWeek}
            </button>
          )}
          
          {isEditingMoves && (
            <button
              onClick={submitWeeklyMoves}
              disabled={weeklyMoves.length === 0}
              className={`py-3 px-6 ${weeklyMoves.length > 0 ? 'bg-green-700 hover:bg-green-600' : 'bg-gray-700 cursor-not-allowed'} rounded transition-all duration-300`}
            >
              SAVE CHANGES
            </button>
          )}
        </div>
      </div>
    );
  };

  // Validation function for actions
  const validateAction = (actionData) => {
    if (!actionData) {
      return { valid: false, message: "No action selected" };
    }
    
    // Ensure proper structure to prevent undefined fields later
    if (!actionData.investment && !actionData.offensive) {
      return { valid: false, message: "Action must contain either an investment or offensive operation" };
    }
    
    // Validate investment actions
    if (actionData.investment) {
      const { type, amount, market } = actionData.investment;
      
      if (!amount || amount <= 0) {
        return { valid: false, message: "Investment amount must be positive" };
      }
      
      if (amount > soldiers) {
        return { valid: false, message: `Cannot invest ${amount} soldiers when you only have ${soldiers}` };
      }
      
      if (!market) {
        return { valid: false, message: "No market selected for investment" };
      }
      
      // Clean up structure to ensure no undefined fields
      const cleanInvestment = {
        type: type || 'invest',
        amount: amount,
        market: market
      };
      
      // Return the cleaned action data
      return { 
        valid: true, 
        cleanedData: {
          ...actionData,
          investment: cleanInvestment,
          // Remove any potential undefined offensive field
          offensive: null
        }
      };
    }
    
    // Validate offensive actions
    if (actionData.offensive) {
      const { type, targetPlayer, targetName } = actionData.offensive;
      
      if (!type) {
        return { valid: false, message: "No offensive action type specified" };
      }
      
      if (!targetPlayer) {
        return { valid: false, message: "No target selected for offensive action" };
      }
      
      if (!targetName) {
        return { valid: false, message: "Target name is missing" };
      }
      
      // Additional validation for attack actions
      if (type === 'attack') {
        // Check if player has enough soldiers for an attack
        if (soldiers < 25) {
          return { valid: false, message: "Need at least 25 soldiers to launch an attack" };
        }
      }
      
      // Additional validation for spy actions
      if (type === 'spy') {
        // Check if player has enough soldiers for a spy mission
        if (soldiers < 10) {
          return { valid: false, message: "Need at least 10 soldiers to deploy a spy" };
        }
      }
      
      // Clean up structure to ensure no undefined fields
      const cleanOffensive = {
        type: type,
        targetPlayer: targetPlayer,
        targetName: targetName || 'Unknown Commander'
      };
      
      // Return the cleaned action data
      return { 
        valid: true, 
        cleanedData: {
          ...actionData,
          offensive: cleanOffensive,
          // Remove any potential undefined investment field
          investment: null
        }
      };
    }
    
    // Should never reach here due to structure checks above, but just in case
    return { valid: false, message: "Invalid action structure" };
  };

  const calculateSuccessChance = (attacker, defender) => {
    const defenseRating = {
      'Weak': 0.25,
      'Moderate': 0.5,
      'Strong': 0.75,
      'Very Strong': 0.9
    };
    
    const attackerStrength = attacker.soldiers;
    const defenderDefense = defenseRating[defender.defense];
    return Math.min(Math.round((attackerStrength / (defender.soldiers * defenderDefense)) * 100), 90);
  };

  const renderPlayerCard = (player) => (
    <div key={player.id} className={`player-card p-4 rounded-lg ${player.isYou ? 'selected-player' : ''}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <img src="/images/avatar.png" alt={`${player.name} Avatar`} className="h-10 w-10 rounded-full mr-3" />
          <div>
            {player.alliance ? (
              <div className="flex items-center">
                <span className={`alliance-indicator ${player.alliance}`}></span>
                <h5 className="font-bold">{player.name}</h5>
              </div>
            ) : (
              <h5 className="font-bold">{player.name}</h5>
            )}
            <p className="text-sm text-gray-400">{player.title}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold text-white">{player.soldiers}</span>
          <p className="text-xs text-gray-400">SOLDIERS</p>
        </div>
      </div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">Defense:</span>
        <span className="text-white">{player.defense}</span>
      </div>
      <div className="w-full bg-gray-700 h-2 rounded-full mb-3">
        <div className={`h-2 ${player.defenseLevel >= 75 ? 'bg-green-600' : player.defenseLevel >= 50 ? 'bg-yellow-600' : 'bg-red-600'} rounded-full`} 
             style={{ width: `${player.defenseLevel}%` }}></div>
      </div>
      {player.investmentsHidden ? (
        <div className="text-xs text-center text-gray-500">
          <span>Investment details hidden by defense wall</span>
        </div>
      ) : (
        <div className="flex justify-between text-xs">
          {Object.entries(player.investments).map(([key, value]) => (
            <span key={key} className="text-gray-500">{key.charAt(0).toUpperCase() + key.slice(1)}: {value}%</span>
          ))}
        </div>
      )}
    </div>
  );

  const renderBattlefieldTile = (tile, index) => (
    <div key={index} className={`battlefield-tile ${tile.type === 'empty' ? 'hexagon-gray' : tile.type === 'market' ? `hexagon-${tile.color}` : ''}`}>
      <div className="battlefield-tile-content">
        {tile.type === 'empty' ? (
          <span className="text-xs text-gray-500">Empty</span>
        ) : tile.type === 'player' ? (
          <div className="text-center">
            <img src="/images/avatar.png" alt="Player Icon" className="h-20 w-20 mx-auto" />
            <span className="text-xs">{players.find(p => p.id === tile.player)?.name}</span>
            <div className="text-xs">{tile.soldiers} </div>
          </div>
        ) : tile.type === 'market' ? (
          <div className="text-center">
            <span className="text-xs">{tile.name}</span>
            <div className="text-xs">{tile.change}</div>
          </div>
        ) : (
          <div className="text-center">
            <span className="text-xs">{tile.name}</span>
            <div className="text-xs">{tile.desc}</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderBattlefield = () => {
    return (
      <div className="space-y-6">
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
        
        {/* Economic Status Alert */}
        <div className="economy-downturn px-6 py-4 rounded-lg mb-6">
          <h3 className="text-xl font-bold mb-1">ECONOMIC DOWNTURN</h3>
          <p className="text-gray-400">
            Markets are unstable. Proceed with caution. Stocks {marketStatus.stocks}%, 
            Real Estate {marketStatus.realEstate}%, Crypto {marketStatus.crypto}%, 
            Business {marketStatus.business}%
          </p>
        </div>
        
        {/* Battlefield Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold military-header">BATTLEFIELD MAP</h3>
            <p className="text-gray-400">Strategic view of all commanders and their positions</p>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-400 mr-2">ACTIONS REMAINING</span>
            <div className="flex space-x-1">
              {Array.from({ length: 3 }).map((_, index) => (
                <div 
                  key={index} 
                  className={`h-3 w-3 rounded-full ${index < (isEditingMoves ? 3 : actionsRemaining) ? 'bg-green-500' : 'bg-gray-600'}`}
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Battlefield Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Players List */}
          <div className="space-y-4">
            <h4 className="font-bold text-lg mb-3 border-b border-gray-700 pb-2">COMMANDERS</h4>
            {players.map(player => renderPlayerCard(player))}
          </div>
          
          {/* Center: Battlefield Grid */}
          <div className="col-span-2">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="battlefield-grid">
                {battlefieldTiles.map((tile, index) => renderBattlefieldTile(tile, index))}
              </div>
              
              {/* Legend */}
              <div className="mt-6 flex flex-wrap justify-center space-x-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-700 mr-2"></div>
                  <span className="text-xs text-gray-400">Your Territory</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-700 mr-2"></div>
                  <span className="text-xs text-gray-400">Enemy</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-700 mr-2"></div>
                  <span className="text-xs text-gray-400">Market</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-600 mr-2"></div>
                  <span className="text-xs text-gray-400">Special Event</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Battlefield Actions */}
        <div className="game-card p-6 rounded-lg bg-gray-800/50 border border-gray-700">
          <h3 className="text-xl font-bold military-header mb-4">BATTLEFIELD ACTIONS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {players.filter(p => p.id !== 'you').map(player => (
              <div key={player.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold">{player.name.toUpperCase()}</h4>
                    <div className="text-sm text-gray-400">
                      <span className="mr-2">SOLDIERS: {player.soldiers || 0}</span>
                      <span>TERRITORY: {player.territory || 'Unknown'}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <img src="/images/avatar.png" alt="Player Avatar" className="h-12 w-12 rounded-full" />
                    {player.status === 'online' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => handleBattlefieldAction('attack', player.id)}
                    className={`w-full py-2 px-4 ${
                      (isEditingMoves || actionsRemaining > 0) && weeklyMoves.length < maxMoves 
                        ? 'bg-red-900/50 hover:bg-red-800/50' 
                        : 'bg-gray-800 cursor-not-allowed'
                    } rounded border border-red-700 transition-all duration-300 ${
                      (isEditingMoves || actionsRemaining > 0) && weeklyMoves.length < maxMoves 
                        ? 'hover:scale-105' 
                        : ''
                    }`}
                    disabled={
                      (actionsRemaining <= 0 && !isEditingMoves) || 
                      (weeklyMoves.length >= maxMoves && !isEditingMoves) || 
                      (movesSubmitted && !isEditingMoves)
                    }
                  >
                    LAUNCH ATTACK {
                      movesSubmitted && !isEditingMoves 
                        ? '(MOVES SUBMITTED)' 
                        : weeklyMoves.length >= maxMoves && !isEditingMoves 
                          ? '(MAX MOVES SELECTED)' 
                          : actionsRemaining <= 0 && !isEditingMoves 
                            ? '(NO ACTIONS LEFT)' 
                            : ''
                    }
                  </button>
                  <button
                    onClick={() => handleBattlefieldAction('spy', player.id)}
                    className={`w-full py-2 px-4 ${
                      (isEditingMoves || actionsRemaining > 0) && weeklyMoves.length < maxMoves 
                        ? 'bg-gray-700/50 hover:bg-gray-600/50' 
                        : 'bg-gray-800 cursor-not-allowed'
                    } rounded border border-gray-600 transition-all duration-300 ${
                      (isEditingMoves || actionsRemaining > 0) && weeklyMoves.length < maxMoves 
                        ? 'hover:scale-105' 
                        : ''
                    }`}
                    disabled={
                      (actionsRemaining <= 0 && !isEditingMoves) || 
                      (weeklyMoves.length >= maxMoves && !isEditingMoves) || 
                      (movesSubmitted && !isEditingMoves)
                    }
                  >
                    DEPLOY SPY {
                      movesSubmitted && !isEditingMoves 
                        ? '(MOVES SUBMITTED)' 
                        : weeklyMoves.length >= maxMoves && !isEditingMoves 
                          ? '(MAX MOVES SELECTED)' 
                          : actionsRemaining <= 0 && !isEditingMoves 
                            ? '(NO ACTIONS LEFT)' 
                            : ''
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Return to Command Center */}
        <button
          onClick={() => setActiveTab('command')}
          className="w-full py-3 bg-gray-700/50 hover:bg-gray-600/50 rounded px-4 transition-all duration-300"
        >
          RETURN TO COMMAND CENTER
        </button>
      </div>
    );
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
      setCurrentAction(cleanedActionData);
      // Return to command center to show the selection
      setActiveTab('command');
    }
  };

  const tabClass = (tabName) => 
    `px-6 py-3 ${activeTab === tabName ? 'tab-active' : 'tab-inactive'} transition-colors duration-200`;

  const marketStatus = {
    stocks: -15,
    realEstate: -5,
    crypto: -20,
    business: -10
  };

  const calculatePotentialReturn = (market, investment) => {
    const rates = {
      stocks: (100 + marketStatus.stocks) / 100,
      realEstate: (100 + marketStatus.realEstate) / 100,
      crypto: (100 + marketStatus.crypto) / 100,
      business: (100 + marketStatus.business) / 100
    };
    return Math.round(investment * rates[market]);
  };

  const handleInvestmentChange = (market, value) => {
    setSoldierInvestments(prev => ({
      ...prev,
      [market]: value
    }));
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
      setCurrentAction(cleanedActionData);
      // Switch back to command tab after investment
      setActiveTab('command');
    }
  };

  const handleActionSubmit = async (actionData) => {
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
    
    setCurrentAction(cleanedActionData);
  };

  const handleViewMarket = () => {
    setActiveTab('market');
  };

  const handleViewBattlefield = () => {
    setActiveTab('battlefield');
  };

  const renderMarketDashboard = () => {
    const markets = [
      { 
        id: 'stocks', 
        name: 'STOCK MARKET', 
        status: marketStatus.stocks, 
        buttonClass: 'button-finance',
        description: 'High risk/reward with high economic sensitivity',
        riskLevel: 'High',
        riskColor: 'red',
        riskPercentage: 75
      },
      { 
        id: 'realEstate', 
        name: 'REAL ESTATE', 
        status: marketStatus.realEstate, 
        buttonClass: 'button-military',
        description: 'Medium risk/reward with moderate economic sensitivity',
        riskLevel: 'Medium',
        riskColor: 'yellow',
        riskPercentage: 50
      },
      { 
        id: 'crypto', 
        name: 'CRYPTOCURRENCY', 
        status: marketStatus.crypto, 
        buttonClass: 'button-gold',
        description: 'Very high risk/reward with extreme economic sensitivity',
        riskLevel: 'Very High',
        riskColor: 'red',
        riskPercentage: 90
      },
      { 
        id: 'business', 
        name: 'BUSINESS', 
        status: marketStatus.business, 
        buttonClass: 'button-attack',
        description: 'Low risk/reward with low economic sensitivity',
        riskLevel: 'Low',
        riskColor: 'green',
        riskPercentage: 25
      }
    ];

    return (
      <div className="space-y-6">
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
        
        {/* Economic Status Alert */}
        <div className="economy-downturn px-6 py-4 rounded-lg">
          <h3 className="text-xl font-bold military-header mb-1">ECONOMIC STATUS REPORT</h3>
          <p className="text-gray-400">
            Market Intelligence: Stocks {marketStatus.stocks}%, 
            Real Estate {marketStatus.realEstate}%, Crypto {marketStatus.crypto}%, 
            Business {marketStatus.business}%
          </p>
        </div>
        
        {/* Actions Remaining Indicator */}
        <div className="flex justify-end mb-3">
          <div className="flex items-center">
            <span className="text-sm text-gray-400 mr-2">ACTIONS REMAINING</span>
            <div className="flex space-x-1">
              {Array.from({ length: 3 }).map((_, index) => (
                <div 
                  key={index} 
                  className={`h-3 w-3 rounded-full ${index < (isEditingMoves ? 3 : actionsRemaining) ? 'bg-green-500' : 'bg-gray-600'}`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {markets.map(market => (
            <div key={market.id} className="game-card p-6 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold military-header">{market.name}</h3>
                <div className="px-3 py-1 rounded bg-gray-700/50 text-sm">
                  <span className={market.status >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {market.status}%
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-gray-400 text-sm">
                  {market.description}
                </div>

                {/* Risk Level Indicator */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">RISK ASSESSMENT</span>
                    <span className="text-sm text-gray-400">{market.riskLevel}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div 
                      className={`h-2 bg-${market.riskColor}-500 rounded-full transition-all duration-300`} 
                      style={{ width: `${market.riskPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Current Investment */}
                <div className="soldier-counter px-4 py-2 rounded-lg bg-gray-700/30 border border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">CURRENT DEPLOYMENT</span>
                    <span className="font-bold">{soldierInvestments[market.id] || 0} SOLDIERS</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-400">POTENTIAL RETURN</span>
                    <span className={market.status >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {calculatePotentialReturn(market.id, soldierInvestments[market.id] || 0)} SOLDIERS
                    </span>
                  </div>
                </div>

                {/* Investment Controls */}
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="10"
                    max={soldiers}
                    defaultValue={10}
                    className="bg-gray-800 p-2 rounded w-24 border border-gray-600 text-center font-bold"
                    id={`invest-${market.id}`}
                    disabled={
                      (actionsRemaining <= 0 && !isEditingMoves) || 
                      (weeklyMoves.length >= maxMoves && !isEditingMoves) || 
                      (movesSubmitted && !isEditingMoves)
                    }
                  />
                  <button
                    onClick={() => {
                      const amount = parseInt(document.getElementById(`invest-${market.id}`).value) || 0;
                      if (amount >= 10 && amount <= soldiers && 
                          ((actionsRemaining > 0 && !movesSubmitted) || isEditingMoves) && 
                          (weeklyMoves.length < maxMoves || isEditingMoves)) {
                        handleMarketInvestment(market.id, amount);
                      } else if (amount > soldiers) {
                        setErrorMessage(`Cannot invest ${amount} soldiers when you only have ${soldiers}`);
                      } else if (amount < 10) {
                        setErrorMessage(`Minimum investment is 10 soldiers`);
                      }
                    }}
                    className={`flex-1 py-3 ${
                      (isEditingMoves || (actionsRemaining > 0 && !movesSubmitted && weeklyMoves.length < maxMoves)) 
                        ? market.buttonClass 
                        : 'bg-gray-800 cursor-not-allowed'
                    } rounded px-4 transition-all duration-300 ${
                      (isEditingMoves || (actionsRemaining > 0 && !movesSubmitted && weeklyMoves.length < maxMoves)) 
                        ? 'hover:scale-105' 
                        : ''
                    }`}
                    disabled={
                      (actionsRemaining <= 0 && !isEditingMoves) || 
                      (weeklyMoves.length >= maxMoves && !isEditingMoves) || 
                      (movesSubmitted && !isEditingMoves)
                    }
                  >
                    DEPLOY {document.getElementById(`invest-${market.id}`)?.value || 10} SOLDIERS 
                    {movesSubmitted && !isEditingMoves 
                      ? ' (MOVES SUBMITTED)' 
                      : weeklyMoves.length >= maxMoves && !isEditingMoves 
                        ? ' (MAX MOVES SELECTED)' 
                        : actionsRemaining <= 0 && !isEditingMoves 
                          ? ' (NO ACTIONS LEFT)' 
                          : ''}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setActiveTab('command')}
          className="w-full py-3 bg-gray-700/50 hover:bg-gray-600/50 rounded px-4 transition-all duration-300"
        >
          RETURN TO COMMAND CENTER
        </button>
      </div>
    );
  };

  const renderCurrentAction = () => {
    if (!currentAction) return null;

    return (
      <>
        {/* Investment Display */}
        {currentAction.investment && (
          <div className="game-card p-6 rounded-lg bg-gray-800/50 border border-gray-700 mb-6">
            <h3 className="text-xl font-bold military-header mb-4">STRATEGIC DEPLOYMENT</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-1">MARKET</div>
                <div className="font-bold">{currentAction.investment.market.toUpperCase()}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">DEPLOYMENT SIZE</div>
                <div className="font-bold">{currentAction.investment.amount} SOLDIERS</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">POTENTIAL RETURN</div>
                <div className={marketStatus[currentAction.investment.market] >= 0 ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                  {calculatePotentialReturn(currentAction.investment.market, currentAction.investment.amount)} SOLDIERS
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Offensive Action Display */}
        {currentAction.offensive && (
          <div className="game-card p-6 rounded-lg bg-gray-800/50 border border-gray-700 mb-6">
            <h3 className="text-xl font-bold military-header mb-4">STRATEGIC DEPLOYMENT</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-1">OPERATION TYPE</div>
                <div className={`font-bold ${currentAction.offensive.type === 'attack' ? 'text-red-500' : 'text-gray-300'}`}>
                  {currentAction.offensive.type === 'attack' ? 'DIRECT ASSAULT' : 'DEPLOY SPY'}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">TARGET COMMANDER</div>
                <div className="font-bold flex items-center">
                  <img src="/images/avatar.png" alt="Target Avatar" className="h-6 w-6 rounded-full mr-2" />
                  {currentAction.offensive.targetName.toUpperCase()}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">OPERATION COST</div>
                <div className="font-bold">
                  {currentAction.offensive.type === 'attack' ? '25' : '10'} SOLDIERS
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
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

  const renderIntelligence = () => {
    const renderLeaderboard = () => (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Leaderboard Rankings */}
        <div className="col-span-2">
          <div className="mb-6">
            <h4 className="font-bold text-lg mb-3 border-b border-gray-700 pb-2">SEASON 1 LEADERBOARD</h4>
            
            {/* Player Rankings */}
            <div className="space-y-3">
              {players.map((player, index) => (
                <div key={player.id} className={`player-card p-4 rounded-lg ${
                  index === 0 ? 'rank-1' :
                  index === 1 ? 'rank-2' :
                  index === 2 ? 'rank-3' :
                  player.id === 'you' ? 'rank-you' : ''
                }`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="text-center mr-4 w-8">
                        <span className={`text-xl font-bold ${
                          index === 0 ? 'medal-gold' :
                          index === 1 ? 'medal-silver' :
                          index === 2 ? 'medal-bronze' : ''
                        }`}>{index + 1}</span>
                      </div>
                      <img src="/images/avatar.png" alt="Player Avatar" className="h-10 w-10 rounded-full mr-3" />
                      <div>
                        <div className="flex items-center">
                          <h5 className="font-bold">{player.id === 'you' ? 'YOU' : player.name}</h5>
                        </div>
                        <p className="text-sm text-gray-400">Commander {player.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-white">{player.soldiers}</span>
                      <p className="text-xs text-gray-400">SOLDIERS</p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>{player.investmentSummary || 'No Investments'}</span>
                    <span>Wins: {player.wins || 0}</span>
                    <span>{player.attackSummary || `Losses: ${player.losses || 0}`}</span>
                    <span>K/D Ratio: {player.kdRatio || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Weekly Highlights */}
        <div>
          <h4 className="font-bold text-lg mb-3 border-b border-gray-700 pb-2">WEEK {currentWeek} HIGHLIGHTS</h4>
          <div className="space-y-4">
            {Object.entries(weeklyHighlights).map(([key, highlight]) => (
              <div key={key} className="game-card p-4 rounded-lg">
                <h5 className="font-bold mb-2 text-center">
                {key.split(/(?=[A-Z])/).join(' ').toUpperCase()}
                </h5>
                <div className="flex flex-col items-center">
                  <img src="/images/avatar.png" alt="Player Avatar" className="h-16 w-16 rounded-full mb-2" />
                  <p className="font-bold">{highlight.name}</p>
                  <p className="text-sm text-gray-400">{highlight.achievement}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    const renderPerformance = () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="mb-6">
          <h4 className="font-bold text-lg mb-3 border-b border-gray-700 pb-2">YOUR PERFORMANCE</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="stat-card stat-up p-3 rounded-lg text-center">
              <p className="text-sm text-gray-400">SOLDIER GROWTH</p>
              <p className="text-2xl font-bold">+{playerStatsData.soldierGrowth}%</p>
              <p className="text-xs text-gray-500">WEEK-OVER-WEEK</p>
            </div>
            
            <div className={`stat-card ${playerStatsData.attackSuccess >= 50 ? 'stat-up' : 'stat-down'} p-3 rounded-lg text-center`}>
              <p className="text-sm text-gray-400">ATTACK SUCCESS</p>
              <p className="text-2xl font-bold">{playerStatsData.attackSuccess}%</p>
              <p className="text-xs text-gray-500">{playerStatsData.successfulAttacks} OF {playerStatsData.totalAttacks} ATTACKS</p>
            </div>
            
            <div className={`stat-card ${playerStatsData.defenseRate >= 50 ? 'stat-up' : 'stat-down'} p-3 rounded-lg text-center`}>
              <p className="text-sm text-gray-400">DEFENSE RATE</p>
              <p className="text-2xl font-bold">{playerStatsData.defenseRate}%</p>
              <p className="text-xs text-gray-500">{playerStatsData.successfulDefenses} OF {playerStatsData.totalDefenses} DEFENSES</p>
            </div>
            
            <div className={`stat-card ${playerStatsData.investmentROI >= 0 ? 'stat-up' : 'stat-down'} p-3 rounded-lg text-center`}>
              <p className="text-sm text-gray-400">INVESTMENT ROI</p>
              <p className="text-2xl font-bold">{playerStatsData.investmentROI}%</p>
              <p className="text-xs text-gray-500">AVERAGE RETURN</p>
            </div>
          </div>
        </div>

        <div className="game-card p-4 rounded-lg">
          <h5 className="font-bold mb-3 text-center">SOLDIER COUNT HISTORY</h5>
          <div className="h-40 bg-gray-800 rounded-lg p-3">
            {/* Add chart component here */}
          </div>
        </div>
      </div>
    );

    const renderAchievements = () => (
      <div className="mx-auto">
        <h4 className="font-bold text-lg mb-3 border-b border-gray-700 pb-2">ACHIEVEMENTS</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map(achievement => (
            <div key={achievement.id} className={`game-card ${!achievement.unlocked && 'achievement-locked'} p-3 rounded-lg flex items-center`}>
              <div className={`${achievement.unlocked ? 'bg-green-800' : 'bg-gray-700'} h-10 w-10 rounded-full flex items-center justify-center mr-3`}>
                <span className="text-lg">{achievement.unlocked ? '✓' : '?'}</span>
              </div>
              <div>
                <h5 className="font-bold text-sm">{achievement.name}</h5>
                <p className="text-xs text-gray-400">{achievement.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    const renderMarketIntel = () => (
      <div>
        <div className="economy-downturn px-6 py-4 rounded-lg mb-6">
          <h3 className="text-xl font-bold mb-1">ECONOMIC DOWNTURN</h3>
          <p className="text-gray-400">
            Markets are unstable. Proceed with caution. Stocks {marketStatus.stocks}%, 
            Real Estate {marketStatus.realEstate}%, Crypto {marketStatus.crypto}%, 
            Business {marketStatus.business}%
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(marketStatus).map(([market, change]) => (
            <div key={market} className={`game-card p-4 rounded-lg ${change >= 0 ? 'stat-up' : 'stat-down'}`}>
              <h5 className="font-bold mb-2">{market.toUpperCase()}</h5>
              <p className={`text-2xl font-bold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {change > 0 ? '+' : ''}{change}%
              </p>
              <p className="text-sm text-gray-400">Weekly Change</p>
            </div>
          ))}
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
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

        <div className="mb-6">
          <h3 className="text-2xl font-bold military-header">INTELLIGENCE CENTER</h3>
          <p className="text-gray-400">Track battalion rankings, performance metrics, and strategic opportunities</p>
        </div>

        <div className="border-b border-gray-700 mb-6">
          <div className="flex space-x-1">
            {['leaderboard', 'performance', 'achievements', 'market'].map((tab) => (
              <button
                key={tab}
                onClick={() => setIntelligenceTab(tab)}
                className={`px-4 py-2 rounded-t-md ${
                  intelligenceTab === tab ? 'tab-active' : 'tab-inactive'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {intelligenceTab === 'leaderboard' && renderLeaderboard()}
        {intelligenceTab === 'performance' && renderPerformance()}
        {intelligenceTab === 'achievements' && renderAchievements()}
        {intelligenceTab === 'market' && renderMarketIntel()}
      </div>
    );
  };

  // Format timestamp for intelligence briefing
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffMinutes / 1440)} days ago`;
    }
  };

  // Render Intelligence Briefing
  const renderIntelligenceBriefing = () => {
    // If no intelligence data, show placeholder
    if (weeklyIntelligence.length === 0) {
      return (
        <div>
          <h3 className="text-xl font-bold mb-4">INTELLIGENCE BRIEFING</h3>
          <div className="notification p-4 rounded-lg">
            <p className="text-gray-400">No intelligence reports available for Week {currentWeek}.</p>
          </div>
        </div>
      );
    }
    
    return (
      <div>
        <h3 className="text-xl font-bold mb-4">INTELLIGENCE BRIEFING</h3>
        <div className="space-y-4">
          {weeklyIntelligence.map(intel => (
            <div key={intel.id} className={`notification ${intel.type === 'attack' ? 'notification-danger' : intel.type === 'market' ? 'notification-warning' : 'notification-info'} p-4 rounded-lg`}>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold">{intel.title || intel.type.toUpperCase()}</h4>
                <span className="text-sm text-gray-500">{formatTimestamp(intel.timestamp)}</span>
              </div>
              <p className="text-gray-400">{intel.message}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Show loading state if we're waiting for game data
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
            renderMarketDashboard()
          ) : activeTab === 'battlefield' ? (
            renderBattlefield()
          ) : activeTab === 'intelligence' ? (
            renderIntelligence()
          ) : (
            <>
              {/* Command Center Content */}
              {/* Economic Status Alert */}
              <div className="economy-downturn px-6 py-4 rounded-lg mb-6">
                <h3 className="text-xl font-bold mb-1">ECONOMIC DOWNTURN</h3>
                <p className="text-gray-400">
                  Markets are unstable. Proceed with caution. Stocks {marketStatus.stocks}%, 
                  Real Estate {marketStatus.realEstate}%, Crypto {marketStatus.crypto}%, 
                  Business {marketStatus.business}%
                </p>
              </div>
              
              {/* Weekly Moves Dashboard - NEW COMPONENT */}
              {renderWeeklyMovesDashboard()}
              
              {/* Actions Remaining Indicator */}
              <div className="flex justify-end mb-4">
                <div className="flex items-center">
                  <span className="text-sm text-gray-400 mr-2">WEEK {currentWeek} ACTIONS REMAINING</span>
                  <div className="flex space-x-1">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div 
                        key={index} 
                        className={`h-3 w-3 rounded-full ${index < (isEditingMoves ? 3 : actionsRemaining) ? 'bg-green-500' : 'bg-gray-600'}`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              
              {renderCurrentAction()}
              
              <PlayerActions 
                gameId={gameId || "current-game"}
                playerId={playerId}
                currentWeek={currentWeek}
                soldiers={soldiers}
                actionsRemaining={isEditingMoves ? 3 : actionsRemaining}
                disabled={movesSubmitted && !isEditingMoves}
                onActionSubmit={handleActionSubmit}
                onViewMarket={handleViewMarket}
                onViewBattlefield={handleViewBattlefield}
              />
              
              {/* Game Board Visual */}
              <div 
                id="gameBoard" 
                className="rounded-lg overflow-hidden mb-8 relative h-80 bg-cover bg-center group"
                style={{
                  backgroundImage: 'url("/images/battlefield_preview.jpg")',
                  backgroundBlendMode: 'overlay',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center h-full">
                  <div className="absolute top-4 left-4">
                    <h3 className="text-2xl font-bold military-header mb-2">ACTIVE BATTLEFIELD</h3>
                    <p className="text-gray-300">{gameData?.players?.length || 12} Commanders in Battle</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('battlefield')}
                    className="px-8 py-4 bg-gray-900/80 text-white rounded-lg border-2 border-white hover:bg-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gold/20 group"
                  >
                    <span className="text-lg font-bold military-header">VIEW FULL BATTLEFIELD</span>
                    <div className="mt-1 text-sm text-gray-400 group-hover:text-gold transition-colors">Real-time battle updates available</div>
                  </button>
                  {gameData?.endTime && (
                    <div className="absolute bottom-4 right-4 flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Battle Ends In</div>
                        <div className="text-xl font-bold text-gold">04:23:15</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Notifications & Updates */}
              {renderIntelligenceBriefing()}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default CommandCenter;