import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, addDoc, getDoc } from 'firebase/firestore';

const GameRequests = () => {
  const [requests, setRequests] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const db = getFirestore();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'joinRequests'));
      const requestsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequests(requestsData);
    } catch (error) {
      console.error('Error loading game requests:', error);
      showNotification('Failed to load game requests', 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  // Helper function to validate request data before saving
  const validateRequestData = (request) => {
    // Check if all required fields exist
    if (!request.userId || !request.displayName || !request.gameId || !request.gameName) {
      throw new Error('Missing required player information');
    }
    
    return {
      userId: request.userId,
      displayName: request.displayName,
      gameId: request.gameId,
      gameName: request.gameName
    };
  };

  const handleApprove = async (request) => {
    try {
      // Validate request data first
      const validatedData = validateRequestData(request);
      
      // Get the current game document to update player information
      const gameRef = doc(db, 'games', validatedData.gameId);
      
      // Get the existing document to update
      const gameDocSnap = await getDoc(gameRef);
      
      if (!gameDocSnap.exists()) {
        throw new Error(`Game ${validatedData.gameName} no longer exists`);
      }
      
      const gameDoc = gameDocSnap.data();
      
      // Add the player to the game's players array
      const updatedPlayers = [...(gameDoc.players || []), {
        id: validatedData.userId,
        name: validatedData.displayName,
        joinedAt: new Date().toISOString()
      }];
      
      // Update the game document
      await updateDoc(gameRef, {
        players: updatedPlayers,
        lastUpdated: new Date().toISOString(),
        spotsLeft: Math.max(0, (gameDoc.spotsLeft || 0) - 1)
      });

      // Update request status
      const requestRef = doc(db, 'joinRequests', request.id);
      await updateDoc(requestRef, {
        status: 'approved',
        lastUpdated: new Date().toISOString()
      });

      loadRequests();
      showNotification(`Game request from ${validatedData.displayName} approved successfully`);
    } catch (error) {
      console.error('Error approving game request:', error);
      showNotification(`Failed to approve game request: ${error.message}`, 'error');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const requestRef = doc(db, 'joinRequests', requestId);
      const request = requests.find(r => r.id === requestId);
      
      if (!request) {
        throw new Error('Request not found');
      }
      
      await updateDoc(requestRef, {
        status: 'rejected',
        lastUpdated: new Date().toISOString()
      });
      
      loadRequests();
      showNotification(`Game request from ${request.displayName} rejected`);
    } catch (error) {
      console.error('Error rejecting game request:', error);
      showNotification(`Failed to reject game request: ${error.message}`, 'error');
    }
  };

  const handleDelete = async (requestId) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        const request = requests.find(r => r.id === requestId);
        
        if (!request) {
          throw new Error('Request not found');
        }
        
        await deleteDoc(doc(db, 'joinRequests', requestId));
        loadRequests();
        showNotification(`Game request from ${request.displayName} deleted successfully`);
      } catch (error) {
        console.error('Error deleting game request:', error);
        showNotification(`Failed to delete game request: ${error.message}`, 'error');
      }
    }
  };

  return (
    <div className="relative">
      {/* Notification component */}
      {notification.show && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-md shadow-lg transition-all duration-300 ${
          notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {notification.type === 'error' ? '❌' : '✅'}
            </span>
            <p>{notification.message}</p>
            <button 
              onClick={() => setNotification({ show: false, message: '', type: '' })}
              className="ml-4 text-white hover:text-gray-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold mb-6">Game Requests</h2>
      
      {requests.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-lg text-gray-400">No game requests at this time</p>
          <p className="text-sm text-gray-500 mt-2">New requests will appear here when players apply to join games</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-2">Player</th>
                <th className="px-4 py-2">Game</th>
                <th className="px-4 py-2">Request Date</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr key={request.id} className="border-b border-gray-700">
                  <td className="px-4 py-2">
                    <div>
                      <div>{request.displayName}</div>
                      <div className="text-sm text-gray-400">{request.userId}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2">{request.gameName}</td>
                  <td className="px-4 py-2">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded ${
                      request.status === 'pending' ? 'bg-yellow-600' :
                      request.status === 'approved' ? 'bg-green-600' :
                      'bg-red-600'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(request)}
                          className="px-3 py-1 bg-green-600 rounded-md mr-2"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="px-3 py-1 bg-red-600 rounded-md mr-2"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(request.id)}
                      className="px-3 py-1 bg-gray-600 rounded-md"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GameRequests;