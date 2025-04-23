import React from 'react';
import { FaBook, FaChartLine, FaShieldAlt, FaUsers, FaLightbulb, FaTrophy } from 'react-icons/fa';

const Training = () => {
  const lessons = [
    {
      id: 1,
      title: "Basic Combat Training",
      description: "Learn the fundamentals of military strategy and resource management",
      icon: FaBook,
      progress: 100,
      completed: true
    },
    {
      id: 2,
      title: "Market Analysis",
      description: "Master the art of reading market trends and making profitable investments",
      icon: FaChartLine,
      progress: 75,
      completed: false
    },
    {
      id: 3,
      title: "Defense Tactics",
      description: "Advanced techniques for protecting your assets and soldiers",
      icon: FaShieldAlt,
      progress: 50,
      completed: false
    },
    {
      id: 4,
      title: "Alliance Building",
      description: "Strategies for forming and maintaining powerful alliances",
      icon: FaUsers,
      progress: 25,
      completed: false
    }
  ];

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">TRAINING ACADEMY</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lessons.map(lesson => (
          <div key={lesson.id} className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <lesson.icon className="text-2xl text-green-500 mr-3" />
              <h3 className="text-xl font-bold">{lesson.title}</h3>
            </div>
            
            <p className="text-gray-400 mb-4">{lesson.description}</p>
            
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-green-200 text-green-900">
                    Progress
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-green-500">
                    {lesson.progress}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                <div 
                  style={{ width: `${lesson.progress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                />
              </div>
            </div>
            
            <button 
              className={`w-full py-2 px-4 rounded ${
                lesson.completed 
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              disabled={lesson.completed}
            >
              {lesson.completed ? 'COMPLETED' : 'CONTINUE TRAINING'}
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-gray-800 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaLightbulb className="text-2xl text-yellow-500 mr-3" />
            <h3 className="text-xl font-bold">Training Tips</h3>
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
    </div>
  );
};

export default Training;
