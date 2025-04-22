import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import GameLayout from './GameLayout';
import { db } from '../../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const fadeInUp = keyframes`
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
`;

const AlertBanner = styled.div`
  background: ${props => {
    switch (props.state) {
      case 'BOOM': return 'rgba(74, 93, 35, 0.9)';
      case 'CRISIS': return 'rgba(193, 41, 46, 0.9)';
      case 'DOWNTURN': return 'rgba(212, 175, 55, 0.3)';
      default: return 'rgba(30, 61, 89, 0.9)';
    }
  }};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  animation: ${fadeInUp} 0.5s ease-out;

  h3 {
    font-family: 'Black Ops One', cursive;
    margin: 0 0 0.5rem 0;
    color: #D4AF37;
  }

  p {
    color: #A9B4C2;
    margin: 0;
  }
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const ActionCard = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(212, 175, 55, 0.2);
  animation: ${fadeInUp} 0.5s ease-out;
  animation-delay: ${props => props.delay || '0s'};
  opacity: 0;
  animation-fill-mode: forwards;

  &:hover {
    border-color: #D4AF37;
  }

  h3 {
    font-family: 'Black Ops One', cursive;
    color: #D4AF37;
    margin: 0 0 1rem 0;
  }
`;

const ActionButton = styled.button`
  background: ${props => props.variant === 'attack' ? '#C1292E' : 
               props.variant === 'invest' ? '#4A5D23' : 
               'transparent'};
  color: #D4AF37;
  border: 2px solid ${props => props.variant === 'attack' ? '#C1292E' : 
                              props.variant === 'invest' ? '#4A5D23' : 
                              '#D4AF37'};
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${props => props.pulse ? pulseAnimation : 'none'} 2s infinite;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatValue = styled.div`
  font-family: monospace;
  font-size: 1.2rem;
  color: #D4AF37;
  margin: 0.5rem 0;
`;

const economicStates = {
  BOOM: {
    description: "Markets are thriving! Increased returns on investments, but higher attack costs.",
    effects: {
      investmentMultiplier: 1.5,
      attackCost: 1.3,
      defenseCost: 1.0
    }
  },
  STABLE: {
    description: "Standard market conditions. Balanced costs and returns.",
    effects: {
      investmentMultiplier: 1.0,
      attackCost: 1.0,
      defenseCost: 1.0
    }
  },
  DOWNTURN: {
    description: "Market uncertainty. Reduced returns but cheaper attack costs.",
    effects: {
      investmentMultiplier: 0.7,
      attackCost: 0.8,
      defenseCost: 1.2
    }
  },
  CRISIS: {
    description: "Economic chaos! High-risk, high-reward environment.",
    effects: {
      investmentMultiplier: 0.5,
      attackCost: 0.6,
      defenseCost: 1.5
    }
  }
};

const investmentOptions = {
  STOCKS: {
    name: "Stock Market",
    baseReturn: 0.15,
    risk: 0.1,
    minSoldiers: 10
  },
  REAL_ESTATE: {
    name: "Real Estate",
    baseReturn: 0.1,
    risk: 0.05,
    minSoldiers: 20
  },
  CRYPTO: {
    name: "Cryptocurrency",
    baseReturn: 0.25,
    risk: 0.2,
    minSoldiers: 15
  },
  BUSINESS: {
    name: "Private Business",
    baseReturn: 0.2,
    risk: 0.15,
    minSoldiers: 25
  }
};

export default function CommandCenter() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState(null);
  const [economicState, setEconomicState] = useState('STABLE');
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = onSnapshot(doc(db, 'players', currentUser.uid), (doc) => {
      if (doc.exists()) {
        setPlayerData(doc.data());
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    // Simulate random economic state changes
    const interval = setInterval(() => {
      const states = Object.keys(economicStates);
      const newState = states[Math.floor(Math.random() * states.length)];
      setEconomicState(newState);
    }, 300000); // Change every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const calculateReturn = (option) => {
    const multiplier = economicStates[economicState].effects.investmentMultiplier;
    const baseReturn = investmentOptions[option].baseReturn;
    const risk = investmentOptions[option].risk;
    const randomFactor = 1 + (Math.random() * risk * 2 - risk);
    return baseReturn * multiplier * randomFactor;
  };

  const handleInvest = async (option) => {
    if (!playerData || loading) return;

    const soldiers = playerData.soldiers;
    const minRequired = investmentOptions[option].minSoldiers;

    if (soldiers < minRequired) {
      alert(`Need at least ${minRequired} soldiers to invest in ${investmentOptions[option].name}`);
      return;
    }

    setLoading(true);
    try {
      const returnRate = calculateReturn(option);
      const soldiersGained = Math.floor(minRequired * returnRate);
      
      await updateDoc(doc(db, 'players', currentUser.uid), {
        soldiers: soldiers - minRequired + soldiersGained,
        investments: [...(playerData.investments || []), {
          type: option,
          amount: minRequired,
          return: soldiersGained,
          timestamp: new Date().toISOString()
        }]
      });
    } catch (error) {
      console.error('Investment error:', error);
      alert('Failed to process investment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GameLayout>
      <AlertBanner state={economicState}>
        <h3>ECONOMIC STATUS: {economicState}</h3>
        <p>{economicStates[economicState].description}</p>
      </AlertBanner>

      <ActionGrid>
        <ActionCard delay="0.2s">
          <h3>INVESTMENT</h3>
          <p>Deploy your soldiers across different markets</p>
          {Object.entries(investmentOptions).map(([key, option]) => (
            <div key={key}>
              <ActionButton
                variant="invest"
                onClick={() => handleInvest(key)}
                disabled={loading || !playerData || playerData.soldiers < option.minRequired}
              >
                {option.name} ({option.minSoldiers} soldiers)
              </ActionButton>
              <StatValue>
                Est. Return: {(option.baseReturn * economicStates[economicState].effects.investmentMultiplier * 100).toFixed(1)}%
              </StatValue>
            </div>
          ))}
        </ActionCard>

        <ActionCard delay="0.4s">
          <h3>OFFENSE</h3>
          <p>Launch strategic attacks on your opponents</p>
          <ActionButton
            variant="attack"
            onClick={() => navigate('/battlefield')}
          >
            Plan Attack
          </ActionButton>
        </ActionCard>

        <ActionCard delay="0.6s">
          <h3>DEFENSE</h3>
          <p>Fortify your position against enemy attacks</p>
          <ActionButton
            onClick={() => navigate('/battlefield')}
          >
            Deploy Defenses
          </ActionButton>
        </ActionCard>
      </ActionGrid>
    </GameLayout>
  );
}
