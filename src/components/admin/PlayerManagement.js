import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const PlayerManagement = () => {
  const [players, setPlayers] = useState([]);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    email: '',
    password: '',
    displayName: '',
    name: '',
    title: 'Recruit',
    soldiers: 100,
    weeklySoldierIncome: 50,
    actionsPerWeek: 3,
    actionsRemaining: 3,
    actions: 3,
    defenseLevel: 1,
    investments: { 
      stocks: 0, 
      realEstate: 0, 
      cash: 100  // Start with all money in cash
    },
    createdAt: new Date().toISOString()
  });

  const db = getFirestore();
  const auth = getAuth();

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
      setPlayers(playersData);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    
    try {
      // Create authentication account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newPlayer.email,
        newPlayer.password
      );

      // Create player document
      const playerData = {
        uid: userCredential.user.uid,
        email: newPlayer.email,
        displayName: newPlayer.displayName,
        title: newPlayer.title,
        soldiers: newPlayer.soldiers,
        actions: newPlayer.actions,
        defenseLevel: newPlayer.defenseLevel,
        investments: newPlayer.investments,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      await addDoc(collection(db, 'players'), playerData);
      setShowCreateForm(false);
      setNewPlayer({
        email: '',
        password: '',
        displayName: '',
        name: '',
        title: 'Recruit',
        soldiers: 100,
        weeklySoldierIncome: 50,
        actionsPerWeek: 3,
        actionsRemaining: 3,
        actions: 3,
        defenseLevel: 1,
        investments: { 
          stocks: 0, 
          realEstate: 0, 
          cash: 100  // Start with all money in cash
        },
        createdAt: new Date().toISOString()
      });
      loadPlayers();
    } catch (error) {
      console.error('Error creating player:', error);
      alert('Error creating player: ' + error.message);
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Player Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-green-600 rounded-md hover:bg-green-700"
        >
          Create New Player
        </button>
      </div>

      {/* Create Player Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Create New Player</h3>
            <form onSubmit={handleCreatePlayer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={newPlayer.email}
                  onChange={(e) => setNewPlayer({...newPlayer, email: e.target.value})}
                  className="w-full bg-gray-700 rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={newPlayer.password}
                  onChange={(e) => setNewPlayer({...newPlayer, password: e.target.value})}
                  className="w-full bg-gray-700 rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Display Name</label>
                <input
                  type="text"
                  value={newPlayer.displayName}
                  onChange={(e) => setNewPlayer({...newPlayer, displayName: e.target.value})}
                  className="w-full bg-gray-700 rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newPlayer.title}
                  onChange={(e) => setNewPlayer({...newPlayer, title: e.target.value})}
                  className="w-full bg-gray-700 rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Initial Soldiers</label>
                <input
                  type="number"
                  value={newPlayer.soldiers}
                  onChange={(e) => setNewPlayer({...newPlayer, soldiers: parseInt(e.target.value)})}
                  className="w-full bg-gray-700 rounded p-2"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Actions</label>
                <input
                  type="number"
                  value={newPlayer.actions}
                  onChange={(e) => setNewPlayer({...newPlayer, actions: parseInt(e.target.value)})}
                  className="w-full bg-gray-700 rounded p-2"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Defense Level</label>
                <input
                  type="number"
                  value={newPlayer.defenseLevel}
                  onChange={(e) => setNewPlayer({...newPlayer, defenseLevel: parseInt(e.target.value)})}
                  className="w-full bg-gray-700 rounded p-2"
                  min="1"
                  required
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white p-2 rounded hover:bg-green-700"
                >
                  Create Player
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-600 text-white p-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Players Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Soldiers</th>
              <th className="px-4 py-2">Actions</th>
              <th className="px-4 py-2">Defense</th>
              <th className="px-4 py-2">Controls</th>
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
                        value={editingPlayer.displayName}
                        onChange={(e) => setEditingPlayer({...editingPlayer, displayName: e.target.value})}
                        className="bg-gray-700 px-2 py-1 rounded w-full"
                      />
                    </td>
                    <td className="px-4 py-2">{player.email}</td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={editingPlayer.title}
                        onChange={(e) => setEditingPlayer({...editingPlayer, title: e.target.value})}
                        className="bg-gray-700 px-2 py-1 rounded w-full"
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
                        value={editingPlayer.actions}
                        onChange={(e) => setEditingPlayer({...editingPlayer, actions: parseInt(e.target.value)})}
                        className="bg-gray-700 px-2 py-1 rounded w-20"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={editingPlayer.defenseLevel}
                        onChange={(e) => setEditingPlayer({...editingPlayer, defenseLevel: parseInt(e.target.value)})}
                        className="bg-gray-700 px-2 py-1 rounded w-20"
                      />
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
                    <td className="px-4 py-2">{player.displayName}</td>
                    <td className="px-4 py-2">{player.email}</td>
                    <td className="px-4 py-2">{player.title}</td>
                    <td className="px-4 py-2">{player.soldiers}</td>
                    <td className="px-4 py-2">{player.actions}</td>
                    <td className="px-4 py-2">{player.defenseLevel}</td>
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
