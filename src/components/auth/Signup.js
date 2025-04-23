import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import styled from 'styled-components';
import { FcGoogle } from 'react-icons/fc';

const SignupContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #1E3D59;
  color: #D4AF37;
`;

const Form = styled.form`
  background: rgba(0, 0, 0, 0.8);
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(212, 175, 55, 0.2);
`;

const Title = styled.h1`
  font-family: 'Black Ops One', cursive;
  text-align: center;
  margin-bottom: 2rem;
`;

const Input = styled.input`
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
  background-color: #4A5D23;
  color: #D4AF37;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 1rem;
  
  &:hover {
    background-color: #5a7028;
  }
  
  &:disabled {
    background-color: #2a3513;
    cursor: not-allowed;
  }
`;

const Error = styled.div`
  color: #C1292E;
  margin-bottom: 1rem;
  text-align: center;
`;

const LoginLink = styled(Link)`
  display: block;
  text-align: center;
  margin-top: 1rem;
  color: #D4AF37;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const db = getFirestore();

const generateTitle = () => {
  const titles = [
    'Commander Alpha',
    'Commander Bravo',
    'Commander Delta',
    'Commander Echo',
    'Commander Fox',
    'Commander Zulu'
  ];
  return titles[Math.floor(Math.random() * titles.length)];
};

const generateDefense = () => {
  const defenses = [
    { level: 'Strong', value: 75 },
    { level: 'Moderate', value: 50 },
    { level: 'Weak', value: 25 }
  ];
  return defenses[Math.floor(Math.random() * defenses.length)];
};

const createInitialPlayerProfile = async (userId, name) => {
  const defense = generateDefense();
  const playerData = {
    id: userId,
    name: name,
    title: generateTitle(),
    soldiers: 100,
    weeklySoldierIncome: 50,
    actionsPerWeek: 3,
    actionsRemaining: 3,
    defense: defense.level,
    defenseLevel: defense.value,
    investments: { 
      stocks: 0, 
      realEstate: 0, 
      cash: 100  // Start with all money in cash
    },
    isYou: true,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'players', userId), playerData);
  } catch (error) {
    console.error('Error creating player profile:', error);
    throw new Error('Failed to create player profile');
  }
};

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      
      // Create auth user
      const userCredential = await signup(email, password);
      
      // Create player profile
      await createInitialPlayerProfile(userCredential.user.uid, name);
      
      // Navigate to game
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to create an account: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SignupContainer>
      <Form onSubmit={handleSubmit}>
        <Title>JOIN THE BATTLE</Title>
        {error && <Error>{error}</Error>}
        
        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <div className="my-4 flex items-center justify-between">
          <div className="border-t border-gray-600 flex-grow"></div>
          <span className="px-4 text-gray-400">or</span>
          <div className="border-t border-gray-600 flex-grow"></div>
        </div>

        <Button 
          type="button" 
          onClick={() => {
            setLoading(true);
            loginWithGoogle()
              .then(() => navigate('/dashboard'))
              .catch(error => setError('Failed to sign in with Google: ' + error.message))
              .finally(() => setLoading(false));
          }} 
          className="bg-white hover:bg-gray-100 text-gray-800"
          disabled={loading}
        >
          <div className="flex items-center justify-center">
            <FcGoogle className="w-6 h-6" />
            <span className="ml-2">Sign up with Google</span>
          </div>
        </Button>
        
        <LoginLink to="/login">
          Already have an account? Sign in
        </LoginLink>
      </Form>
    </SignupContainer>
  );
}
