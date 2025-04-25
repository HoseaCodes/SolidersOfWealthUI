import React from 'react'

export default function PlayerCard(player) {
  return (
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
  )
}
