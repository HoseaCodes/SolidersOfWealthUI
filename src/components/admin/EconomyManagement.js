import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

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
    <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
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
              className="w-full bg-gray-700 rounded p-2 text-white"
              min="0"
              step="0.01"
            />
          ) : (
            <p className="text-xl sm:text-2xl font-bold">${market.currentValue}</p>
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
              className="w-full bg-gray-700 rounded p-2 text-white"
            >
              {volatilityOptions.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          ) : (
            <p className="capitalize text-gray-300">{market.volatility}</p>
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
              className="w-full bg-gray-700 rounded p-2 text-white"
            >
              {trendOptions.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          ) : (
            <p className="capitalize text-gray-300">{market.trend}</p>
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
                  className="w-full bg-gray-700 rounded p-2 text-white"
                  min="0"
                  step="1000"
                />
              ) : (
                <p className="text-lg sm:text-xl text-gray-300">${market.marketCap.toLocaleString()}</p>
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
                  className="w-full bg-gray-700 rounded p-2 text-white"
                  min="0"
                  step="1000"
                />
              ) : (
                <p className="text-lg sm:text-xl text-gray-300">${market.tradingVolume.toLocaleString()}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="w-full sm:w-auto space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row">
          <select
            value={selectedGame?.id || ''}
            onChange={(e) => setSelectedGame(games.find(g => g.id === e.target.value))}
            className="w-full sm:w-64 bg-gray-700 rounded p-2 text-white"
          >
            <option value="">Select Game</option>
            {games.map(game => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>

          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
            className="w-full sm:w-48 bg-gray-700 rounded p-2 text-white"
            disabled={!selectedGame}
          >
            {[...Array(52)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Week {i + 1}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-auto flex justify-end">
          {isEditing ? (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
              >
                <FaSave />
                <span>Save</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center space-x-2"
              >
                <FaTimes />
                <span>Cancel</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
              disabled={!selectedGame}
            >
              <FaEdit />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      {selectedGame ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderMarketSection('Stock Market', economy.stockMarket, 'stockMarket')}
          {renderMarketSection('Real Estate', economy.realEstate, 'realEstate')}
          {renderMarketSection('Cryptocurrency', economy.cryptocurrency, 'cryptocurrency')}
          
          {/* Business Section */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Business</h3>
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
                    className="w-full bg-gray-700 rounded p-2 text-white"
                    min="0"
                    step="100"
                  />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold">${economy.business.startupCost}</p>
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
                    className="w-full bg-gray-700 rounded p-2 text-white"
                    min="0"
                    max="100"
                    step="1"
                  />
                ) : (
                  <p className="text-lg sm:text-xl text-gray-300">{economy.business.successRate}%</p>
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
                    className="w-full bg-gray-700 rounded p-2 text-white"
                    min="0"
                    step="0.1"
                  />
                ) : (
                  <p className="text-lg sm:text-xl text-gray-300">{economy.business.returnRate}%</p>
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
                    className="w-full bg-gray-700 rounded p-2 text-white"
                  >
                    {marketConditionOptions.map(option => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="capitalize text-gray-300">{economy.business.marketCondition}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">Select a game to manage its economy</p>
        </div>
      )}
    </div>
  );
};

export default EconomyManagement;
