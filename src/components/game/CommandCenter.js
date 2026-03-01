import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useEconomic } from '../../contexts/EconomicContext';
import ResponsiveNavbar from './Navbar';
import WeeklyMovesDashboard from './WeeklyMovesDashboard';
import { validateAction } from '../../utils';
import EconomicStatusAlert from './EconomicStatusAlert';
import { marketStatus } from '../../constants';
import { toast } from 'react-toastify';

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="error-container">
    <h2>Something went wrong:</h2>
    <pre>{error.message}</pre>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);

function CommandCenter() {
  const { gameId } = useParams();
  const { currentUser } = useAuth();
  const { currentCycle } = useEconomic();
  const db = getFirestore();

  // State Management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [soldiers, setSoldiers] = useState(0);
  const [actionsRemaining, setActionsRemaining] = useState(3);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [weeklyMoves, setWeeklyMoves] = useState([]);
  const [weeklyIntelligence, setWeeklyIntelligence] = useState([]);
  const [movesSubmitted, setMovesSubmitted] = useState(false);
  const [isEditingMoves, setIsEditingMoves] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const playerDoc = await getDoc(doc(db, 'games', gameId, 'players', currentUser.uid));
        if (playerDoc.exists()) {
          const data = playerDoc.data();
          setSoldiers(data.soldiers || 0);
          setActionsRemaining(data.actionsRemaining || 3);
          setCurrentWeek(data.currentWeek || 1);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [db, gameId, currentUser]);

  // Add weekly move
  const addWeeklyMove = useCallback((move) => {
    if (actionsRemaining > 0) {
      setWeeklyMoves(prev => [...prev, move]);
      setActionsRemaining(prev => prev - 1);
      setSuccessMessage('Move added successfully');
    } else {
      setErrorMessage('No actions remaining');
    }
  }, [actionsRemaining]);

  // Submit weekly moves
  const submitWeeklyMoves = useCallback(async () => {
    try {
      if (weeklyMoves.length === 0) {
        setErrorMessage('You must select at least one move');
        return false;
      }

      const batch = writeBatch(db);
      const weeklyMovesRef = doc(collection(db, 'games', gameId, 'weeklyMoves'));

      batch.set(weeklyMovesRef, {
        playerId: currentUser.uid,
        week: currentWeek,
        moves: weeklyMoves,
        timestamp: serverTimestamp()
      });

      await batch.commit();
      setMovesSubmitted(true);
      setSuccessMessage('Moves submitted successfully');
      return true;
    } catch (error) {
      console.error('Error submitting moves:', error);
      setErrorMessage('Failed to submit moves');
      return false;
    }
  }, [currentUser?.uid, currentWeek, db, gameId, weeklyMoves]);

  // Reset weekly moves
  const resetWeeklyMoves = useCallback(() => {
    setWeeklyMoves([]);
    setMovesSubmitted(false);
    setActionsRemaining(3);
    setSuccessMessage('Moves reset successfully');
  }, []);

  // Edit weekly moves
  const startEditingMoves = useCallback(() => {
    setIsEditingMoves(true);
  }, []);

  const stopEditingMoves = useCallback(() => {
    setIsEditingMoves(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-red-500 text-xl">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <section id="command-center" className="p-6 mb-16">
        <div className="max-w-6xl mx-auto bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
          <ResponsiveNavbar />

          {/* Game Status */}
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Week {currentWeek}</h2>
              <div className="text-gray-300">
                Soldiers: {soldiers} | Actions Remaining: {actionsRemaining}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-900 text-white px-6 py-4 rounded-lg mb-6 flex justify-between items-center">
                <span>{errorMessage}</span>
                <button 
                  onClick={() => setErrorMessage('')}
                  className="text-white hover:text-red-200"
                >
                  ×
                </button>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-900 text-white px-6 py-4 rounded-lg mb-6 flex justify-between items-center">
                <span>{successMessage}</span>
                <button 
                  onClick={() => setSuccessMessage('')}
                  className="text-white hover:text-green-200"
                >
                  ×
                </button>
              </div>
            )}

            {/* Weekly Moves Dashboard */}
            <WeeklyMovesDashboard
              weeklyMoves={weeklyMoves}
              actionsRemaining={actionsRemaining}
              isEditingMoves={isEditingMoves}
              movesSubmitted={movesSubmitted}
              onAddMove={addWeeklyMove}
              onSubmit={submitWeeklyMoves}
              onReset={resetWeeklyMoves}
              onStartEditing={startEditingMoves}
              onStopEditing={stopEditingMoves}
            />

            {/* Market Status */}
            <EconomicStatusAlert marketStatus={marketStatus} />
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}

export default CommandCenter;