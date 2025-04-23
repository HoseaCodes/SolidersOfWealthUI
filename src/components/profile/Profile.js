import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import styled from 'styled-components';

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  background-color: #1E3D59;
  color: #D4AF37;
  padding: 2rem;
`;

const Form = styled.form`
  background: rgba(0, 0, 0, 0.8);
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  border: 1px solid rgba(212, 175, 55, 0.2);
`;

const Title = styled.h1`
  font-family: 'Black Ops One', cursive;
  text-align: center;
  margin-bottom: 2rem;
`;

const Input = styled.input`
  width: ${props => props.width || '100%'};
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #4A5D23;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: #D4AF37;
  
  &:focus {
    outline: none;
    border-color: #D4AF37;
  }
`;

const InputGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #4A5D23;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: #D4AF37;
  
  &:focus {
    outline: none;
    border-color: #D4AF37;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: ${props => props.variant === 'danger' ? '#C1292E' : '#4A5D23'};
  color: #D4AF37;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 1rem;
  
  &:hover {
    background-color: ${props => props.variant === 'danger' ? '#d1393e' : '#5a7028'};
  }
  
  &:disabled {
    background-color: ${props => props.variant === 'danger' ? '#8a1d21' : '#2a3513'};
    cursor: not-allowed;
  }
`;

const Error = styled.div`
  color: #C1292E;
  margin-bottom: 1rem;
  text-align: center;
`;

const Success = styled.div`
  color: #4A5D23;
  margin-bottom: 1rem;
  text-align: center;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const StatLabel = styled.span`
  font-size: 0.9rem;
  color: #888;
`;

const StatValue = styled.span`
  font-size: 1.2rem;
  font-weight: bold;
  color: #D4AF37;
`;

const Profile = () => {
  const [playerData, setPlayerData] = useState(null);
  const [name, setName] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [defense, setDefense] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const db = getFirestore();

  const militaryTitles = [
    'Commander Alpha', 'Commander Bravo', 'Commander Delta', 'Commander Echo',
    'General Hawk', 'Colonel Steel', 'Major Storm', 'Captain Thunder',
    'Shadow Operative', 'Ghost Commander', 'Stealth Tactician', 'Night Stalker',
    'Strategic Director', 'War Economist', 'Market Marshal', 'Trade Admiral',
    'Elite Vanguard', 'Prime Executor', 'Apex Commander', 'Supreme Sentinel',
    'Wealth Warlord', 'Fortune General', 'Asset Commander', 'Treasury Defender',
    'Master Strategist', 'Battle Broker', 'War Merchant', 'Combat Financier'
  ];

  const defenseOptions = [
    { level: 'Strong', value: 75 },
    { level: 'Moderate', value: 50 },
    { level: 'Weak', value: 25 }
  ];

  const generateRandomTitle = () => {
    const randomTitle = militaryTitles[Math.floor(Math.random() * militaryTitles.length)];
    setCustomTitle(randomTitle);
  };

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const docRef = doc(db, 'players', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPlayerData(data);
          setName(data.name);
          setCustomTitle(data.title || '');
          setDefense(data.defense);
        }
      } catch (error) {
        setError('Error fetching player data: ' + error.message);
      }
    };

    fetchPlayerData();
  }, [currentUser.uid, db]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const defenseLevel = defenseOptions.find(d => d.level === defense)?.value || 50;
      
      const updates = {
        name,
        title: customTitle,
        defense,
        defenseLevel,
        lastUpdated: new Date().toISOString()
      };

      await updateDoc(doc(db, 'players', currentUser.uid), updates);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      setError('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      setError('');
      setLoading(true);

      // Delete player document
      await deleteDoc(doc(db, 'players', currentUser.uid));
      
      // Sign out
      await logout();
      
      // Navigate to signup
      navigate('/signup');
    } catch (error) {
      setError('Failed to delete account: ' + error.message);
      setLoading(false);
    }
  };

  if (!playerData) {
    return (
      <ProfileContainer>
        <Title>Loading...</Title>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <Form onSubmit={handleSubmit}>
        <Title>COMMANDER PROFILE</Title>
        
        {error && <Error>{error}</Error>}
        {success && <Success>{success}</Success>}
        
        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
        <InputGroup>
          <Input
            type="text"
            placeholder="Custom Title"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            width="70%"
          />
          <Button
            type="button"
            onClick={generateRandomTitle}
            style={{ width: '30%', marginTop: 0 }}
          >
            GENERATE
          </Button>
        </InputGroup>
        
        <Select
          value={defense}
          onChange={(e) => setDefense(e.target.value)}
          required
        >
          <option value="">Select Defense Level</option>
          {defenseOptions.map(d => (
            <option key={d.level} value={d.level}>{d.level} (Defense: {d.value})</option>
          ))}
        </Select>

        <StatsContainer>
          <StatItem>
            <StatLabel>Soldiers</StatLabel>
            <StatValue>{playerData.soldiers}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Weekly Income</StatLabel>
            <StatValue>{playerData.weeklySoldierIncome}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Actions Per Week</StatLabel>
            <StatValue>{playerData.actionsPerWeek}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Actions Remaining</StatLabel>
            <StatValue>{playerData.actionsRemaining}</StatValue>
          </StatItem>
        </StatsContainer>

        <Button type="submit" disabled={loading}>
          UPDATE PROFILE
        </Button>

        <Button 
          type="button" 
          variant="danger" 
          onClick={handleDeleteAccount}
          disabled={loading}
        >
          {showDeleteConfirm ? 'CLICK AGAIN TO CONFIRM DELETION' : 'DELETE ACCOUNT'}
        </Button>
      </Form>
    </ProfileContainer>
  );
};

export default Profile;
