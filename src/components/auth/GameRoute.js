import React, { useState, useEffect } from 'react';
import { Navigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const GameRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const { currentUser } = useAuth();
  const { gameId } = useParams();
  const location = useLocation(); // Get current location
  const db = getFirestore();

  useEffect(() => {
    const checkGameAccess = async () => {
      try {
        const debug = {
          userId: currentUser?.uid,
          gameId,
          path: location.pathname,
          timestamp: new Date().toISOString()
        };
        
        console.log("DEBUG - GameRoute Check:", debug);
        
        if (!currentUser || !gameId) {
          console.log("DEBUG - Missing user or gameId:", { user: !!currentUser, gameId });
          setDebugInfo({ ...debug, error: "Missing user or gameId" });
          setLoading(false);
          return;
        }

        // First, try to get the specific game by ID
        const gameDocRef = doc(db, 'games', gameId);
        const gameDoc = await getDoc(gameDocRef);
        
        if (!gameDoc.exists()) {
          console.log(`DEBUG - Game document not found: ${gameId}`);
          setDebugInfo({ ...debug, error: "Game not found" });
          setHasAccess(false);
          setLoading(false);
          return;
        }
        
        const gameData = gameDoc.data();
        console.log("DEBUG - Game data:", gameData);
        debug.gameData = {
          status: gameData.status,
          playersCount: gameData.players ? gameData.players.length : 0,
          playersType: gameData.players ? typeof gameData.players : "undefined"
        };
        
        // Check if the game is active
        const isActive = gameData.status === 'active';
        debug.isActive = isActive;
        
        // Check if the user is in the game's players
        let isPlayerInGame = false;
        
        if (gameData.players) {
          if (Array.isArray(gameData.players)) {
            // Check for players as strings
            const playerAsString = gameData.players.includes(currentUser.uid);
            
            // Check for players as objects
            const playerAsObject = gameData.players.some(player => 
              typeof player === 'object' && 
              player !== null && 
              (player.id === currentUser.uid || player.userId === currentUser.uid)
            );
            
            isPlayerInGame = playerAsString || playerAsObject;
            
            debug.playerCheck = {
              playerAsString,
              playerAsObject,
              playerFound: isPlayerInGame,
              playersArray: gameData.players.map(p => 
                typeof p === 'string' ? p : (p.id || p.userId || 'unknown')
              )
            };
          } else {
            console.log("DEBUG - Players is not an array:", gameData.players);
            debug.playerCheck = { error: "Players is not an array" };
          }
        } else {
          console.log("DEBUG - No players field in game data");
          debug.playerCheck = { error: "No players field" };
        }
        
        // Check if the user has an approved request for this game
        let hasApprovedRequest = false;
        
        try {
          // First check by direct query
          const joinRequestsQuery = query(
            collection(db, 'joinRequests'),
            where('userId', '==', currentUser.uid),
            where('gameId', '==', gameId),
            where('status', '==', 'approved')
          );
          
          const requestsSnapshot = await getDocs(joinRequestsQuery);
          hasApprovedRequest = !requestsSnapshot.empty;
          
          // If that fails, try getting all requests for the user and check manually
          if (!hasApprovedRequest) {
            const allUserRequestsQuery = query(
              collection(db, 'joinRequests'),
              where('userId', '==', currentUser.uid)
            );
            
            const allRequestsSnapshot = await getDocs(allUserRequestsQuery);
            const requests = [];
            
            allRequestsSnapshot.forEach(doc => {
              const data = doc.data();
              requests.push({
                id: doc.id,
                ...data
              });
              
              // Check if any match our criteria
              if (data.gameId === gameId && data.status === 'approved') {
                hasApprovedRequest = true;
              }
            });
            
            debug.allRequests = requests;
          }
        } catch (error) {
          console.error("Error checking requests:", error);
          debug.requestError = error.message;
        }
        
        debug.hasApprovedRequest = hasApprovedRequest;
        
        // Allow access if:
        // 1. Game is active AND (user is a player OR has approved request)
        // OR
        // 2. Game has any status but user is definitely a player
        const accessGranted = (isActive && (isPlayerInGame || hasApprovedRequest)) || isPlayerInGame;
        
        console.log("DEBUG - Access check:", {
          isActive,
          isPlayerInGame,
          hasApprovedRequest,
          accessGranted
        });
        
        debug.accessGranted = accessGranted;
        
        setDebugInfo(debug);
        setHasAccess(accessGranted);
        setLoading(false);
      } catch (error) {
        console.error('ERROR in GameRoute:', error);
        setDebugInfo({
          error: error.message,
          stack: error.stack
        });
        setLoading(false);
      }
    };

    checkGameAccess();
  }, [currentUser, gameId, db, location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a2639] flex items-center justify-center flex-col">
        <div className="text-white text-xl mb-4">Loading battle data...</div>
        <div className="bg-gray-800 p-4 rounded-lg w-full max-w-3xl">
          <pre className="text-xs text-gray-400 overflow-auto max-h-32">
            {JSON.stringify({gameId, path: location.pathname}, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    // Add debug display before redirect
    console.log("DEBUG - Redirecting to dashboard. Debug info:", debugInfo);
    
    // In development, show debug info instead of redirecting
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="min-h-screen bg-[#1a2639] text-white p-6">
          <h1 className="text-2xl mb-4">Access Denied - Debug Info</h1>
          <p className="mb-4">You don't have access to this battle. Here's why:</p>
          
          <div className="bg-gray-800 p-4 rounded-lg overflow-auto max-h-screen">
            <pre className="text-xs text-gray-400">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
          
          <div className="mt-6">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }
    
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default GameRoute;