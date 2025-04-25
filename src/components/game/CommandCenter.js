import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PlayerActions from './PlayerActions';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import ResponsiveNavbar from './Navbar';

const CommandCenter = () => {
  const { gameId } = useParams(); // Get the gameId from URL parameters
  const [activeTab, setActiveTab] = useState('command');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [soldiers, setSoldiers] = useState(165);
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
  const [loading, setLoading] = useState(true);
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
          } else {
            console.error('Game not found');
            // Handle game not found error
          }
        } catch (error) {
          console.error('Error loading game data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadGameData();
  }, [gameId, db]);
  
  // Default players data
  const players = [
    {
      id: 'you',
      name: 'YOU',
      title: 'Commander Alpha',
      soldiers: 100,
      weeklySoldierIncome: 50,
      actionsPerWeek: 3,
      actionsRemaining: 3,
      defense: 'Strong',
      defenseLevel: 75,
      investments: { stocks: 25, realEstate: 40, cash: 35 },
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
                    className="w-full py-2 px-4 bg-red-900/50 hover:bg-red-800/50 rounded border border-red-700 transition-all duration-300 hover:scale-105"
                  >
                    LAUNCH ATTACK
                  </button>
                  <button
                    onClick={() => handleBattlefieldAction('spy', player.id)}
                    className="w-full py-2 px-4 bg-gray-700/50 hover:bg-gray-600/50 rounded border border-gray-600 transition-all duration-300 hover:scale-105"
                  >
                    DEPLOY SPY
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
    const targetPlayer = players.find(p => p.id === targetPlayerId);
    const actionData = {
      investment: currentAction?.investment, // Keep existing investment data
      offensive: {
        type: actionType,
        targetPlayer: targetPlayerId,
        targetName: targetPlayer?.name || 'Unknown Commander'
      }
    };
    setCurrentAction(actionData);
    setActiveTab('command'); // Return to command center to show the selection
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
    setCurrentAction({
      investment: {
        type: 'invest',
        amount: amount,
        market: market
      }
    });
    setActiveTab('command'); // Switch back to command tab after investment
  };

  const handleActionSubmit = (actionData) => {
    // Only update if we have valid action data
    if (actionData === null) {
      setCurrentAction(null);
      return;
    }
    
    // Validate soldier amount for investments
    if (actionData.investment?.amount > soldiers) {
      return; // Don't update if amount exceeds available soldiers
    }
    
    setCurrentAction(actionData);
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
        {/* Economic Status Alert */}
        <div className="economy-downturn px-6 py-4 rounded-lg">
          <h3 className="text-xl font-bold military-header mb-1">ECONOMIC STATUS REPORT</h3>
          <p className="text-gray-400">
            Market Intelligence: Stocks {marketStatus.stocks}%, 
            Real Estate {marketStatus.realEstate}%, Crypto {marketStatus.crypto}%, 
            Business {marketStatus.business}%
          </p>
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
                    <span className="font-bold">{soldierInvestments[market.id]} SOLDIERS</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-400">POTENTIAL RETURN</span>
                    <span className={market.status >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {calculatePotentialReturn(market.id, soldierInvestments[market.id])} SOLDIERS
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
                  />
                  <button
                    onClick={() => {
                      const amount = parseInt(document.getElementById(`invest-${market.id}`).value) || 0;
                      if (amount >= 10 && amount <= soldiers) {
                        handleMarketInvestment(market.id, amount);
                      }
                    }}
                    className={`flex-1 py-3 ${market.buttonClass} rounded px-4 transition-all duration-300 hover:scale-105`}
                  >
                    DEPLOY {document.getElementById(`invest-${market.id}`)?.value || 10} SOLDIERS
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
                <div className="text-gray-400 text-sm mb-1">CURRENT DEPLOYMENT</div>
                <div className="font-bold">
                  {currentAction.investment.market ? currentAction.investment.market.toUpperCase() : 'NO MARKET SELECTED'}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">DEPLOYED FORCES</div>
                <div className="font-bold">{currentAction.investment.amount} SOLDIERS</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">REMAINING FORCES</div>
                <div className="font-bold">{soldiers - currentAction.investment.amount} SOLDIERS</div>
              </div>
            </div>
          </div>
        )}

        {/* Offensive Operations Display */}
        {currentAction.offensive && (
          <div className="game-card p-6 rounded-lg bg-gray-800/50 border border-gray-700 mb-6">
            <h3 className="text-xl font-bold military-header mb-4">OFFENSIVE OPERATIONS</h3>
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
    successfulDefenses: 3,
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
            <h2 className="text-2xl font-bold text-[#D4AF37]">{gameData.name}</h2>
            <div className="flex flex-wrap items-center text-sm text-gray-400 mt-1">
              <span className="mr-4">Battle ID: {gameId}</span>
              {gameData.startDate && <span className="mr-4">Begins: {new Date(gameData.startDate).toLocaleString()}</span>}
              {gameData.endDate && <span className="mr-4">Ends: {new Date(gameData.endDate).toLocaleString()}</span>}
              {gameData.players && <span className="mr-4">Commanders: {gameData.players.length}</span>}
              {gameData.difficulty && <span>Difficulty: {gameData.difficulty}</span>}
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
          {activeTab === 'market' ? (
            renderMarketDashboard()
          ) : activeTab === 'battlefield' ? (
            renderBattlefield()
          ) : activeTab === 'intelligence' ? (
            renderIntelligence()
          ) : (
            <>
              {/* Original Command Center Content */}
              {/* Economic Status Alert */}
              <div className="economy-downturn px-6 py-4 rounded-lg mb-6">
                <h3 className="text-xl font-bold mb-1">ECONOMIC DOWNTURN</h3>
                <p className="text-gray-400">
                  Markets are unstable. Proceed with caution. Stocks {marketStatus.stocks}%, 
                  Real Estate {marketStatus.realEstate}%, Crypto {marketStatus.crypto}%, 
                  Business {marketStatus.business}%
                </p>
              </div>
              
              {renderCurrentAction()}
              
              <PlayerActions 
                gameId={gameId || "current-game"}
                playerId={playerId}
                currentWeek={currentWeek}
                soldiers={soldiers}
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
                    <p className="text-gray-300">12 Commanders in Battle</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('battlefield')}
                    className="px-8 py-4 bg-gray-900/80 text-white rounded-lg border-2 border-white hover:bg-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gold/20 group"
                  >
                    <span className="text-lg font-bold military-header">VIEW FULL BATTLEFIELD</span>
                    <div className="mt-1 text-sm text-gray-400 group-hover:text-gold transition-colors">Real-time battle updates available</div>
                  </button>
                  <div className="absolute bottom-4 right-4 flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Battle Ends In</div>
                      <div className="text-xl font-bold text-gold">04:23:15</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Notifications & Updates */}
              <div>
                <h3 className="text-xl font-bold mb-4">INTELLIGENCE BRIEFING</h3>
                <div className="space-y-4">
                  <div className="notification p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold">ATTACK ALERT</h4>
                      <span className="text-sm text-gray-500">2 hours ago</span>
                    </div>
                    <p className="text-gray-400">Commander Eric has launched an attack against your forces. You lost 15 soldiers.</p>
                  </div>
                  
                  <div className="notification p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold">MARKET UPDATE</h4>
                      <span className="text-sm text-gray-500">5 hours ago</span>
                    </div>
                    <p className="text-gray-400">Economic downturn has affected all markets. Your stock investments have lost value.</p>
                  </div>
                  
                  <div className="notification p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold">SPECIAL EVENT</h4>
                      <span className="text-sm text-gray-500">1 day ago</span>
                    </div>
                    <p className="text-gray-400">Commander's Code Challenge is active! Post your leadership code on LinkedIn for bonus soldiers.</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default CommandCenter;