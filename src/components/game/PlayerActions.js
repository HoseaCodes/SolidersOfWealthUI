import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const PlayerActions = ({ gameId, playerId, currentWeek, soldiers, actionsRemaining, disabled, onActionSubmit, onViewMarket, onViewBattlefield }) => {
  const [selectedActions, setSelectedActions] = useState({
    investment: null,
    offensive: null,
    defensive: null
  });
  
  const [investmentAmount, setInvestmentAmount] = useState(10);
  const [targetPlayer, setTargetPlayer] = useState('');
  const [selectedMarkets, setSelectedMarkets] = useState({
    investment: '',
    offensive: '',
    defensive: ''
  });
  const [otherPlayers, setOtherPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentAction, setCurrentAction] = useState(null);
  const [activeTab, setActiveTab] = useState('investment');

  const db = getFirestore();

  const actions = {
    investment: [
      { id: 'invest', name: 'DEPLOY SOLDIERS', description: 'Invest soldiers in chosen market (minimum 10)', markets: ['stocks', 'realEstate', 'cryptocurrency', 'business'], buttonClass: 'button-finance' },
      { id: 'diversify', name: 'DIVERSIFY FORCES', description: 'Split investments across multiple markets', buttonClass: 'button-finance' },
      { id: 'hold', name: 'HOLD POSITION', description: 'Keep soldiers as liquid assets (no risk, no gain)', buttonClass: 'button-finance' }
    ],
    offensive: [
      { id: 'attack', name: 'DIRECT ASSAULT', description: 'Target another player to steal soldiers', buttonClass: 'button-attack' },
      { id: 'manipulate', name: 'MARKET STRIKE', description: 'Temporarily affect market returns', markets: ['stocks', 'realEstate', 'cryptocurrency', 'business'], buttonClass: 'button-attack' },
      { id: 'spy', name: 'DEPLOY SPY', description: 'Learn one player\'s planned moves', buttonClass: 'button-attack' }
    ],
    defensive: [
      { id: 'defense', name: 'FORTIFY DEFENSES', description: 'Reduce attack effectiveness by 50-80%', buttonClass: 'button-military' },
      { id: 'insurance', name: 'SECURE ASSETS', description: 'Protect investment from negative returns', markets: ['stocks', 'realEstate', 'cryptocurrency', 'business'], buttonClass: 'button-military' },
      { id: 'counter', name: 'COUNTER-INTEL', description: 'Block spy attempts and fake information', buttonClass: 'button-military' }
    ]
  };

  useEffect(() => {
    loadOtherPlayers();
  }, [gameId]);

  const loadOtherPlayers = async () => {
    try {
      const playersRef = collection(db, 'players');
      const gamePlayersQuery = query(playersRef, where('currentGame', '==', gameId));
      const snapshot = await getDocs(gamePlayersQuery);
      const players = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(player => player.id !== playerId);
      setOtherPlayers(players);
    } catch (error) {
      console.error('Error loading players:', error);
      setError('Failed to load other players');
    }
  };

  // Allow selecting multiple actions from the same category
  const handleActionSelect = (category, action) => {
    setSelectedActions(prev => ({
      ...prev,
      [category]: action
    }));

    // Reset market selection when changing action
    if (!action.markets) {
      setSelectedMarkets(prev => ({
        ...prev,
        [category]: ''
      }));
    }

    // Update current action with the selection
    updateCurrentAction(category, action);
  };

  // Helper to update the current action with new selections
  const updateCurrentAction = (category, action, marketValue = null, amountValue = null, targetValue = null) => {
    let actionData = null;
    
    // Build the action data based on category
    if (category === 'investment') {
      // For investment actions
      if (action.id === 'invest') {
        actionData = {
          investment: {
            type: action.id,
            amount: amountValue !== null ? amountValue : investmentAmount,
            market: marketValue !== null ? marketValue : selectedMarkets.investment
          }
        };
      } else {
        actionData = {
          investment: {
            type: action.id
          }
        };
      }
    } else if (category === 'offensive') {
      // For offensive actions
      if (['attack', 'spy'].includes(action.id)) {
        // Find the target player to get their name
        const targetPlayerObj = otherPlayers.find(p => p.id === (targetValue !== null ? targetValue : targetPlayer));
        const targetName = targetPlayerObj ? (targetPlayerObj.displayName || targetPlayerObj.name) : 'Unknown Commander';
        
        actionData = {
          offensive: {
            type: action.id,
            targetPlayer: targetValue !== null ? targetValue : targetPlayer,
            targetName: targetName
          }
        };
      } else if (action.id === 'manipulate') {
        actionData = {
          offensive: {
            type: action.id,
            market: marketValue !== null ? marketValue : selectedMarkets.offensive
          }
        };
      } else {
        actionData = {
          offensive: {
            type: action.id
          }
        };
      }
    } else if (category === 'defensive') {
      // For defensive actions
      if (action.id === 'insurance') {
        actionData = {
          defensive: {
            type: action.id,
            market: marketValue !== null ? marketValue : selectedMarkets.defensive
          }
        };
      } else {
        actionData = {
          defensive: {
            type: action.id
          }
        };
      }
    }
    
    // Don't submit if we don't have an action
    if (!actionData) return;
    
    // Set current action locally
    setCurrentAction(actionData);
  };

  const handleMarketSelect = (category, market) => {
    setSelectedMarkets(prev => ({
      ...prev,
      [category]: market
    }));
    
    // Update action with new market selection
    if (selectedActions[category]) {
      updateCurrentAction(category, selectedActions[category], market);
    }
  };

  const handleInvestmentAmountChange = (newAmount) => {
    setInvestmentAmount(newAmount);
    
    // Update action with new amount
    if (selectedActions.investment && selectedActions.investment.id === 'invest') {
      updateCurrentAction('investment', selectedActions.investment, null, newAmount);
    }
  };

  const handleTargetPlayerSelect = (playerId) => {
    setTargetPlayer(playerId);
    
    // Update action with new target player
    if (selectedActions.offensive && ['attack', 'spy'].includes(selectedActions.offensive.id)) {
      updateCurrentAction('offensive', selectedActions.offensive, null, null, playerId);
    }
  };

  // Validate the action before submitting
  const validateAction = (actionData) => {
    const category = actionData.investment ? 'investment' : 
                    actionData.offensive ? 'offensive' : 'defensive';
    const action = actionData[category];
    
    if (actionsRemaining <= 0 && !disabled) {
      return "No actions remaining this week";
    }
    
    if (category === 'investment' && action.type === 'invest') {
      if (!action.market) {
        return "Please select a market for your investment";
      }
      
      if (action.amount < 10) {
        return "Minimum investment is 10 soldiers";
      }
      
      if (action.amount > soldiers) {
        return "You don't have enough soldiers for this investment";
      }
    }
    
    if (category === 'offensive') {
      if (['attack', 'spy'].includes(action.type) && !action.targetPlayer) {
        return "Please select a target player";
      }
      
      if (action.type === 'manipulate' && !action.market) {
        return "Please select a market to manipulate";
      }
    }
    
    if (category === 'defensive' && action.type === 'insurance' && !action.market) {
      return "Please select a market to secure";
    }
    
    return null;
  };

  // Handle the execution of an action
  const handleExecuteAction = (e, category) => {
    e.preventDefault();
    
    // Check if we're at max moves or no actions remaining
    if (actionsRemaining <= 0 && !disabled) {
      setError("No actions remaining this week");
      return;
    }
    
    if (disabled) {
      setError("Your moves for this week have been submitted. Edit your moves to make changes.");
      return;
    }
    
    // Get current action details
    const action = selectedActions[category];
    if (!action) {
      setError(`Please select an action from ${category}`);
      return;
    }
    
    // Create action data
    let actionData = {};
    
    if (category === 'investment') {
      if (action.id === 'invest') {
        if (!selectedMarkets.investment) {
          setError("Please select a market for your investment");
          return;
        }
        
        actionData = {
          investment: {
            type: action.id,
            amount: investmentAmount,
            market: selectedMarkets.investment
          }
        };
      } else {
        actionData = {
          investment: {
            type: action.id
          }
        };
      }
    } else if (category === 'offensive') {
      if (['attack', 'spy'].includes(action.id)) {
        if (!targetPlayer) {
          setError("Please select a target player");
          return;
        }
        
        // Find the target player to get their name
        const targetPlayerObj = otherPlayers.find(p => p.id === targetPlayer);
        const targetName = targetPlayerObj ? (targetPlayerObj.displayName || targetPlayerObj.name) : 'Unknown Commander';
        
        actionData = {
          offensive: {
            type: action.id,
            targetPlayer: targetPlayer,
            targetName: targetName
          }
        };
      } else if (action.id === 'manipulate') {
        if (!selectedMarkets.offensive) {
          setError("Please select a market to manipulate");
          return;
        }
        
        actionData = {
          offensive: {
            type: action.id,
            market: selectedMarkets.offensive
          }
        };
      } else {
        actionData = {
          offensive: {
            type: action.id
          }
        };
      }
    } else if (category === 'defensive') {
      if (action.id === 'insurance') {
        if (!selectedMarkets.defensive) {
          setError("Please select a market to secure");
          return;
        }
        
        actionData = {
          defensive: {
            type: action.id,
            market: selectedMarkets.defensive
          }
        };
      } else {
        actionData = {
          defensive: {
            type: action.id
          }
        };
      }
    }
    
    // Clear error
    setError('');
    
    // Submit the action to parent component
    if (onActionSubmit) {
      onActionSubmit(actionData);
    }
    
    // Reset the selection for this category
    setSelectedActions(prev => ({
      ...prev,
      [category]: null
    }));
    
    setSelectedMarkets(prev => ({
      ...prev,
      [category]: ''
    }));
    
    if (category === 'investment') {
      setInvestmentAmount(10);
    } else if (category === 'offensive' && ['attack', 'spy'].includes(action.id)) {
      setTargetPlayer('');
    }
  };

  const renderActionButtons = (category) => (
    <div className="game-card p-6 rounded-lg bg-gray-800/50 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold military-header">{category === 'investment' ? 'STRATEGIC DEPLOYMENT' : category === 'offensive' ? 'OFFENSIVE OPERATIONS' : 'DEFENSIVE MEASURES'}</h3>
        {selectedActions[category] && (
          <div className="px-3 py-1 rounded bg-gray-700/50 text-sm">
            {selectedMarkets[category] ? `${selectedMarkets[category].toUpperCase()} SELECTED` : 'ACTION SELECTED'}
          </div>
        )}
      </div>
      {category === 'investment' && (
        <button 
          onClick={() => onViewMarket()}
          className="inline-block mb-4 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded border border-gray-600 text-sm transition-all duration-300"
        >
          VIEW MARKET DASHBOARD →
        </button>
      )}
      {category === 'offensive' && (
        <button 
          onClick={() => onViewBattlefield()}
          className="inline-block mb-4 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded border border-gray-600 text-sm transition-all duration-300"
        >
          VIEW BATTLEFIELD →
        </button>
      )}
      <p className="mb-4 text-gray-400 text-sm">
        {category === 'investment' 
          ? 'Deploy your soldiers strategically to maximize resource gains.'
          : category === 'offensive'
          ? 'Execute tactical operations against enemy positions.'
          : 'Establish defensive positions to protect your assets.'}
      </p>
      <div className="space-y-3">
        {actions[category].map(action => (
          <div key={action.id} className="flex flex-col space-y-2">
            <button
              type="button"
              onClick={() => handleActionSelect(category, action)}
              className={`w-full py-3 px-4 rounded flex justify-between items-center transition-all duration-300 ${
                selectedActions[category]?.id === action.id
                  ? `${action.buttonClass} shadow-lg`
                  : 'bg-gray-700/50 hover:bg-gray-600/50'
              }`}
              disabled={actionsRemaining <= 0 || disabled}
            >
              <div className="text-left">
                <div className="font-bold">{action.name}</div>
                <div className="text-sm text-gray-400">{action.description}</div>
              </div>
              {selectedActions[category]?.id === action.id && (
                <div className="ml-2 text-xs bg-white/10 px-2 py-1 rounded">
                  SELECTED
                </div>
              )}
            </button>

            {selectedActions[category]?.id === action.id && action.markets && (
              <select
                className="bg-gray-700/50 p-2 rounded border border-gray-600 text-sm"
                value={selectedMarkets[category]}
                onChange={(e) => handleMarketSelect(category, e.target.value)}
                disabled={actionsRemaining <= 0 || disabled}
              >
                <option value="">SELECT TARGET MARKET</option>
                {action.markets.map(market => (
                  <option key={market} value={market}>
                    {market === 'realEstate' ? 'REAL ESTATE' : market.toUpperCase()}
                  </option>
                ))}
              </select>
            )}

            {selectedActions[category]?.id === action.id && 
             category === 'investment' && 
             action.id === 'invest' && (
              <div className="soldier-counter px-4 py-2 rounded-lg flex items-center justify-between bg-gray-700/50 border border-gray-600">
                <span className="text-gray-400">DEPLOYMENT SIZE:</span>
                <input
                  type="number"
                  min="10"
                  max={soldiers}
                  value={investmentAmount}
                  onChange={(e) => handleInvestmentAmountChange(parseInt(e.target.value) || 10)}
                  className="bg-gray-800 p-2 rounded w-24 border border-gray-600 text-center font-bold"
                  disabled={actionsRemaining <= 0 || disabled}
                />
              </div>
            )}

            {selectedActions[category]?.id === action.id &&
             ['attack', 'spy'].includes(action.id) && (
              <select
                className="bg-gray-700/50 p-2 rounded border border-gray-600 text-sm"
                value={targetPlayer}
                onChange={(e) => handleTargetPlayerSelect(e.target.value)}
                disabled={actionsRemaining <= 0 || disabled}
              >
                <option value="">SELECT TARGET COMMANDER</option>
                {otherPlayers.map(player => (
                  <option key={player.id} value={player.id}>
                    {(player.displayName || player.name).toUpperCase()}
                  </option>
                ))}
              </select>
            )}
            
            {/* Execute Action button for each selected action */}
            {selectedActions[category]?.id === action.id && (
              <button
                type="button"
                onClick={(e) => handleExecuteAction(e, category)}
                className={`w-full py-2 px-4 rounded bg-green-700 hover:bg-green-600 transition-all duration-300 ${
                  actionsRemaining <= 0 || disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={actionsRemaining <= 0 || disabled}
              >
                EXECUTE {action.name}
                {actionsRemaining <= 0 ? ' (NO ACTIONS LEFT)' : disabled ? ' (MOVES SUBMITTED)' : ''}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="notification p-4 rounded-lg bg-red-900/50 border border-red-700">
          <div className="flex items-center mb-2">
            <h4 className="font-bold text-red-500">MISSION ALERT</h4>
          </div>
          <p className="text-gray-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderActionButtons('investment')}
        {renderActionButtons('offensive')}
        {renderActionButtons('defensive')}
      </div>

      <div className="flex justify-between items-center mt-8 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
        <div className="soldier-counter px-4 py-2 rounded-lg flex items-center">
          <img src="/images/soldier.png" alt="Soldier Icon" className="h-8 w-8 mr-2" />
          <div>
            <span className="text-sm text-gray-400">AVAILABLE FORCES</span>
            <div className="text-xl font-bold text-white">{soldiers} SOLDIERS</div>
          </div>
        </div>
        <div className="flex items-center bg-gray-700/50 px-4 py-2 rounded-lg">
          <span className="text-sm text-gray-400 mr-2">ACTIONS REMAINING</span>
          <div className="flex space-x-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <div 
                key={index} 
                className={`h-3 w-3 rounded-full ${index < actionsRemaining ? 'bg-green-500' : 'bg-gray-600'}`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerActions;