import React from 'react'
import PlayerCard from './PlayerCard'
import BattlefieldTile from './BattlefieldTile'

export default function Battlefield({
    players,
    battlefieldTiles,
    marketStatus,
    errorMessage,
    successMessage,
    setErrorMessage,
    setSuccessMessage,
    isEditingMoves,
    actionsRemaining,
    handleBattlefieldAction,
    movesSubmitted,
    weeklyMoves,
    maxMoves,
    setActiveTab
}) {
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
                {players.map(player => <PlayerCard key={player.id} {...player} />)}
              </div>
              
              {/* Center: Battlefield Grid */}
              <div className="col-span-2">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="battlefield-grid">
                    {battlefieldTiles.map((tile, index) => <BattlefieldTile key={index} tile={tile} index={index} players={players} />)}
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
  )
}
