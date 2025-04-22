import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';

const LoginContainer = styled.div`
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
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin: 0.5rem 0;
  border: 1px solid #D4AF37;
  background: transparent;
  color: #D4AF37;
  border-radius: 4px;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  background-color: #4A5D23;
  color: #D4AF37;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #5a7028;
  }
`;

const ErrorMessage = styled.div`
  color: #C1292E;
  margin: 1rem 0;
  text-align: center;
`;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e, isLogin = true) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/');
    } catch (err) {
      setError('Failed to ' + (isLogin ? 'log in' : 'sign up') + ': ' + err.message);
    }
    setLoading(false);
  }

  return (
    <LoginContainer>
      <Form onSubmit={(e) => handleSubmit(e, true)}>
        <h2>Soldiers of Wealth</h2>
        {error && <ErrorMessage>{error}</ErrorMessage>}
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
        <Button type="submit" disabled={loading}>
          Login
        </Button>
        <Button type="button" onClick={(e) => handleSubmit(e, false)} disabled={loading}>
          Sign Up
        </Button>
      </Form>
    </LoginContainer>
  );
}
