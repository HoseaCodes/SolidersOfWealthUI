import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1rem;
  background-color: #1E3D59;
  min-height: 100vh;
  color: #D4AF37;

  @media (min-width: 768px) {
    grid-template-columns: 3fr 1fr;
  }
`;

const MainPanel = styled.div`
  background: rgba(0, 0, 0, 0.8);
  padding: 1.5rem;
  border-radius: 8px;
`;

const SidePanel = styled.div`
  background: rgba(0, 0, 0, 0.8);
  padding: 1.5rem;
  border-radius: 8px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const SoldierCount = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #D4AF37;
`;

const ActionButton = styled.button`
  background-color: #4A5D23;
  color: #D4AF37;
  border: none;
  padding: 0.75rem 1.5rem;
  margin: 0.5rem;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #5a7028;
  }

  &:disabled {
    background-color: #2a3513;
    cursor: not-allowed;
  }
`;

const NavigationButton = styled(ActionButton)`
  width: 100%;
  margin: 0.5rem 0;
`;

export default function CommandCenter() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = onSnapshot(doc(db, 'players', currentUser.uid), (doc) => {
      if (doc.exists()) {
        setPlayerData(doc.data());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (loading) return <div>Loading...</div>;

  return (
    <Container>
      <MainPanel>
        <Header>
          <SoldierCount>{playerData?.soldiers || 0} Soldiers</SoldierCount>
          <div>Week {playerData?.currentWeek || 1} | Actions: {playerData?.actionsRemaining || 0}</div>
        </Header>

        <div>
          <h3>Actions Available</h3>
          <ActionButton disabled={!playerData?.actionsRemaining}>
            Invest Soldiers
          </ActionButton>
          <ActionButton disabled={!playerData?.actionsRemaining}>
            Launch Attack
          </ActionButton>
          <ActionButton disabled={!playerData?.actionsRemaining}>
            Build Defense
          </ActionButton>
        </div>
      </MainPanel>

      <SidePanel>
        <h3>Navigation</h3>
        <NavigationButton onClick={() => navigate('/market')}>
          Market Dashboard
        </NavigationButton>
        <NavigationButton onClick={() => navigate('/battlefield')}>
          Battlefield
        </NavigationButton>
        <NavigationButton onClick={() => navigate('/intelligence')}>
          Intelligence
        </NavigationButton>
      </SidePanel>
    </Container>
  );
}
