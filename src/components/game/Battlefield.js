import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, getDocs } from 'firebase/firestore';

const Container = styled.div`
  padding: 1rem;
  background-color: #1E3D59;
  min-height: 100vh;
  color: #D4AF37;
`;

const BattlefieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const PlayerCard = styled.div`
  background: rgba(0, 0, 0, 0.8);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid ${props => props.isSelected ? '#D4AF37' : 'transparent'};
  cursor: pointer;

  &:hover {
    border-color: #D4AF37;
  }
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

const ActionPanel = styled.div`
  background: rgba(0, 0, 0, 0.8);
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
`;

export default function Battlefield() {
  const { currentUser } = useAuth();
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayers() {
      const q = query(collection(db, 'players'));
      const querySnapshot = await getDocs(q);
      const playersList = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== currentUser?.uid) {
          playersList.push({ id: doc.id, ...doc.data() });
        }
      });
      setPlayers(playersList);
      setLoading(false);
    }

    fetchPlayers();
  }, [currentUser]);

  const handleAttack = () => {
    // TODO: Implement attack logic
    console.log(\`Attacking player \${selectedPlayer?.id}\`);
  };

  const handleSpy = () => {
    // TODO: Implement spy logic
    console.log(\`Spying on player \${selectedPlayer?.id}\`);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Container>
      <h2>Battlefield</h2>
      <BattlefieldGrid>
        {players.map(player => (
          <PlayerCard
            key={player.id}
            isSelected={selectedPlayer?.id === player.id}
            onClick={() => setSelectedPlayer(player)}
          >
            <h3>Commander #{player.id.slice(0, 6)}</h3>
            <p>Soldiers: {player.soldiers}</p>
            <p>Defense Level: {player.defense || 0}</p>
          </PlayerCard>
        ))}
      </BattlefieldGrid>

      {selectedPlayer && (
        <ActionPanel>
          <h3>Actions</h3>
          <ActionButton onClick={handleAttack}>
            Launch Attack
          </ActionButton>
          <ActionButton onClick={handleSpy}>
            Deploy Spy
          </ActionButton>
        </ActionPanel>
      )}
    </Container>
  );
}
