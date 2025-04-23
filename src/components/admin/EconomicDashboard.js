import React from 'react';
import { useEconomic } from '../../contexts/EconomicContext';

const EconomicDashboard = () => {
  const { 
    economicState, 
    autoSimulation, 
    setCycle, 
    generateRandomEvent, 
    toggleAutoSimulation 
  } = useEconomic();

  return (
    <div className="p-6 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Economic Simulation Dashboard</h2>
          <div className="text-sm text-gray-400">
            Last Update: {new Date(economicState.lastUpdate).toLocaleString()}
          </div>
        </div>
        
        {/* Economic Cycle Control */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Economic Cycle</h3>
          <div className="flex space-x-4 mb-4">
            {['boom', 'stable', 'downturn', 'crisis'].map(cycle => (
              <button
                key={cycle}
                onClick={() => setCycle(cycle)}
                className={`px-4 py-2 rounded-md capitalize ${
                  economicState.currentCycle === cycle
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {cycle}
              </button>
            ))}
          </div>
          
          {/* Auto Simulation Controls */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoSimulation}
                onChange={toggleAutoSimulation}
                className="form-checkbox"
              />
              <span>Auto Simulation (7 day cycles)</span>
            </label>
            <button
              onClick={generateRandomEvent}
              className="px-4 py-2 bg-green-600 rounded-md"
            >
              Generate Random Event
            </button>
          </div>
        </div>

        {/* Market Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(economicState.markets).map(([key, market]) => (
            <div key={key} className="p-4 bg-gray-800 rounded-lg">
              <h4 className="text-lg font-bold mb-3">{market.name}</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Current Return:</span>
                  <span className={`font-bold ${market.currentReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {market.currentReturn}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Risk Level:</span>
                  <span>{market.risk}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Economic Sensitivity:</span>
                  <span>{market.sensitivity}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Base Min: {market.baseReturn.min}%</div>
                  <div>Base Max: {market.baseReturn.max}%</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(market.modifiers).map(([cycle, modifier]) => (
                    <div key={cycle} className={modifier >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {cycle}: {modifier > 0 ? '+' : ''}{modifier}%
                    </div>
                  ))}
                </div>
                {market.startupCost && (
                  <div className="text-yellow-500">Requires startup cost</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EconomicDashboard;
