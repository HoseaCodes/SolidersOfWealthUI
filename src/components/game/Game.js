import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #1a1a1a;
  color: #ffffff;
`;

const Card = styled.div`
  background-color: #2d2d2d;
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #ffffff;
`;

const Button = styled.button`
  background-color: #4a90e2;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #357abd;
  }
`;

export default function Game() {
  const navigate = useNavigate();

  return (
    <GameContainer>
      <Card>
        <Title>Welcome to the Game</Title>
        <Button onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </Button>
      </Card>
    </GameContainer>
  );
}
