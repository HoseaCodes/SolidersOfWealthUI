import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const Container = styled.div`
  min-height: 100vh;
  background-color: #1E3D59;
  color: #D4AF37;
`;

const TopNav = styled.nav`
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #4A5D23;
  animation: ${slideIn} 0.5s ease-out;
`;

const Logo = styled.div`
  font-family: 'Black Ops One', cursive;
  font-size: 1.5rem;
  color: #D4AF37;
`;

const Stats = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  span:first-child {
    font-size: 0.8rem;
    color: #A9B4C2;
  }
  
  span:last-child {
    font-family: 'Black Ops One', cursive;
    font-size: 1.2rem;
    color: #D4AF37;
  }
`;

const TabNav = styled.nav`
  background: rgba(0, 0, 0, 0.5);
  padding: 0.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  animation: ${slideIn} 0.5s ease-out;
`;

const TabButton = styled.button`
  background: ${props => props.active ? '#4A5D23' : 'transparent'};
  color: #D4AF37;
  border: 2px solid ${props => props.active ? '#D4AF37' : 'transparent'};
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;

  &:hover {
    border-color: #D4AF37;
  }
`;

const Content = styled.main`
  padding: 2rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Timer = styled.div`
  font-family: monospace;
  font-size: 1.2rem;
  color: ${props => props.urgent ? '#C1292E' : '#D4AF37'};
`;

export default function GameLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [timeLeft, setTimeLeft] = useState('23:59:59');
  const [isUrgent, setIsUrgent] = useState(false);

  const tabs = [
    { path: '/game', label: 'Command Center' },
    { path: '/market', label: 'Market Dashboard' },
    { path: '/battlefield', label: 'Battlefield' },
    { path: '/intelligence', label: 'Intelligence' }
  ];

  useEffect(() => {
    // Simulate countdown timer
    const interval = setInterval(() => {
      const time = timeLeft.split(':').map(Number);
      let [hours, minutes, seconds] = time;
      
      seconds--;
      if (seconds < 0) {
        seconds = 59;
        minutes--;
        if (minutes < 0) {
          minutes = 59;
          hours--;
          if (hours < 0) {
            hours = 23;
          }
        }
      }

      const newTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      setTimeLeft(newTime);
      setIsUrgent(hours === 0 && minutes < 30);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  return (
    <Container>
      <TopNav>
        <Logo>SOLDIERS OF WEALTH</Logo>
        <Stats>
          <StatItem>
            <span>SOLDIERS</span>
            <span>{currentUser?.playerData?.soldiers || 0}</span>
          </StatItem>
          <StatItem>
            <span>WEEK</span>
            <span>{currentUser?.playerData?.currentWeek || 1}/4</span>
          </StatItem>
          <StatItem>
            <span>MOVES DUE</span>
            <Timer urgent={isUrgent}>{timeLeft}</Timer>
          </StatItem>
        </Stats>
      </TopNav>

      <TabNav>
        {tabs.map(tab => (
          <TabButton
            key={tab.path}
            active={location.pathname === tab.path}
            onClick={() => navigate(tab.path)}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabNav>

      <Content>
        {children}
      </Content>
    </Container>
  );
}
