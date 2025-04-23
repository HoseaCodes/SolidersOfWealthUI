import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';

const EconomyManagement = () => {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [economy, setEconomy] = useState({
    stockMarket: {
      currentValue: 100,
      volatility: 'medium',
      trend: 'stable'
    },
    realEstate: {
      currentValue: 100,
      volatility: 'low',
      trend: 'up'
    },
    cryptocurrency: {
      currentValue: 100,
      volatility: 'high',
      trend: 'stable',
      marketCap: 1000000,
      tradingVolume: 500000
    },
    business: {
      startupCost: 10000,
      successRate: 60,
      returnRate: 15,
      marketCondition: 'favorable'
    },
    interestRate: 5
  });

  const [isEditing, setIsEditing] = useState(false);
  const db = getFirestore();

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const gamesSnapshot = await getDocs(query(
        collection(db, 'games'),
        where('status', 'in', ['active', 'upcoming'])
      ));
      const gamesData = gamesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGames(gamesData);
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  useEffect(() => {
    if (selectedGame) {
      loadEconomyData();
    }
  }, [selectedGame, selectedWeek]);

  const loadEconomyData = async () => {
    try {
      const economyRef = collection(db, `games/${selectedGame.id}/economy`);
      const weekQuery = query(economyRef, where('week', '==', selectedWeek));
      const querySnapshot = await getDocs(weekQuery);
      
      if (!querySnapshot.empty) {
        const economyData = querySnapshot.docs[0];
        setEconomy({ id: economyData.id, ...economyData.data() });
      }
    } catch (error) {
      console.error('Error loading economy data:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (economy.id) {
        await updateDoc(doc(db, `games/${selectedGame.id}/economy`, economy.id), {
          stockMarket: economy.stockMarket,
          realEstate: economy.realEstate,
          cryptocurrency: economy.cryptocurrency,
          business: economy.business,
          interestRate: economy.interestRate,
          week: selectedWeek,
          lastUpdated: new Date().toISOString()
        });
      }
      setIsEditing(false);
      loadEconomyData();
    } catch (error) {
      console.error('Error saving economy data:', error);
    }
  };

  const volatilityOptions = ['low', 'medium', 'high', 'very high'];
  const trendOptions = ['up', 'down', 'stable', 'volatile'];
  const marketConditionOptions = ['favorable', 'neutral', 'unfavorable'];

  const renderMarketSection = (title, market, stateKey) => (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Current Value</label>
          {isEditing ? (
            <input
              type="number"
              value={market.currentValue}
              onChange={(e) => setEconomy({
                ...economy,
                [stateKey]: {
                  ...market,
                  currentValue: parseFloat(e.target.value)
                }
              })}
              className="w-full bg-gray-700 rounded p-2"
              min="0"
              step="0.01"
            />
          ) : (
            <p className="text-2xl font-bold">${market.currentValue}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Volatility</label>
          {isEditing ? (
            <select
              value={market.volatility}
              onChange={(e) => setEconomy({
                ...economy,
                [stateKey]: {
                  ...market,
                  volatility: e.target.value
                }
              })}
              className="w-full bg-gray-700 rounded p-2"
            >
              {volatilityOptions.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          ) : (
            <p className="capitalize">{market.volatility}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Trend</label>
          {isEditing ? (
            <select
              value={market.trend}
              onChange={(e) => setEconomy({
                ...economy,
                [stateKey]: {
                  ...market,
                  trend: e.target.value
                }
              })}
              className="w-full bg-gray-700 rounded p-2"
            >
              {trendOptions.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          ) : (
            <p className="capitalize">{market.trend}</p>
          )}
        </div>

        {stateKey === 'cryptocurrency' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Market Cap</label>
              {isEditing ? (
                <input
                  type="number"
                  value={market.marketCap}
                  onChange={(e) => setEconomy({
                    ...economy,
                    cryptocurrency: {
                      ...market,
                      marketCap: parseFloat(e.target.value)
                    }
                  })}
                  className="w-full bg-gray-700 rounded p-2"
                  min="0"
                  step="1000"
                />
              ) : (
                <p className="text-xl">${market.marketCap.toLocaleString()}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Trading Volume</label>
              {isEditing ? (
                <input
                  type="number"
                  value={market.tradingVolume}
                  onChange={(e) => setEconomy({
                    ...economy,
                    cryptocurrency: {
                      ...market,
                      tradingVolume: parseFloat(e.target.value)
                    }
                  })}
                  className="w-full bg-gray-700 rounded p-2"
                  min="0"
                  step="1000"
                />
              ) : (
                <p className="text-xl">${market.tradingVolume.toLocaleString()}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderBusinessSection = () => (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Business Investment</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Startup Cost</label>
          {isEditing ? (
            <input
              type="number"
              value={economy.business.startupCost}
              onChange={(e) => setEconomy({
                ...economy,
                business: {
                  ...economy.business,
                  startupCost: parseFloat(e.target.value)
                }
              })}
              className="w-full bg-gray-700 rounded p-2"
              min="0"
              step="100"
            />
          ) : (
            <p className="text-2xl font-bold">${economy.business.startupCost}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Success Rate (%)</label>
          {isEditing ? (
            <input
              type="number"
              value={economy.business.successRate}
              onChange={(e) => setEconomy({
                ...economy,
                business: {
                  ...economy.business,
                  successRate: parseFloat(e.target.value)
                }
              })}
              className="w-full bg-gray-700 rounded p-2"
              min="0"
              max="100"
              step="1"
            />
          ) : (
            <p className="text-xl">{economy.business.successRate}%</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Return Rate (%)</label>
          {isEditing ? (
            <input
              type="number"
              value={economy.business.returnRate}
              onChange={(e) => setEconomy({
                ...economy,
                business: {
                  ...economy.business,
                  returnRate: parseFloat(e.target.value)
                }
              })}
              className="w-full bg-gray-700 rounded p-2"
              min="-100"
              max="1000"
              step="0.1"
            />
          ) : (
            <p className="text-xl">{economy.business.returnRate}%</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Market Condition</label>
          {isEditing ? (
            <select
              value={economy.business.marketCondition}
              onChange={(e) => setEconomy({
                ...economy,
                business: {
                  ...economy.business,
                  marketCondition: e.target.value
                }
              })}
              className="w-full bg-gray-700 rounded p-2"
            >
              {marketConditionOptions.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          ) : (
            <p className="capitalize">{economy.business.marketCondition}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Economy Management</h2>
        <div className="flex space-x-4">
          <select
            value={selectedGame?.id || ''}
            onChange={(e) => {
              const game = games.find(g => g.id === e.target.value);
              setSelectedGame(game);
            }}
            className="bg-gray-700 rounded p-2"
          >
            <option value="">Select Game</option>
            {games.map(game => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>

          {selectedGame && (
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
              className="bg-gray-700 rounded p-2"
            >
              {[...Array(52)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Week {i + 1}
                </option>
              ))}
            </select>
          )}

          {selectedGame && !isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Edit Economy
            </button>
          ) : (
            selectedGame && (
              <div className="space-x-4">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 rounded-md hover:bg-green-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    loadEconomyData();
                  }}
                  className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {!selectedGame ? (
        <div className="text-center py-8 text-gray-400">
          Please select a game to manage its economy
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderMarketSection('Stock Market', economy.stockMarket, 'stockMarket')}
          {renderMarketSection('Real Estate Market', economy.realEstate, 'realEstate')}
          {renderMarketSection('Cryptocurrency Market', economy.cryptocurrency, 'cryptocurrency')}
          {renderBusinessSection()}
        </div>
      )}
    </div>
  );
};

export default EconomyManagement;
