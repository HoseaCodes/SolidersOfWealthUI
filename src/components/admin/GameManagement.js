import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';

const GameManagement = () => {
  const [games, setGames] = useState([]);
  const [editingGame, setEditingGame] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGame, setNewGame] = useState({
    name: '',
    startDate: '',
    endDate: '',
    maxSpots: 50,
    difficulty: 'Beginner',
    difficultyLevel: 1,
    entryFee: 100,
    reward: 1000,
    status: 'upcoming'
  });
  
  const db = getFirestore();

  const difficultyOptions = [
    { name: 'Beginner', level: 1 },
    { name: 'Intermediate', level: 2 },
    { name: 'Advanced', level: 3 },
    { name: 'Expert', level: 4 }
  ];

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'games'));
      const gamesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // const games = [{
      //   id: 'season1',
      //   name: 'SEASON 1: MARKET WARFARE',
      //   startDate: '2025-04-23T00:00:00-05:00',
      //   endDate: '2025-05-23T00:00:00-05:00',
      //   maxSpots: 50,
      //   spotsLeft: 20,
      //   commandersEnlisted: 24,
      //   difficulty: 'Beginner',
      //   difficultyLevel: 2,
      //   entryFee: 100,
      //   reward: 1000,
      //   status: 'upcoming',
      //   players: []
      // }];
      // setGames(games);
      setGames(gamesData);
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const handleCreateGame = async (e) => {
    e.preventDefault();
    
    try {
      const gameData = {
        ...newGame,
        spotsLeft: newGame.maxSpots,
        commandersEnlisted: 0,
        players: [],
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      await addDoc(collection(db, 'games'), gameData);
      setShowCreateForm(false);
      setNewGame({
        name: '',
        startDate: '',
        endDate: '',
        maxSpots: 50,
        difficulty: 'Beginner',
        difficultyLevel: 1,
        entryFee: 100,
        reward: 1000,
        status: 'upcoming'
      });
      loadGames();
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const handleEdit = (game) => {
    setEditingGame({ ...game });
  };

  const handleSave = async () => {
    try {
      const gameRef = doc(db, 'games', editingGame.id);
      await updateDoc(gameRef, {
        ...editingGame,
        lastUpdated: new Date().toISOString()
      });
      setEditingGame(null);
      loadGames();
    } catch (error) {
      console.error('Error updating game:', error);
    }
  };

  const handleDelete = async (gameId) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        await deleteDoc(doc(db, 'games', gameId));
        loadGames();
      } catch (error) {
        console.error('Error deleting game:', error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Game Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-green-600 rounded-md hover:bg-green-700"
        >
          Create New Season
        </button>
      </div>

      {/* Create Game Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Create New Season</h3>
            <form onSubmit={handleCreateGame} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Season Name</label>
                <input
                  type="text"
                  value={newGame.name}
                  onChange={(e) => setNewGame({...newGame, name: e.target.value})}
                  className="w-full bg-gray-700 rounded p-2"
                  placeholder="SEASON X: EPIC TITLE"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="datetime-local"
                  value={newGame.startDate}
                  onChange={(e) => setNewGame({...newGame, startDate: e.target.value})}
                  className="w-full bg-gray-700 rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="datetime-local"
                  value={newGame.endDate}
                  onChange={(e) => setNewGame({...newGame, endDate: e.target.value})}
                  className="w-full bg-gray-700 rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Maximum Spots</label>
                <input
                  type="number"
                  value={newGame.maxSpots}
                  onChange={(e) => setNewGame({...newGame, maxSpots: parseInt(e.target.value)})}
                  className="w-full bg-gray-700 rounded p-2"
                  min="2"
                  max="100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select
                  value={newGame.difficulty}
                  onChange={(e) => {
                    const difficulty = difficultyOptions.find(d => d.name === e.target.value);
                    setNewGame({
                      ...newGame,
                      difficulty: difficulty.name,
                      difficultyLevel: difficulty.level
                    });
                  }}
                  className="w-full bg-gray-700 rounded p-2"
                  required
                >
                  {difficultyOptions.map(option => (
                    <option key={option.name} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Entry Fee</label>
                <input
                  type="number"
                  value={newGame.entryFee}
                  onChange={(e) => setNewGame({...newGame, entryFee: parseInt(e.target.value)})}
                  className="w-full bg-gray-700 rounded p-2"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reward</label>
                <input
                  type="number"
                  value={newGame.reward}
                  onChange={(e) => setNewGame({...newGame, reward: parseInt(e.target.value)})}
                  className="w-full bg-gray-700 rounded p-2"
                  min="0"
                  required
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white p-2 rounded hover:bg-green-700"
                >
                  Create Season
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
      
      {/* Games Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-4 py-2">Season</th>
              <th className="px-4 py-2">Dates</th>
              <th className="px-4 py-2">Players</th>
              <th className="px-4 py-2">Difficulty</th>
              <th className="px-4 py-2">Entry/Reward</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.map(game => (
              <tr key={game.id} className="border-b border-gray-700">
                {editingGame?.id === game.id ? (
                  // Edit Mode
                  <>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={editingGame.name}
                        onChange={(e) => setEditingGame({...editingGame, name: e.target.value})}
                        className="bg-gray-700 px-2 py-1 rounded w-full"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="space-y-2">
                        <input
                          type="datetime-local"
                          value={editingGame.startDate}
                          onChange={(e) => setEditingGame({...editingGame, startDate: e.target.value})}
                          className="bg-gray-700 px-2 py-1 rounded w-full"
                        />
                        <input
                          type="datetime-local"
                          value={editingGame.endDate}
                          onChange={(e) => setEditingGame({...editingGame, endDate: e.target.value})}
                          className="bg-gray-700 px-2 py-1 rounded w-full"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      {editingGame.commandersEnlisted}/{editingGame.maxSpots}
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={editingGame.difficulty}
                        onChange={(e) => {
                          const difficulty = difficultyOptions.find(d => d.name === e.target.value);
                          setEditingGame({
                            ...editingGame,
                            difficulty: difficulty.name,
                            difficultyLevel: difficulty.level
                          });
                        }}
                        className="bg-gray-700 px-2 py-1 rounded"
                      >
                        {difficultyOptions.map(option => (
                          <option key={option.name} value={option.name}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <div className="space-y-2">
                        <input
                          type="number"
                          value={editingGame.entryFee}
                          onChange={(e) => setEditingGame({...editingGame, entryFee: parseInt(e.target.value)})}
                          className="bg-gray-700 px-2 py-1 rounded w-20"
                        />
                        <input
                          type="number"
                          value={editingGame.reward}
                          onChange={(e) => setEditingGame({...editingGame, reward: parseInt(e.target.value)})}
                          className="bg-gray-700 px-2 py-1 rounded w-20"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={editingGame.status}
                        onChange={(e) => setEditingGame({...editingGame, status: e.target.value})}
                        className="bg-gray-700 px-2 py-1 rounded"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={handleSave}
                        className="px-3 py-1 bg-green-600 rounded-md mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingGame(null)}
                        className="px-3 py-1 bg-gray-600 rounded-md"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  // View Mode
                  <>
                    <td className="px-4 py-2">{game.name}</td>
                    <td className="px-4 py-2">
                      <div className="space-y-1">
                        <div>Start: {new Date(game.startDate).toLocaleDateString()}</div>
                        <div>End: {new Date(game.endDate).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      {game.commandersEnlisted}/{game.maxSpots}
                      <div className="text-sm text-gray-400">{game.spotsLeft} spots left</div>
                    </td>
                    <td className="px-4 py-2">
                      {game.difficulty}
                      <div className="text-sm text-gray-400">Level {game.difficultyLevel}</div>
                    </td>
                    <td className="px-4 py-2">
                      <div>Entry: ${game.entryFee}</div>
                      <div>Reward: ${game.reward}</div>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded ${
                        game.status === 'upcoming' ? 'bg-yellow-600' :
                        game.status === 'active' ? 'bg-green-600' :
                        game.status === 'completed' ? 'bg-blue-600' :
                        'bg-red-600'
                      }`}>
                        {game.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEdit(game)}
                        className="px-3 py-1 bg-blue-600 rounded-md mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(game.id)}
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

export default GameManagement;
