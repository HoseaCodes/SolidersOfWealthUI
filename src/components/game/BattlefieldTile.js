import React from 'react'

export default function BattlefieldTile({ tile, index, players }) {
  return (
    <div key={index} className={`battlefield-tile ${tile.type === 'empty' ? 'hexagon-gray' : tile.type === 'market' ? `hexagon-${tile.color}` : ''}`}>
      <div className="battlefield-tile-content">
        {tile.type === 'empty' ? (
          <span className="text-xs text-gray-500">Empty</span>
        ) : tile.type === 'player' ? (
          <div className="text-center">
            <img src="/images/avatar.png" alt="Player Icon" className="h-20 w-20 mx-auto" />
            <span className="text-xs">{players.find(p => p.id === tile.player)?.name}</span>
            <div className="text-xs">{tile.soldiers} </div>
          </div>
        ) : tile.type === 'market' ? (
          <div className="text-center">
            <span className="text-xs">{tile.name}</span>
            <div className="text-xs">{tile.change}</div>
          </div>
        ) : (
          <div className="text-center">
            <span className="text-xs">{tile.name}</span>
            <div className="text-xs">{tile.desc}</div>
          </div>
        )}
      </div>
    </div>
  )
}
