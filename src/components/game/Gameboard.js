import React from 'react'

export default function Gameboard({
    gameData,
    setActiveTab
}) {
  return (
    <div 
        id="gameBoard" 
        className="rounded-lg overflow-hidden mb-8 relative h-80 bg-cover bg-center group"
        style={{
            backgroundImage: 'url("/images/battlefield_preview.jpg")',
            backgroundBlendMode: 'overlay',
            backgroundColor: 'rgba(0, 0, 0, 0.4)'
        }}
        >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center h-full">
            <div className="absolute top-4 left-4">
            <h3 className="text-2xl font-bold military-header mb-2">ACTIVE BATTLEFIELD</h3>
            <p className="text-gray-300">{gameData?.players?.length || 12} Commanders in Battle</p>
            </div>
            <button 
            onClick={() => setActiveTab('battlefield')}
            className="px-8 py-4 bg-gray-900/80 text-white rounded-lg border-2 border-white hover:bg-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gold/20 group"
            >
            <span className="text-lg font-bold military-header">VIEW FULL BATTLEFIELD</span>
            <div className="mt-1 text-sm text-gray-400 group-hover:text-gold transition-colors">Real-time battle updates available</div>
            </button>
            {gameData?.endTime && (
            <div className="absolute bottom-4 right-4 flex items-center space-x-4">
                <div className="text-right">
                <div className="text-sm text-gray-400">Battle Ends In</div>
                <div className="text-xl font-bold text-gold">04:23:15</div>
                </div>
            </div>
            )}
        </div>
    </div>
  )
}
