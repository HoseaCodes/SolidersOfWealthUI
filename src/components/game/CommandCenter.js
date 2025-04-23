import React, { useState, useEffect } from 'react';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import PlayerActions from './PlayerActions';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

const CommandCenter = () => {
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
  const { currentUser } = useAuth();
  const db = getFirestore();

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

  const renderBattlefield = () => (
    <div className="p-6">
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
        
        <div className="flex space-x-3">
          <button className="px-4 py-2 button-attack rounded">Attack</button>
          <button className="px-4 py-2 button-finance rounded">Deploy Spy</button>
          <button className="px-4 py-2 button-military rounded">Form Alliance</button>
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
          
          {/* Action Panel */}
          <div className="mt-6 bg-gray-800 p-4 rounded-lg">
            <h4 className="font-bold mb-3 border-b border-gray-700 pb-2">BATTLEFIELD ACTIONS</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="game-card p-4 rounded-lg">
                <h5 className="font-bold mb-2">DIRECT ATTACK</h5>
                <p className="text-sm text-gray-400 mb-4">Launch an offensive to capture soldiers from another commander.</p>
                
                <div className="mb-3">
                  <label className="text-sm block mb-1">Target Commander:</label>
                  <select 
                    className="battlefield-select"
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                  >
                    <option value="">Select a target</option>
                    {players.filter(p => !p.isYou).map(player => (
                      <option key={player.id} value={player.id}>
                        {player.name} ({player.defense} Defense)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="text-sm block mb-1">Commit Soldiers: {attackSoldiers}</label>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={attackSoldiers}
                    onChange={(e) => setAttackSoldiers(parseInt(e.target.value))}
                    className="battlefield-range w-full"
                  />
                </div>
                
                {selectedPlayer && (
                  <div className="flex justify-between text-sm mb-4">
                    <div>
                      <span className="text-gray-400">Chance of Success:</span>
                      <span className="text-green-500 ml-1">
                        {calculateSuccessChance(
                          players.find(p => p.isYou),
                          players.find(p => p.id === selectedPlayer)
                        )}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Potential Gain:</span>
                      <span className="text-white ml-1">~{Math.round(attackSoldiers * 0.5)} Soldiers</span>
                    </div>
                  </div>
                )}
                
                <button 
                  className="w-full py-2 button-attack rounded"
                  disabled={!selectedPlayer}
                >
                  Launch Attack
                </button>
              </div>
              
              <div className="game-card p-4 rounded-lg">
                <h5 className="font-bold mb-2">DEPLOY SPY</h5>
                <p className="text-sm text-gray-400 mb-4">Gather intelligence about enemy positions and investments.</p>
                
                <div className="mb-3">
                  <label className="text-sm block mb-1">Target Commander:</label>
                  <select className="battlefield-select">
                    <option>Select a target</option>
                    {players.filter(p => !p.isYou).map(player => (
                      <option key={player.id}>{player.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Cost:</span>
                    <span className="text-white">10 Soldiers</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">2 Turns</span>
                  </div>
                </div>
                
                <button className="w-full py-2 button-finance rounded">Deploy Spy</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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

  const handleActionSubmit = (actionData) => {
    // Only update if we have valid action data
    if (actionData === null) {
      setCurrentAction(null);
      return;
    }
    
    // Validate soldier amount
    if (actionData.investment?.amount > soldiers) {
      return; // Don't update if amount exceeds available soldiers
    }
    
    setCurrentAction(actionData);
  };

  const handleViewMarket = () => {
    setActiveTab('market');
  };

  const renderCurrentAction = () => {
    if (!currentAction?.investment) return null;

    const { type, amount, market } = currentAction.investment;
    if (type !== 'invest' || !market) return null;

    const marketDisplay = {
      stocks: 'STOCK MARKET',
      realEstate: 'REAL ESTATE',
      crypto: 'CRYPTOCURRENCY',
      business: 'BUSINESS'
    };

    return (
      <div className="game-card p-6 rounded-lg bg-gray-800/50 border border-gray-700 mb-6">
        <h3 className="text-xl font-bold military-header mb-4">STRATEGIC DEPLOYMENT</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-sm mb-1">CURRENT DEPLOYMENT</div>
            <div className="font-bold">{marketDisplay[market] || market.toUpperCase()}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">DEPLOYED FORCES</div>
            <div className="font-bold">{amount} SOLDIERS</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">REMAINING FORCES</div>
            <div className="font-bold">{soldiers - amount} SOLDIERS</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="command-center" className="p-6 mb-16">
      <div className="max-w-6xl mx-auto bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
        {/* Top Navigation Bar */}
        <nav className="bg-gray-800 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src={"/logo.png"} alt="Logo" className="h-10 w-10 mr-3" />
            <span className="text-xl font-bold text-white military-header">SOLDIERS OF WEALTH</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="soldier-counter px-4 py-2 rounded-lg flex items-center">
              <img src={"/soldierIcon.png"} alt="Soldier Icon" className="h-8 w-8 mr-2" />
              <span className="text-xl font-bold text-white">165 SOLDIERS</span>
            </div>
            
            <div className="flex items-center text-gray-400">
              <span className="mr-1">Week:</span>
              <span className="text-white font-bold">2</span>
              <span className="mx-1">/</span>
              <span>4</span>
            </div>
            
            <div className="text-gray-400">
              <span>Moves Due: </span>
              <span className="text-yellow-400 font-bold">23:59:42</span>
            </div>
            
            <div className="relative">
              <button className="relative">
                <FaUserCircle className="h-10 w-10 text-gray-400" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                    {notifications}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>
        
        {/* Command Center Tabs */}
        <div className="flex border-b border-gray-700">
          <button 
            className={tabClass('command')} 
            onClick={() => setActiveTab('command')}
          >
            Command Center
          </button>
          <button 
            className={tabClass('market')} 
            onClick={() => setActiveTab('market')}
          >
            Market Dashboard
          </button>
          <button 
            className={tabClass('battlefield')} 
            onClick={() => setActiveTab('battlefield')}
          >
            Battlefield
          </button>
          <button 
            className={tabClass('intelligence')} 
            onClick={() => setActiveTab('intelligence')}
          >
            Intelligence
          </button>
        </div>
        
        {/* Main Content */}
        {activeTab === 'market' ? renderMarketDashboard() : activeTab === 'battlefield' ? renderBattlefield() : (
          <div className="p-6">
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
              gameId="current-game"
              playerId={currentUser?.uid}
              currentWeek={currentWeek}
              soldiers={soldiers}
              onActionSubmit={handleActionSubmit}
              onViewMarket={handleViewMarket}
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
                <button className="px-8 py-4 bg-gray-900/80 text-white rounded-lg border-2 border-white hover:bg-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gold/20 group">
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
          </div>
        )}
      </div>
    </section>
  );
};

export default CommandCenter;
