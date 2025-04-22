import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';

const Container = styled.div`
  padding: 1rem;
  background-color: #1E3D59;
  min-height: 100vh;
  color: #D4AF37;
`;

const MarketGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const MarketCard = styled.div`
  background: rgba(0, 0, 0, 0.8);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid ${props => props.isSelected ? '#D4AF37' : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #D4AF37;
  }
`;

const InvestmentSlider = styled.input`
  width: 100%;
  margin: 1rem 0;
`;

const InvestButton = styled.button`
  background-color: #4A5D23;
  color: #D4AF37;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;

  &:hover {
    background-color: #5a7028;
  }

  &:disabled {
    background-color: #2a3513;
    cursor: not-allowed;
  }
`;

const markets = [
  {
    id: 'stocks',
    name: 'Stock Market',
    risk: 'High',
    baseReturn: '±15%',
    description: 'High volatility with potential for significant gains or losses.'
  },
  {
    id: 'realestate',
    name: 'Real Estate',
    risk: 'Medium',
    baseReturn: '+8% to -5%',
    description: 'Stable investment with moderate returns and lower risk.'
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    risk: 'Very High',
    baseReturn: '±25%',
    description: 'Extremely volatile market with highest potential returns.'
  },
  {
    id: 'business',
    name: 'Business Investment',
    risk: 'Medium-High',
    baseReturn: '+18% to -12%',
    description: 'Strategic investments in business ventures.'
  }
];

export default function MarketDashboard() {
  const { currentUser } = useAuth();
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState(10);

  const handleInvestment = () => {
    // TODO: Implement investment logic
    console.log(\`Investing \${investmentAmount} soldiers in \${selectedMarket?.name}\`);
  };

  return (
    <Container>
      <h2>Market Dashboard</h2>
      <MarketGrid>
        {markets.map(market => (
          <MarketCard
            key={market.id}
            isSelected={selectedMarket?.id === market.id}
            onClick={() => setSelectedMarket(market)}
          >
            <h3>{market.name}</h3>
            <p>Risk Level: {market.risk}</p>
            <p>Base Return: {market.baseReturn}</p>
            <p>{market.description}</p>
            
            {selectedMarket?.id === market.id && (
              <>
                <InvestmentSlider
                  type="range"
                  min="10"
                  max={currentUser?.playerData?.soldiers || 100}
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                />
                <p>Investment: {investmentAmount} soldiers</p>
                <InvestButton onClick={handleInvestment}>
                  Invest Soldiers
                </InvestButton>
              </>
            )}
          </MarketCard>
        ))}
      </MarketGrid>
    </Container>
  );
}
