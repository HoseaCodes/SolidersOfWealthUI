import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

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
      cash: 100
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newPlayer.email,
        newPlayer.password
      );

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
          cash: 100
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl font-bold">Player Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full sm:w-auto px-4 py-2 bg-green-600 rounded-md hover:bg-green-700 text-white text-center"
        >
          Create New Player
        </button>
      </div>

      {/* Players List */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-gray-700 rounded-lg">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Player</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Soldiers</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {players.map(player => (
                  <tr key={player.id} className="hover:bg-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="font-medium text-white">{player.displayName}</div>
                        <div className="text-sm text-gray-400">{player.email}</div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 whitespace-nowrap text-gray-300">{player.title}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-300">{player.soldiers}</td>
                    <td className="hidden sm:table-cell px-4 py-3 whitespace-nowrap text-gray-300">{player.actionsRemaining}/{player.actionsPerWeek}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(player)}
                        className="text-blue-400 hover:text-blue-300 mr-3"
                      >
                        <FaEdit className="inline-block" />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(player.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FaTrash className="inline-block" />
                        <span className="sr-only">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateForm || editingPlayer) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingPlayer ? 'Edit Player' : 'Create New Player'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingPlayer(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleCreatePlayer} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={editingPlayer?.email || newPlayer.email}
                    onChange={(e) => editingPlayer 
                      ? setEditingPlayer({...editingPlayer, email: e.target.value})
                      : setNewPlayer({...newPlayer, email: e.target.value})
                    }
                    className="w-full bg-gray-700 rounded p-2 text-white"
                    required
                  />
                </div>

                {!editingPlayer && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                      type="password"
                      value={newPlayer.password}
                      onChange={(e) => setNewPlayer({...newPlayer, password: e.target.value})}
                      className="w-full bg-gray-700 rounded p-2 text-white"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Display Name</label>
                  <input
                    type="text"
                    value={editingPlayer?.displayName || newPlayer.displayName}
                    onChange={(e) => editingPlayer
                      ? setEditingPlayer({...editingPlayer, displayName: e.target.value})
                      : setNewPlayer({...newPlayer, displayName: e.target.value})
                    }
                    className="w-full bg-gray-700 rounded p-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={editingPlayer?.title || newPlayer.title}
                    onChange={(e) => editingPlayer
                      ? setEditingPlayer({...editingPlayer, title: e.target.value})
                      : setNewPlayer({...newPlayer, title: e.target.value})
                    }
                    className="w-full bg-gray-700 rounded p-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Soldiers</label>
                  <input
                    type="number"
                    value={editingPlayer?.soldiers || newPlayer.soldiers}
                    onChange={(e) => editingPlayer
                      ? setEditingPlayer({...editingPlayer, soldiers: parseInt(e.target.value)})
                      : setNewPlayer({...newPlayer, soldiers: parseInt(e.target.value)})
                    }
                    className="w-full bg-gray-700 rounded p-2 text-white"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingPlayer(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingPlayer ? 'Save Changes' : 'Create Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerManagement;
