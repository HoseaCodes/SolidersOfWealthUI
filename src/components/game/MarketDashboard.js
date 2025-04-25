import React from 'react'
import { calculatePotentialReturn } from '../../utils';

export default function MarketDashboard({
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
    setActiveTab
}) {
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
}
