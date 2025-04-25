import React from 'react'

export default function ActionsRemaining({
    currentWeek,
    actionsRemaining,
    isEditingMoves
}) {
  return (
    <div className="flex justify-end mb-4">
        <div className="flex items-center">
            <span className="text-sm text-gray-400 mr-2">WEEK {currentWeek} ACTIONS REMAINING</span>
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
  )
}
