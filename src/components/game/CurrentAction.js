import React from 'react'
import { calculatePotentialReturn } from '../../utils';

export default function CurrentAction({
    currentAction,
    marketStatus,
}) {
    if (!currentAction) return null;
  
    return (
    <>
        {/* Investment Display */}
        {currentAction.investment && (
        <div className="game-card p-6 rounded-lg bg-gray-800/50 border border-gray-700 mb-6">
            <h3 className="text-xl font-bold military-header mb-4">STRATEGIC DEPLOYMENT</h3>
            <div className="flex items-center justify-between">
            <div>
                <div className="text-gray-400 text-sm mb-1">MARKET</div>
                <div className="font-bold">{currentAction.investment.market.toUpperCase()}</div>
            </div>
            <div>
                <div className="text-gray-400 text-sm mb-1">DEPLOYMENT SIZE</div>
                <div className="font-bold">{currentAction.investment.amount} SOLDIERS</div>
            </div>
            <div>
                <div className="text-gray-400 text-sm mb-1">POTENTIAL RETURN</div>
                <div className={marketStatus[currentAction.investment.market] >= 0 ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                {calculatePotentialReturn(currentAction.investment.market, currentAction.investment.amount)} SOLDIERS
                </div>
            </div>
            </div>
        </div>
        )}

        {/* Offensive Action Display */}
        {currentAction.offensive && (
        <div className="game-card p-6 rounded-lg bg-gray-800/50 border border-gray-700 mb-6">
            <h3 className="text-xl font-bold military-header mb-4">STRATEGIC DEPLOYMENT</h3>
            <div className="flex items-center justify-between">
            <div>
                <div className="text-gray-400 text-sm mb-1">OPERATION TYPE</div>
                <div className={`font-bold ${currentAction.offensive.type === 'attack' ? 'text-red-500' : 'text-gray-300'}`}>
                {currentAction.offensive.type === 'attack' ? 'DIRECT ASSAULT' : 'DEPLOY SPY'}
                </div>
            </div>
            <div>
                <div className="text-gray-400 text-sm mb-1">TARGET COMMANDER</div>
                <div className="font-bold flex items-center">
                <img src="/images/avatar.png" alt="Target Avatar" className="h-6 w-6 rounded-full mr-2" />
                {currentAction.offensive.targetName.toUpperCase()}
                </div>
            </div>
            <div>
                <div className="text-gray-400 text-sm mb-1">OPERATION COST</div>
                <div className="font-bold">
                {currentAction.offensive.type === 'attack' ? '25' : '10'} SOLDIERS
                </div>
            </div>
            </div>
        </div>
        )}
    </>
    );
}
