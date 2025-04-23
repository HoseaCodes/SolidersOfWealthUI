import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const PlayerManagement = () => {
  const [players, setPlayers] = useState([]);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'players'));
      const playersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      const players = [{
        id: '1',
        name: 'Player 1',
        title: 'Commander',
        soldiers: 100,
        actionsRemaining: 3,
        defense: 'Strong',
        investments: { stocks: 0, realEstate: 0, cash: 100 },
        isYou: true
      }]
      setPlayers(players);
      // setPlayers(playersData);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const handleEdit = (player) => {
    setEditingPlayer({ ...player });
  };

  const handleSave = async () => {
    try {
      const playerRef = doc(db, 'players', editingPlayer.id);
      await updateDoc(playerRef, {
        ...editingPlayer,
        lastUpdated: new Date().toISOString()
      });
      setEditingPlayer(null);
      loadPlayers();
    } catch (error) {
      console.error('Error updating player:', error);
    }
  };

  const handleDelete = async (playerId) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        await deleteDoc(doc(db, 'players', playerId));
        loadPlayers();
      } catch (error) {
        console.error('Error deleting player:', error);
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Player Management</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Soldiers</th>
              <th className="px-4 py-2">Actions</th>
              <th className="px-4 py-2">Defense</th>
              <th className="px-4 py-2">Investments</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map(player => (
              <tr key={player.id} className="border-b border-gray-700">
                {editingPlayer?.id === player.id ? (
                  // Edit Mode
                  <>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={editingPlayer.name}
                        onChange={(e) => setEditingPlayer({...editingPlayer, name: e.target.value})}
                        className="bg-gray-700 px-2 py-1 rounded"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={editingPlayer.title}
                        onChange={(e) => setEditingPlayer({...editingPlayer, title: e.target.value})}
                        className="bg-gray-700 px-2 py-1 rounded"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={editingPlayer.soldiers}
                        onChange={(e) => setEditingPlayer({...editingPlayer, soldiers: parseInt(e.target.value)})}
                        className="bg-gray-700 px-2 py-1 rounded w-20"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={editingPlayer.actionsRemaining}
                        onChange={(e) => setEditingPlayer({...editingPlayer, actionsRemaining: parseInt(e.target.value)})}
                        className="bg-gray-700 px-2 py-1 rounded w-20"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={editingPlayer.defense}
                        onChange={(e) => setEditingPlayer({...editingPlayer, defense: e.target.value})}
                        className="bg-gray-700 px-2 py-1 rounded"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="space-y-1">
                        {Object.entries(editingPlayer.investments).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <span className="capitalize">{key}:</span>
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => setEditingPlayer({
                                ...editingPlayer,
                                investments: {
                                  ...editingPlayer.investments,
                                  [key]: parseInt(e.target.value)
                                }
                              })}
                              className="bg-gray-700 px-2 py-1 rounded w-20"
                            />
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={handleSave}
                        className="px-3 py-1 bg-green-600 rounded-md mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingPlayer(null)}
                        className="px-3 py-1 bg-gray-600 rounded-md"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  // View Mode
                  <>
                    <td className="px-4 py-2">{player.name}</td>
                    <td className="px-4 py-2">{player.title}</td>
                    <td className="px-4 py-2">{player.soldiers}</td>
                    <td className="px-4 py-2">{player.actionsRemaining}/{player.actionsPerWeek}</td>
                    <td className="px-4 py-2">{player.defense} ({player.defenseLevel})</td>
                    <td className="px-4 py-2">
                      <div className="space-y-1">
                        {Object.entries(player.investments).map(([key, value]) => (
                          <div key={key}>
                            <span className="capitalize">{key}:</span> {value}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEdit(player)}
                        className="px-3 py-1 bg-blue-600 rounded-md mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(player.id)}
                        className="px-3 py-1 bg-red-600 rounded-md"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayerManagement;
