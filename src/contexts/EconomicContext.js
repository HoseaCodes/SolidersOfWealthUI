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
    events: [],
    markets: {
      stocks: {
        name: 'Stock Market',
        risk: 'High',
        sensitivity: 'High',
        baseReturn: { min: -15, max: 15 },
        currentReturn: 0,
        volatility: 0.2,
        modifiers: {
          boom: 20,
          stable: 0,
          downturn: -15,
          crisis: -30
        },
        events: []
      },
      realEstate: {
        name: 'Real Estate',
        risk: 'Medium',
        sensitivity: 'Medium',
        baseReturn: { min: -5, max: 8 },
        volatility: 0.1,
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
    const events = [
      { type: 'boom', weight: 0.2, impact: 1.5 },
      { type: 'stable', weight: 0.4, impact: 1.0 },
      { type: 'downturn', weight: 0.3, impact: 0.7 },
      { type: 'crisis', weight: 0.1, impact: 0.5 }
    ];
  
    const marketEvents = [
      { type: 'merger', probability: 0.1, impact: { stocks: 0.15 } },
      { type: 'scandal', probability: 0.05, impact: { stocks: -0.2 } },
      { type: 'policy_change', probability: 0.15, impact: { realEstate: 0.1 } },
      { type: 'tech_breakthrough', probability: 0.1, impact: { crypto: 0.25 } },
      { type: 'regulation', probability: 0.1, impact: { business: -0.15 } }
    ];

    // Generate cycle event
    let random = Math.random();
    let cumulativeWeight = 0;
    let selectedEvent;

    for (const event of events) {
      cumulativeWeight += event.weight;
      if (random <= cumulativeWeight) {
        selectedEvent = event;
        break;
      }
    }

    // Generate market-specific events
    const activeMarketEvents = marketEvents.filter(event => 
      Math.random() <= event.probability
    );

    // Update state with new events
    setEconomicState(prev => ({
      ...prev,
      currentCycle: selectedEvent.type,
      events: [...prev.events, ...activeMarketEvents],
      markets: Object.entries(prev.markets).reduce((acc, [key, market]) => {
        const marketEvent = activeMarketEvents.find(e => e.impact[key]);
        return {
          ...acc,
          [key]: {
            ...market,
            currentReturn: market.baseReturn.max * selectedEvent.impact + 
              (marketEvent ? marketEvent.impact[key] * 100 : 0),
            events: [...market.events, ...(marketEvent ? [marketEvent] : [])]
          }
        };
      }, prev.markets)
    }));
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
    toggleAutoSimulation,
    getMarketEvents: (marketKey) => economicState.markets[marketKey]?.events || [],
    getGlobalEvents: () => economicState.events
  };

  return (
    <EconomicContext.Provider value={value}>
      {children}
    </EconomicContext.Provider>
  );
};

export default EconomicContext;
