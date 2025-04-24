import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { FaGraduationCap, FaLock, FaCheckCircle, FaPlayCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const TrainingLibrary = () => {
  const [modules, setModules] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const { currentUser } = useAuth();
  const db = getFirestore();

  // Fetch training modules and user progress
  useEffect(() => {
    const modulesQuery = query(collection(db, 'training_modules'), orderBy('order'));
    
    const unsubscribeModules = onSnapshot(modulesQuery, (snapshot) => {
      const modulesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setModules(modulesData);
    });

    // Fetch user's progress
    const fetchUserProgress = async () => {
      try {
        const progressRef = doc(db, 'user_progress', currentUser.uid);
        const progressDoc = await getDoc(progressRef);
        
        if (!progressDoc.exists()) {
          // Initialize progress document if it doesn't exist
          await setDoc(progressRef, {
            completedLessons: {},
            moduleProgress: {}
          });
          setUserProgress({
            completedLessons: {},
            moduleProgress: {}
          });
        } else {
          setUserProgress(progressDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user progress:', error);
        toast.error('Failed to load your progress');
      }
    };

    fetchUserProgress();
    setLoading(false);

    return () => unsubscribeModules();
  }, [db, currentUser]);

  const handleStartModule = (moduleId) => {
    setSelectedModule(moduleId);
  };

  const handleCompleteLesson = async (moduleId, lessonId) => {
    try {
      const progressRef = doc(db, 'user_progress', currentUser.uid);
      const module = modules.find(m => m.id === moduleId);
      const updatedProgress = {
        ...userProgress,
        completedLessons: {
          ...userProgress.completedLessons,
          [lessonId]: true
        }
      };

      // Calculate module progress
      const totalLessons = module.lessons.length;
      const completedCount = module.lessons.filter(
        lesson => updatedProgress.completedLessons[lesson.id]
      ).length;
      const progress = Math.round((completedCount / totalLessons) * 100);

      updatedProgress.moduleProgress = {
        ...updatedProgress.moduleProgress,
        [moduleId]: progress
      };

      await updateDoc(progressRef, updatedProgress);
      setUserProgress(updatedProgress);
      toast.success('Progress updated!');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading Training Library...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2 military-header">TRAINING ACADEMY</h1>
          <p className="text-gray-400">Master the art of strategic warfare and financial conquest</p>
        </header>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {modules.map((module, index) => {
            const progress = userProgress.moduleProgress?.[module.id] || 0;
            const isLocked = index > 0 && (!userProgress.moduleProgress?.[modules[index - 1].id] || userProgress.moduleProgress?.[modules[index - 1].id] < 100);

            return (
              <div 
                key={module.id}
                className="game-card p-6 rounded-lg border border-gray-700 relative"
              >
                {isLocked && (
                  <div className="absolute inset-0 bg-black bg-opacity-75 rounded-lg flex items-center justify-center">
                    <FaLock className="text-4xl text-gray-500" />
                  </div>
                )}
                
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-green-600 mr-4">
                    <FaGraduationCap className="text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold">{module.title}</h3>
                </div>

                <p className="text-gray-400 mb-4 line-clamp-2">{module.description}</p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 rounded-full h-2 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleStartModule(module.id)}
                  disabled={isLocked}
                  className={`w-full px-4 py-2 rounded flex items-center justify-center space-x-2 ${
                    progress === 100
                      ? 'button-military bg-green-600'
                      : 'button-military'
                  }`}
                >
                  {progress === 100 ? (
                    <>
                      <FaCheckCircle />
                      <span>COMPLETED</span>
                    </>
                  ) : (
                    <>
                      <FaPlayCircle />
                      <span>CONTINUE TRAINING</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Training Tips */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 military-header">TRAINING TIPS</h2>
          <ul className="space-y-2 text-gray-300">
            <li>• Complete modules in order to unlock advanced training</li>
            <li>• Each module contains practical exercises and real-world scenarios</li>
            <li>• Track your progress and earn achievements</li>
            <li>• Review completed modules anytime to reinforce your knowledge</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TrainingLibrary;
