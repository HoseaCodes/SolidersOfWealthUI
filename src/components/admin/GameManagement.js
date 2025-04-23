import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { useAdmin } from '../../hooks/useAdmin';

const GameManagement = () => {
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  const [pastGames, setPastGames] = useState([]);
  const [players, setPlayers] = useState([]);
  const [editingGame, setEditingGame] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPastGameForm, setShowPastGameForm] = useState(false);
  const [showAssignPlayersForm, setShowAssignPlayersForm] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
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
  const [newPastGame, setNewPastGame] = useState({
    name: '',
    date: '',
    players: 0,
    winner: '',
    image: '',
    status: 'completed'
  });

  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const db = getFirestore();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [adminLoading, isAdmin, navigate]);

  useEffect(() => {
    const init = async () => {
      if (isAdmin) {
        await Promise.all([loadGames(), loadPlayers()]);
        setLoading(false);
      }
    };
    init();
  }, [isAdmin]);

  const difficultyOptions = [
    { name: 'Beginner', level: 1 },
    { name: 'Intermediate', level: 2 },
    { name: 'Advanced', level: 3 },
    { name: 'Expert', level: 4 }
  ];

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

  const loadGames = async () => {
    try {
      // Load active and upcoming games
      const gamesSnapshot = await getDocs(collection(db, 'games'));
      const gamesData = gamesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGames(gamesData);

      // Load past games
      const pastGamesSnapshot = await getDocs(collection(db, 'pastGames'));
      const pastGamesData = pastGamesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPastGames(pastGamesData);
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const handleAssignPlayers = async () => {
    try {
      if (!selectedGame || selectedPlayers.length === 0) {
        alert('Please select a game and at least one player');
        return;
      }

      const gameRef = doc(db, 'games', selectedGame.id);
      const game = games.find(g => g.id === selectedGame.id);

      // Check if there's enough space
      if (selectedPlayers.length > game.spotsLeft) {
        alert(`Cannot add ${selectedPlayers.length} players. Only ${game.spotsLeft} spots left.`);
        return;
      }

      // Get current players array or initialize it
      const currentPlayers = game.players || [];
      
      // Filter out players that are already in the game
      const newPlayers = selectedPlayers.filter(
        playerId => !currentPlayers.includes(playerId)
      );

      if (newPlayers.length === 0) {
        alert('Selected players are already in the game');
        return;
      }

      // Update game document
      await updateDoc(gameRef, {
        players: [...currentPlayers, ...newPlayers],
        spotsLeft: game.spotsLeft - newPlayers.length,
        commandersEnlisted: (game.commandersEnlisted || 0) + newPlayers.length,
        lastUpdated: new Date().toISOString()
      });

      setShowAssignPlayersForm(false);
      setSelectedGame(null);
      setSelectedPlayers([]);
      loadGames();

      alert('Players successfully assigned to the game');
    } catch (error) {
      console.error('Error assigning players:', error);
      alert('Error assigning players to game');
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

  const handleCreatePastGame = async (e) => {
    e.preventDefault();
    
    try {
      const pastGameData = {
        ...newPastGame,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'pastGames'), pastGameData);
      setShowPastGameForm(false);
      setNewPastGame({
        name: '',
        date: '',
        players: 0,
        winner: '',
        image: '',
        status: 'completed'
      });
      loadGames();
    } catch (error) {
      console.error('Error creating past game:', error);
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

  const handleDelete = async (gameId, isPastGame = false) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        const collectionName = isPastGame ? 'pastGames' : 'games';
        await deleteDoc(doc(db, collectionName, gameId));
        loadGames();
      } catch (error) {
        console.error('Error deleting game:', error);
      }
    }
  };

  if (loading || adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-red-500 text-xl font-bold">
          ACCESS DENIED: Administrator privileges required.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Game Management</h2>
        <div className="space-x-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-green-600 rounded-md hover:bg-green-700"
          >
            Create New Season
          </button>
          <button
            onClick={() => setShowPastGameForm(true)}
            className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Add Past Season
          </button>
          <button
            onClick={() => setShowAssignPlayersForm(true)}
            className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700"
          >
            Assign Players
          </button>
        </div>
      </div>

      {/* Create Game Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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

      {/* Create Past Game Form */}
      {showPastGameForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add Past Season</h3>
            <form onSubmit={handleCreatePastGame} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Season Name</label>
                <input
                  type="text"
                  value={newPastGame.name}
                  onChange={(e) => setNewPastGame({...newPastGame, name: e.target.value})}
                  className="w-full bg-gray-700 rounded p-2"
                  placeholder="SEASON X: EPIC TITLE"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="text"
                  value={newPastGame.date}
                  onChange={(e) => setNewPastGame({...newPastGame, date: e.target.value})}
                  className="w-full bg-gray-700 rounded p-2"
                  placeholder="March 2025"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Number of Players</label>
                <input
                  type="number"
                  value={newPastGame.players}
                  onChange={(e) => setNewPastGame({...newPastGame, players: parseInt(e.target.value)})}
                  className="w-full bg-gray-700 rounded p-2"
                  min="2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Winner</label>
                <input
                  type="text"
                  value={newPastGame.winner}
                  onChange={(e) => setNewPastGame({...newPastGame, winner: e.target.value})}
                  className="w-full bg-gray-700 rounded p-2"
                  placeholder="Winner's Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="text"
                  value={newPastGame.image}
                  onChange={(e) => setNewPastGame({...newPastGame, image: e.target.value})}
                  className="w-full bg-gray-700 rounded p-2"
                  placeholder="/images/season_image.jpeg"
                  required
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                  Add Past Season
                </button>
                <button
                  type="button"
                  onClick={() => setShowPastGameForm(false)}
                  className="flex-1 bg-gray-600 text-white p-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Players Form */}
      {showAssignPlayersForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Assign Players to Game</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Game</label>
                <select
                  value={selectedGame?.id || ''}
                  onChange={(e) => setSelectedGame(games.find(g => g.id === e.target.value))}
                  className="w-full bg-gray-700 rounded p-2"
                  required
                >
                  <option value="">Select a game...</option>
                  {games
                    .filter(game => game.status !== 'completed' && game.spotsLeft > 0)
                    .map(game => (
                      <option key={game.id} value={game.id}>
                        {game.name} ({game.spotsLeft} spots left)
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Select Players</label>
                <div className="max-h-60 overflow-y-auto bg-gray-700 rounded p-2">
                  {players
                    .filter(player => !selectedGame?.players?.includes(player.id))
                    .map(player => (
                      <div key={player.id} className="flex items-center space-x-2 p-2">
                        <input
                          type="checkbox"
                          id={player.id}
                          checked={selectedPlayers.includes(player.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPlayers([...selectedPlayers, player.id]);
                            } else {
                              setSelectedPlayers(selectedPlayers.filter(id => id !== player.id));
                            }
                          }}
                          className="form-checkbox h-4 w-4"
                        />
                        <label htmlFor={player.id}>
                          {player.displayName} ({player.email})
                        </label>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAssignPlayers}
                  className="flex-1 bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
                >
                  Assign Players
                </button>
                <button
                  onClick={() => {
                    setShowAssignPlayersForm(false);
                    setSelectedGame(null);
                    setSelectedPlayers([]);
                  }}
                  className="flex-1 bg-gray-600 text-white p-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Active/Upcoming Games Table */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Active & Upcoming Games</h3>
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
                      <div>
                        {editingGame.commandersEnlisted}/{editingGame.maxSpots}
                        <div className="text-sm text-gray-400">
                          {players
                            .filter(p => editingGame.players?.includes(p.id))
                            .map(p => p.displayName)
                            .join(', ')}
                        </div>
                      </div>
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
                      <div>
                        {game.commandersEnlisted || 0}/{game.maxSpots}
                        <div className="text-sm text-gray-400">
                          {players
                            .filter(p => game.players?.includes(p.id))
                            .map(p => p.displayName)
                            .join(', ')}
                        </div>
                      </div>
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

      {/* Past Games Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Past Games</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-2">Season</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Players</th>
                <th className="px-4 py-2">Winner</th>
                <th className="px-4 py-2">Image</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pastGames.map(game => (
                <tr key={game.id} className="border-b border-gray-700">
                  <td className="px-4 py-2">{game.name}</td>
                  <td className="px-4 py-2">{game.date}</td>
                  <td className="px-4 py-2">{game.players}</td>
                  <td className="px-4 py-2">{game.winner}</td>
                  <td className="px-4 py-2">
                    <img 
                      src={game.image} 
                      alt={game.name}
                      className="h-12 w-20 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDelete(game.id, true)}
                      className="px-3 py-1 bg-red-600 rounded-md"
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
    </div>
  );
};

export default GameManagement;
