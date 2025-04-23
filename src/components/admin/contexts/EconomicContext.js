import React, { createContext, useContext, useState, useEffect } from 'react';

const EconomicContext = createContext();

export const useEconomic = () => {
  const context = useContext(EconomicContext);
  if (!context) {
    throw new Error('useEconomic must be used within an EconomicProvider');
  }
  return context;
};

export const EconomicProvider = ({ children }) => {
  const [economicState, setEconomicState] = useState({
    currentCycle: 'stable',
    lastUpdate: Date.now(),
    markets: {
      stocks: {
        name: 'Stock Market',
        risk: 'High',
        sensitivity: 'High',
        baseReturn: { min: -15, max: 15 },
        currentReturn: 0,
        modifiers: {
          boom: 20,
          stable: 0,
          downturn: -15,
          crisis: -30
        }
      },
      realEstate: {
        name: 'Real Estate',
        risk: 'Medium',
        sensitivity: 'Medium',
        baseReturn: { min: -5, max: 8 },
        currentReturn: 0,
        modifiers: {
          boom: 12,
          stable: 0,
          downturn: -5,
          crisis: -15
        }
      },
      crypto: {
        name: 'Cryptocurrency',
        risk: 'Very High',
        sensitivity: 'Variable',
        baseReturn: { min: -25, max: 25 },
        currentReturn: 0,
        modifiers: {
          boom: 30,
          stable: 0,
          downturn: -20,
          crisis: -40
        }
      },
      business: {
        name: 'Business Investment',
        risk: 'Medium-High',
        sensitivity: 'High',
        baseReturn: { min: -12, max: 18 },
        currentReturn: 0,
        startupCost: true,
        modifiers: {
          boom: 25,
          stable: 0,
          downturn: -10,
          crisis: -25
        }
      }
    }
  });

  const [autoSimulation, setAutoSimulation] = useState(false);
  const [simulationSpeed] = useState(7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds

  useEffect(() => {
    if (!autoSimulation) return;

    const interval = setInterval(() => {
      generateRandomEvent();
    }, simulationSpeed);

    return () => clearInterval(interval);
  }, [autoSimulation, simulationSpeed]);

  const updateMarket = (marketKey, updates) => {
    setEconomicState(prev => ({
      ...prev,
      markets: {
        ...prev.markets,
        [marketKey]: {
          ...prev.markets[marketKey],
          ...updates
        }
      }
    }));
  };

  const setCycle = (cycle) => {
    setEconomicState(prev => {
      const newState = { 
        ...prev, 
        currentCycle: cycle,
        lastUpdate: Date.now()
      };
      
      // Update returns for all markets based on new cycle
      Object.keys(newState.markets).forEach(market => {
        const baseReturn = newState.markets[market].baseReturn;
        const modifier = newState.markets[market].modifiers[cycle];
        newState.markets[market].currentReturn = baseReturn.max + modifier;
      });
      
      return newState;
    });
  };

  const generateRandomEvent = () => {
    const events = ['boom', 'stable', 'downturn', 'crisis'];
    const weights = [0.2, 0.4, 0.3, 0.1];
    
    let random = Math.random();
    let cumulativeWeight = 0;
    
    for (let i = 0; i < events.length; i++) {
      cumulativeWeight += weights[i];
      if (random <= cumulativeWeight) {
        setCycle(events[i]);
        break;
      }
    }
  };

  const toggleAutoSimulation = () => {
    setAutoSimulation(prev => !prev);
  };

  const value = {
    economicState,
    autoSimulation,
    updateMarket,
    setCycle,
    generateRandomEvent,
    toggleAutoSimulation
  };

  return (
    <EconomicContext.Provider value={value}>
      {children}
    </EconomicContext.Provider>
  );
};

export default EconomicContext;
