import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const Container = styled.div`
  padding: 1rem;
  background-color: #1E3D59;
  min-height: 100vh;
  color: #D4AF37;
`;

const LeaderboardPanel = styled.div`
  background: rgba(0, 0, 0, 0.8);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const StatsPanel = styled.div`
  background: rgba(0, 0, 0, 0.8);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const LeaderboardTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  }

  th {
    color: #D4AF37;
  }

  tr:hover {
    background: rgba(212, 175, 55, 0.1);
  }
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const StatCard = styled.div`
  background: rgba(74, 93, 35, 0.2);
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
`;

export default function Intelligence() {
  const { currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playerStats, setPlayerStats] = useState({
    totalInvestments: 0,
    successfulAttacks: 0,
    defensesDeployed: 0,
    weeklyGrowth: 0
  });

  useEffect(() => {
    async function fetchLeaderboard() {
      const q = query(
        collection(db, 'players'),
        orderBy('soldiers', 'desc'),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const rankings = [];
      querySnapshot.forEach((doc) => {
        rankings.push({ id: doc.id, ...doc.data() });
      });
      setLeaderboard(rankings);
      setLoading(false);
    }

    fetchLeaderboard();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Container>
      <h2>Intelligence Center</h2>
      
      <LeaderboardPanel>
        <h3>Top Commanders</h3>
        <LeaderboardTable>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Commander</th>
              <th>Soldiers</th>
              <th>Defense Level</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((player, index) => (
              <tr key={player.id} style={{
                backgroundColor: player.id === currentUser?.uid ? 'rgba(212, 175, 55, 0.1)' : 'transparent'
              }}>
                <td>{index + 1}</td>
                <td>Commander #{player.id.slice(0, 6)}</td>
                <td>{player.soldiers}</td>
                <td>{player.defense || 0}</td>
              </tr>
            ))}
          </tbody>
        </LeaderboardTable>
      </LeaderboardPanel>

      <StatsPanel>
        <h3>Your Battle Statistics</h3>
        <StatGrid>
          <StatCard>
            <h4>Total Investments</h4>
            <p>{playerStats.totalInvestments}</p>
          </StatCard>
          <StatCard>
            <h4>Successful Attacks</h4>
            <p>{playerStats.successfulAttacks}</p>
          </StatCard>
          <StatCard>
            <h4>Defenses Deployed</h4>
            <p>{playerStats.defensesDeployed}</p>
          </StatCard>
          <StatCard>
            <h4>Weekly Growth</h4>
            <p>{playerStats.weeklyGrowth}%</p>
          </StatCard>
        </StatGrid>
      </StatsPanel>
    </Container>
  );
}
