import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const PlayerActions = ({ gameId, playerId, currentWeek, soldiers, onActionSubmit, onViewMarket }) => {
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
      if (category === 'investment') {
        onActionSubmit(null); // Clear current deployment display
      }
    }

    if (category === 'investment') {
      setInvestmentAmount(10);
      // If selecting invest action, update display with current amount
      if (action.id === 'invest') {
        onActionSubmit({
          investment: {
            type: 'invest',
            amount: 10, // Default amount
            market: selectedMarkets[category] // Keep current market if exists
          }
        });
      }
    }
  };

  const handleMarketSelect = (category, market) => {
    setSelectedMarkets(prev => ({
      ...prev,
      [category]: market
    }));
    
    // Notify parent of investment selection
    if (category === 'investment' && selectedActions[category]?.id === 'invest') {
      onActionSubmit({
        investment: {
          type: 'invest',
          amount: investmentAmount,
          market: market
        }
      });
    }
  };

  const handleInvestmentAmountChange = (amount) => {
    const newAmount = parseInt(amount) || 0;
    setInvestmentAmount(newAmount);
    
    // Update deployment display with new amount
    if (selectedActions.investment?.id === 'invest' && selectedMarkets.investment) {
      onActionSubmit({
        investment: {
          type: 'invest',
          amount: newAmount,
          market: selectedMarkets.investment
        }
      });
    }
  };

  const validateActions = () => {
    if (!selectedActions.investment || !selectedActions.offensive || !selectedActions.defensive) {
      return 'Please select one action from each category';
    }

    if (selectedActions.investment.id === 'invest' && investmentAmount < 10) {
      return 'Minimum investment is 10 soldiers';
    }

    if (selectedActions.investment.id === 'invest' && investmentAmount > soldiers) {
      return 'You don\'t have enough soldiers';
    }

    if (['attack', 'spy'].includes(selectedActions.offensive.id) && !targetPlayer) {
      return 'Please select a target player';
    }

    // Validate market selection
    if (selectedActions.investment.markets && !selectedMarkets.investment) {
      return 'Please select a market for your investment action';
    }
    if (selectedActions.offensive.markets && !selectedMarkets.offensive) {
      return 'Please select a market for your offensive action';
    }
    if (selectedActions.defensive.markets && !selectedMarkets.defensive) {
      return 'Please select a market for your defensive action';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateActions();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const actionData = {
        playerId,
        gameId,
        week: currentWeek,
        timestamp: new Date().toISOString(),
        investment: {
          type: selectedActions.investment.id,
          amount: investmentAmount,
          market: selectedMarkets.investment
        },
        offensive: {
          type: selectedActions.offensive.id,
          targetPlayer: targetPlayer,
          market: selectedMarkets.offensive
        },
        defensive: {
          type: selectedActions.defensive.id,
          market: selectedMarkets.defensive
        }
      };

      await addDoc(collection(db, 'playerActions'), actionData);
      
      // Notify parent component of the action
      if (onActionSubmit) {
        onActionSubmit(actionData);
      }
      
      setSelectedActions({
        investment: null,
        offensive: null,
        defensive: null
      });
      setSelectedMarkets({
        investment: '',
        offensive: '',
        defensive: ''
      });
      setInvestmentAmount(10);
      setTargetPlayer('');
      
    } catch (error) {
      console.error('Error submitting actions:', error);
      setError('Failed to submit actions. Please try again.');
    } finally {
      setLoading(false);
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
                  onChange={(e) => handleInvestmentAmountChange(e.target.value)}
                  className="bg-gray-800 p-2 rounded w-24 border border-gray-600 text-center font-bold"
                />
              </div>
            )}

            {selectedActions[category]?.id === action.id &&
             ['attack', 'spy'].includes(action.id) && (
              <select
                className="bg-gray-700/50 p-2 rounded border border-gray-600 text-sm"
                value={targetPlayer}
                onChange={(e) => setTargetPlayer(e.target.value)}
              >
                <option value="">SELECT TARGET COMMANDER</option>
                {otherPlayers.map(player => (
                  <option key={player.id} value={player.id}>
                    {(player.displayName || player.name).toUpperCase()}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          <img src="/soldierIcon.png" alt="Soldier Icon" className="h-8 w-8 mr-2" />
          <div>
            <span className="text-sm text-gray-400">AVAILABLE FORCES</span>
            <div className="text-xl font-bold text-white">{soldiers} SOLDIERS</div>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`px-8 py-4 rounded-lg text-white font-bold transition-all duration-300 ${
            loading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20'
          }`}
        >
          {loading ? 'EXECUTING...' : 'CONFIRM BATTLE PLAN'}
        </button>
      </div>
    </form>
  );
};

export default PlayerActions;
