import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const GameRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [hasActiveGame, setHasActiveGame] = useState(false);
  const { currentUser } = useAuth();
  const db = getFirestore();

  useEffect(() => {
    const checkActiveGame = async () => {
      try {
        if (!currentUser) {
          setLoading(false);
          return;
        }

        const activeGameQuery = query(
          collection(db, 'games'),
          where('status', '==', 'active'),
          where('players', 'array-contains', currentUser.uid)
        );

        const querySnapshot = await getDocs(activeGameQuery);
        setHasActiveGame(!querySnapshot.empty);
        setLoading(false);
      } catch (error) {
        console.error('Error checking active game:', error);
        setLoading(false);
      }
    };

    checkActiveGame();
  }, [currentUser, db]);

  if (loading) {
    return null; // or a loading spinner
  }

  if (!hasActiveGame) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default GameRoute;
