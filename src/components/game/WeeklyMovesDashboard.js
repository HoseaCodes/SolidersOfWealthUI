import React from 'react'

export default function WeeklyMovesDashboard({
    weeklyMoves,
    currentWeek,
    maxMoves,
    movesSubmitted,
    isEditingMoves,
    toggleEditMoves,
    submitWeeklyMoves,
    removeWeeklyMove,
}) {
    // Format move name for display
    const formatMoveName = (move) => {
        if (move.type === 'investment' && move.investment) {
            if (move.investment.type === 'invest') {
                return `INVEST ${move.investment.amount} SOLDIERS IN ${move.investment.market.toUpperCase()}`;
            } else if (move.investment.type === 'diversify') {
                return 'DIVERSIFY FORCES ACROSS MARKETS';
            } else if (move.investment.type === 'hold') {
                return 'HOLD POSITION (CASH RESERVES)';
            }
        } else if (move.type === 'offensive' && move.offensive) {
            if (move.offensive.type === 'attack') {
                return `DIRECT ASSAULT ON ${move.offensive.targetName?.toUpperCase() || 'ENEMY'}`;
            } else if (move.offensive.type === 'spy') {
                return `DEPLOY SPY TO ${move.offensive.targetName?.toUpperCase() || 'ENEMY'}`;
            } else if (move.offensive.type === 'manipulate') {
                return `MARKET STRIKE ON ${move.offensive.market?.toUpperCase() || 'MARKET'}`;
            }
        } else if (move.type === 'defensive' && move.defensive) {
            if (move.defensive.type === 'defense') {
                return 'FORTIFY DEFENSES';
            } else if (move.defensive.type === 'insurance') {
                return `SECURE ASSETS IN ${move.defensive.market?.toUpperCase() || 'MARKET'}`;
            } else if (move.defensive.type === 'counter') {
                return 'DEPLOY COUNTER-INTELLIGENCE';
            }
        }
        
        return 'UNKNOWN MOVE TYPE';
    };
    
    // Function to get move type color
    const getMoveTypeColor = (move) => {
        if (move.type === 'investment') {
            return 'text-blue-400';
        } else if (move.type === 'offensive') {
            return 'text-red-400';
        } else if (move.type === 'defensive') {
            return 'text-green-400';
        }
        return 'text-gray-400';
    };
    
    // All actions message
    const getActionLimitMessage = () => {
        if (weeklyMoves.length >= maxMoves && !movesSubmitted) {
            return (
                <div className="notification p-4 rounded-lg bg-yellow-900/50 border border-yellow-700 mt-4">
                    <div className="flex items-center mb-2">
                        <h4 className="font-bold text-yellow-500">ALL ACTIONS SELECTED</h4>
                    </div>
                    <p className="text-gray-300">
                        You have selected all {maxMoves} actions for this week. Please submit your moves or edit your selections.
                    </p>
                </div>
            );
        }
        return null;
    };

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
              <p className="text-sm text-gray-500 mt-2">Use the Strategic Deployment, Offensive Operations, or Defensive Measures sections to select your moves.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {weeklyMoves.map((move, index) => (
                <div key={index} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-gray-400 text-sm mb-1">
                        MOVE {index + 1} - <span className={getMoveTypeColor(move)}>{move.type.toUpperCase()}</span>
                      </div>
                      <div className="font-bold">
                        {formatMoveName(move)}
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
          
          {/* Display warning if all actions used */}
          {getActionLimitMessage()}
          
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
}