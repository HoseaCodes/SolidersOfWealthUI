import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';

const GameRequests = () => {
  const [requests, setRequests] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'gameRequests'));
      const requestsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequests(requestsData);
    } catch (error) {
      console.error('Error loading game requests:', error);
    }
  };

  const handleApprove = async (request) => {
    try {
      // Create new game
      const gameData = {
        players: [
          { id: request.fromPlayerId, name: request.fromPlayerName },
          { id: request.toPlayerId, name: request.toPlayerName }
        ],
        status: 'active',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      // Add game to games collection
      await addDoc(collection(db, 'games'), gameData);

      // Update request status
      const requestRef = doc(db, 'gameRequests', request.id);
      await updateDoc(requestRef, {
        status: 'approved',
        lastUpdated: new Date().toISOString()
      });

      loadRequests();
    } catch (error) {
      console.error('Error approving game request:', error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      const requestRef = doc(db, 'gameRequests', requestId);
      await updateDoc(requestRef, {
        status: 'rejected',
        lastUpdated: new Date().toISOString()
      });
      loadRequests();
    } catch (error) {
      console.error('Error rejecting game request:', error);
    }
  };

  const handleDelete = async (requestId) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await deleteDoc(doc(db, 'gameRequests', requestId));
        loadRequests();
      } catch (error) {
        console.error('Error deleting game request:', error);
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Game Requests</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-4 py-2">From Player</th>
              <th className="px-4 py-2">To Player</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Created At</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(request => (
              <tr key={request.id} className="border-b border-gray-700">
                <td className="px-4 py-2">{request.fromPlayerName}</td>
                <td className="px-4 py-2">{request.toPlayerName}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded ${
                    request.status === 'pending' ? 'bg-yellow-600' :
                    request.status === 'approved' ? 'bg-green-600' :
                    'bg-red-600'
                  }`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-4 py-2">{new Date(request.createdAt).toLocaleString()}</td>
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
    </div>
  );
};

export default GameRequests;
