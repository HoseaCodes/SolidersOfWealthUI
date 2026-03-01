import React, { useEffect, useState, useCallback } from 'react';
import { calculatePotentialReturn } from '../../utils';
import { useEconomic } from '../../contexts/EconomicContext';
import { toast } from 'react-toastify';
import { ErrorBoundary } from 'react-error-boundary';

const MarketDashboard = ({
  marketStatus,
  errorMessage,
  successMessage,
  setErrorMessage,
  setSuccessMessage,
  isEditingMoves,
  actionsRemaining,
  handleMarketInvestment,
  movesSubmitted,
  weeklyMoves,
  maxMoves,
  soldiers,
  soldierInvestments,
  setActiveTab,
}) => {
  const { currentCycle, predictMarketMovement } = useEconomic();
  const [marketPredictions, setMarketPredictions] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch market predictions
  const fetchPredictions = useCallback(async () => {
    setIsLoading(true);
    try {
      const predictions = await predictMarketMovement();
      setMarketPredictions(predictions);
    } catch (error) {
      console.error('Error fetching market predictions:', error);
      toast.error('Failed to load market predictions');
    } finally {
      setIsLoading(false);
    }
  }, [predictMarketMovement]);

  useEffect(() => {
    fetchPredictions();
    const interval = setInterval(fetchPredictions, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [fetchPredictions]);

  const handleInvestment = useCallback((marketId, amount) => {
    if (amount >= 10 && amount <= soldiers) {
      if ((actionsRemaining > 0 && !movesSubmitted) || isEditingMoves) {
        if (weeklyMoves.length < maxMoves || isEditingMoves) {
          handleMarketInvestment(marketId, amount);
        }
      }
    } else if (amount > soldiers) {
      setErrorMessage(`Cannot invest ${amount} soldiers when you only have ${soldiers}`);
    } else if (amount < 10) {
      setErrorMessage('Minimum investment is 10 soldiers');
    }
  }, [actionsRemaining, handleMarketInvestment, isEditingMoves, maxMoves, movesSubmitted, setErrorMessage, soldiers, weeklyMoves.length]);

  const markets = [
    {
      id: 'stocks',
      name: 'STOCK MARKET',
      status: marketStatus.stocks,
      buttonClass: 'button-finance',
      description: 'High risk/reward with high economic sensitivity',
      riskLevel: 'High',
      riskColor: 'red',
      riskPercentage: 75,
    },
    {
      id: 'realEstate',
      name: 'REAL ESTATE',
      status: marketStatus.realEstate,
      buttonClass: 'button-military',
      description: 'Medium risk/reward with moderate economic sensitivity',
      riskLevel: 'Medium',
      riskColor: 'yellow',
      riskPercentage: 50,
    },
    {
      id: 'crypto',
      name: 'CRYPTOCURRENCY',
      status: marketStatus.crypto,
      buttonClass: 'button-gold',
      description: 'Very high risk/reward with extreme economic sensitivity',
      riskLevel: 'Very High',
      riskColor: 'red',
      riskPercentage: 90,
    },
    {
      id: 'business',
      name: 'BUSINESS',
      status: marketStatus.business,
      buttonClass: 'button-attack',
      description: 'Low risk/reward with low economic sensitivity',
      riskLevel: 'Low',
      riskColor: 'green',
      riskPercentage: 25,
    },
  ];

  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <div className="error-container">
          <h3>Error loading market data</h3>
          <p>{error.message}</p>
          <button onClick={resetErrorBoundary}>Retry</button>
        </div>
      )}
    >
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
        <div className={`economy-${currentCycle.toLowerCase()} px-6 py-4 rounded-lg`}>
          <h3 className="text-xl font-bold military-header mb-1">ECONOMIC STATUS REPORT</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="market-overview">
              <h4 className="text-lg font-semibold">Current Cycle: {currentCycle}</h4>
              <p className="text-gray-400">
                Market Intelligence: Stocks {marketStatus.stocks}%
              </p>
            </div>
            <div className="market-predictions">
              <h4 className="text-lg font-semibold">Market Forecast</h4>
              {isLoading ? (
                <div className="loading-spinner">Loading predictions...</div>
              ) : (
                <div className="predictions-grid">
                  {Object.entries(marketPredictions).map(([market, prediction]) => (
                    <div key={market} className="prediction-item">
                      <span className="market-name">{market}:</span>
                      <span className={`trend-${prediction.trend.toLowerCase()}`}>
                        {prediction.trend} ({prediction.confidence}% confidence)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Market Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {markets.map((market) => (
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
                <div className="text-gray-400 text-sm">{market.description}</div>

                {/* Risk Level */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">RISK ASSESSMENT</span>
                    <span className="text-sm text-gray-400">{market.riskLevel}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div
                      className={`h-2 bg-${market.riskColor}-500 rounded-full transition-all duration-300`}
                      style={{ width: `${market.riskPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Investment Stats */}
                <div className="soldier-counter px-4 py-2 rounded-lg bg-gray-700/30 border border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">CURRENT DEPLOYMENT</span>
                    <span className="font-bold">{soldierInvestments[market.id] || 0} SOLDIERS</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-400">POTENTIAL RETURN</span>
                    <span className={market.status >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {calculatePotentialReturn(market.id, soldierInvestments[market.id] || 0, marketStatus)} SOLDIERS
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
                    className={`${market.buttonClass} flex-1 py-2 px-4 rounded-lg font-bold`}
                    onClick={() => {
                      const amount = parseInt(document.getElementById(`invest-${market.id}`).value) || 0;
                      handleInvestment(market.id, amount);
                    }}
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
      </div>
    </ErrorBoundary>
  );
};

export default MarketDashboard;
