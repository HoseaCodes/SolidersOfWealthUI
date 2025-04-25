import React from 'react'

export default function IntelligenceBoard({
    players,
    playerStatsData,
    achievements,
    marketStatus,
    errorMessage,
    successMessage,
    setErrorMessage,
    setSuccessMessage,
    intelligenceTab,
    setIntelligenceTab,
    weeklyHighlights,
    currentWeek
}) {
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
}
