import React, { useState, useEffect } from 'react';
import { FaBook, FaChartLine, FaShieldAlt, FaUsers, FaLightbulb, FaTrophy, FaLock, FaPlus } from 'react-icons/fa';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { initializeTrainings } from '../../utils/initializeTrainings';
import { useAdmin } from '../../hooks/useAdmin';

const Training = () => {
  const [trainings, setTrainings] = useState([]);
  const [userTrainings, setUserTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { isAdmin } = useAdmin();
  const db = getFirestore();

  const icons = {
    FaBook,
    FaChartLine,
    FaShieldAlt,
    FaUsers
  };

  useEffect(() => {
    // Fetch all available trainings
    const trainingsQuery = query(collection(db, 'trainings'), where('active', '==', true));
    
    const unsubscribeTrainings = onSnapshot(trainingsQuery, (snapshot) => {
      const trainingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        icon: icons[doc.data().iconName] || FaBook
      }));
      setTrainings(trainingsData);
    });

    // Fetch user's assigned trainings and progress
    const fetchUserTrainings = async () => {
      try {
        const userTrainingRef = doc(db, 'user_trainings', currentUser.uid);
        const userTrainingDoc = await getDoc(userTrainingRef);
        
        if (userTrainingDoc.exists()) {
          setUserTrainings(userTrainingDoc.data().trainings || []);
        } else {
          // Initialize user training document
          await setDoc(userTrainingRef, { trainings: [] });
          setUserTrainings([]);
        }
      } catch (error) {
        console.error('Error fetching user trainings:', error);
        toast.error('Failed to load your training progress');
      }
    };

    fetchUserTrainings();
    setLoading(false);

    return () => unsubscribeTrainings();
  }, [currentUser, db]);

  const handleAssignTraining = async (trainingId) => {
    try {
      const userTrainingRef = doc(db, 'user_trainings', currentUser.uid);
      const userTrainingDoc = await getDoc(userTrainingRef);
      
      const updatedTrainings = [
        ...(userTrainingDoc.data()?.trainings || []),
        {
          id: trainingId,
          progress: 0,
          completed: false,
          startedAt: new Date().toISOString()
        }
      ];

      await updateDoc(userTrainingRef, {
        trainings: updatedTrainings
      });

      toast.success('Training assigned successfully!');
    } catch (error) {
      console.error('Error assigning training:', error);
      toast.error('Failed to assign training');
    }
  };

  const handleContinueTraining = async (trainingId) => {
    try {
      const userTrainingRef = doc(db, 'user_trainings', currentUser.uid);
      const training = userTrainings.find(t => t.id === trainingId);
      
      if (!training) return;

      const progress = Math.min(training.progress + 25, 100);
      const completed = progress === 100;

      const updatedTrainings = userTrainings.map(t => 
        t.id === trainingId 
          ? { ...t, progress, completed }
          : t
      );

      await updateDoc(userTrainingRef, {
        trainings: updatedTrainings
      });

      if (completed) {
        toast.success('Training completed! Well done, Commander!');
      } else {
        toast.success('Progress updated!');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const handleInitializeTrainings = async () => {
    const success = await initializeTrainings();
    if (success) {
      toast.success('Training modules initialized successfully!');
    } else {
      toast.error('Failed to initialize training modules');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 text-white p-6 rounded-lg">
        <div className="text-center">Loading training modules...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold military-header">TRAINING ACADEMY</h2>
        {isAdmin && trainings.length === 0 && (
          <button
            onClick={handleInitializeTrainings}
            className="button-military px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FaPlus />
            <span>INITIALIZE TRAININGS</span>
          </button>
        )}
      </div>
      
      {trainings.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          {isAdmin 
            ? "No training modules found. Click 'Initialize Trainings' to create them."
            : "No training modules available at this time. Please check back later."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trainings.map(training => {
              const userTraining = userTrainings.find(t => t.id === training.id);
              const isAssigned = !!userTraining;
              const previousTraining = training.prerequisiteId && 
                userTrainings.find(t => t.id === training.prerequisiteId);
              const isLocked = training.prerequisiteId && 
                (!previousTraining || !previousTraining.completed);

              return (
                <div key={training.id} className="game-card p-6 rounded-lg border border-gray-700 relative">
                  {isLocked && (
                    <div className="absolute inset-0 bg-black bg-opacity-75 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <FaLock className="text-4xl text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400">Complete previous training to unlock</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center mb-4">
                    <training.icon className="text-2xl text-green-500 mr-3" />
                    <h3 className="text-xl font-bold">{training.title}</h3>
                  </div>
                  
                  <p className="text-gray-400 mb-4">{training.description}</p>
                  
                  {isAssigned && (
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-green-200 text-green-900">
                            Progress
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-green-500">
                            {userTraining.progress}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                        <div 
                          style={{ width: `${userTraining.progress}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-300"
                        />
                      </div>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => isAssigned 
                      ? handleContinueTraining(training.id)
                      : handleAssignTraining(training.id)
                    }
                    className={`w-full py-2 px-4 rounded transition-colors ${
                      isLocked
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : userTraining?.completed
                        ? 'button-military bg-green-600'
                        : 'button-military'
                    }`}
                    disabled={isLocked}
                  >
                    {isLocked ? 'LOCKED' 
                      : userTraining?.completed ? 'COMPLETED'
                      : isAssigned ? 'CONTINUE TRAINING'
                      : 'START TRAINING'}
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 game-card p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FaLightbulb className="text-2xl text-yellow-500 mr-3" />
                <h3 className="text-xl font-bold military-header">TRAINING TIPS</h3>
              </div>
              <FaTrophy className="text-2xl text-yellow-500" />
            </div>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li>Complete all basic training modules before entering combat</li>
              <li>Practice market analysis in simulation mode</li>
              <li>Join an alliance to unlock advanced training modules</li>
              <li>Review defense tactics regularly to stay ahead</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default Training;
