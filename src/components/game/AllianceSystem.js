import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const AllianceSystem = ({ gameId }) => {
  const [alliances, setAlliances] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const db = getFirestore();

  useEffect(() => {
    loadAlliances();
    loadPlayers();
  }, [gameId]);

  const loadAlliances = async () => {
    try {
      const alliancesRef = collection(db, 'games', gameId, 'alliances');
      const alliancesSnap = await getDocs(alliancesRef);
      const alliancesData = alliancesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAlliances(alliancesData);
    } catch (error) {
      console.error('Error loading alliances:', error);
      toast.error('Failed to load alliances');
    }
  };

  const loadPlayers = async () => {
    try {
      const playersRef = collection(db, 'games', gameId, 'players');
      const playersSnap = await getDocs(playersRef);
      const playersData = playersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlayers(playersData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading players:', error);
      toast.error('Failed to load players');
      setLoading(false);
    }
  };

  const createAlliance = async (name, description) => {
    try {
      const allianceData = {
        name,
        description,
        leader: currentUser.uid,
        members: [currentUser.uid],
        resources: {
          soldiers: 0,
          gold: 0
        },
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'games', gameId, 'alliances'), allianceData);
      toast.success('Alliance created successfully');
      loadAlliances();
    } catch (error) {
      console.error('Error creating alliance:', error);
      toast.error('Failed to create alliance');
    }
  };

  const joinAlliance = async (allianceId) => {
    try {
      const allianceRef = doc(db, 'games', gameId, 'alliances', allianceId);
      await updateDoc(allianceRef, {
        members: [...alliance.members, currentUser.uid]
      });
      toast.success('Joined alliance successfully');
      loadAlliances();
    } catch (error) {
      console.error('Error joining alliance:', error);
      toast.error('Failed to join alliance');
    }
  };

  const shareResources = async (allianceId, resources) => {
    try {
      const allianceRef = doc(db, 'games', gameId, 'alliances', allianceId);
      await updateDoc(allianceRef, {
        resources: {
          soldiers: resources.soldiers,
          gold: resources.gold
        }
      });
      toast.success('Resources shared successfully');
      loadAlliances();
    } catch (error) {
      console.error('Error sharing resources:', error);
      toast.error('Failed to share resources');
    }
  };

  if (loading) {
    return <div>Loading alliances...</div>;
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Alliances</h2>
      
      {/* Create Alliance Form */}
      <div className="mb-8 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Create New Alliance</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          createAlliance(e.target.name.value, e.target.description.value);
        }}>
          <input
            type="text"
            name="name"
            placeholder="Alliance Name"
            className="w-full p-2 mb-4 bg-gray-600 rounded"
          />
          <textarea
            name="description"
            placeholder="Alliance Description"
            className="w-full p-2 mb-4 bg-gray-600 rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Alliance
          </button>
        </form>
      </div>

      {/* Alliances List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {alliances.map(alliance => (
          <div key={alliance.id} className="p-4 bg-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">{alliance.name}</h3>
            <p className="text-gray-400 mb-4">{alliance.description}</p>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Resources</h4>
              <div className="flex space-x-4">
                <div>Soldiers: {alliance.resources.soldiers}</div>
                <div>Gold: {alliance.resources.gold}</div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Members</h4>
              <div className="flex flex-wrap gap-2">
                {alliance.members.map(memberId => {
                  const player = players.find(p => p.id === memberId);
                  return (
                    <div key={memberId} className="px-2 py-1 bg-gray-600 rounded">
                      {player?.displayName || 'Unknown Player'}
                    </div>
                  );
                })}
              </div>
            </div>

            {!alliance.members.includes(currentUser.uid) && (
              <button
                onClick={() => joinAlliance(alliance.id)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Join Alliance
              </button>
            )}

            {alliance.members.includes(currentUser.uid) && (
              <button
                onClick={() => shareResources(alliance.id, {
                  soldiers: 10,
                  gold: 100
                })}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Share Resources
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllianceSystem;
