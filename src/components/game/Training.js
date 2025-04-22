import React from 'react';
import { FaBook, FaChartLine, FaShieldAlt, FaUsers, FaLightbulb, FaTrophy } from 'react-icons/fa';

export default function Training() {
  const trainingModules = [
    {
      id: 1,
      title: "Basic Market Operations",
      icon: FaBook,
      level: "Beginner",
      duration: "2 hours",
      description: "Learn the fundamentals of market operations and basic trading strategies.",
      topics: [
        "Understanding market mechanics",
        "Basic order types",
        "Risk management fundamentals",
        "Reading market indicators"
      ]
    },
    {
      id: 2,
      title: "Advanced Trading Strategies",
      icon: FaChartLine,
      level: "Advanced",
      duration: "4 hours",
      description: "Master complex trading patterns and advanced market analysis techniques.",
      topics: [
        "Technical analysis",
        "Pattern recognition",
        "Market psychology",
        "Advanced order strategies"
      ]
    },
    {
      id: 3,
      title: "Defense Tactics",
      icon: FaShieldAlt,
      level: "Intermediate",
      duration: "3 hours",
      description: "Learn how to protect your assets and defend against market attacks.",
      topics: [
        "Asset protection strategies",
        "Counter-attack methods",
        "Defensive positioning",
        "Risk mitigation"
      ]
    },
    {
      id: 4,
      title: "Alliance Building",
      icon: FaUsers,
      level: "Intermediate",
      duration: "2 hours",
      description: "Discover the power of strategic alliances and network building.",
      topics: [
        "Alliance formation",
        "Negotiation tactics",
        "Resource sharing",
        "Joint operations"
      ]
    },
    {
      id: 5,
      title: "Market Intelligence",
      icon: FaLightbulb,
      level: "Advanced",
      duration: "3 hours",
      description: "Master the art of gathering and analyzing market intelligence.",
      topics: [
        "Information gathering",
        "Competitor analysis",
        "Market sentiment analysis",
        "Predictive modeling"
      ]
    },
    {
      id: 6,
      title: "Victory Strategies",
      icon: FaTrophy,
      level: "Expert",
      duration: "4 hours",
      description: "Learn winning strategies from top commanders and past victors.",
      topics: [
        "Winning tactics",
        "Resource optimization",
        "Strategic planning",
        "End-game scenarios"
      ]
    }
  ];

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-blue-400';
      case 'advanced': return 'text-purple-400';
      case 'expert': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="text-gray-300 space-y-8">
      <section className="mb-8">
        <h3 className="text-xl font-bold text-gold-300 mb-4">Training Overview</h3>
        <p className="text-gray-300 mb-4">
          Welcome to the Soldiers of Wealth Training Academy. Our comprehensive training modules 
          are designed to transform you into an elite financial commander. Select a module to begin your training.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trainingModules.map((module) => {
          const Icon = module.icon;
          return (
            <div key={module.id} className="game-card p-6 rounded-lg hover:bg-gray-800 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Icon className="h-8 w-8 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white mb-2">{module.title}</h4>
                  <div className="flex items-center space-x-4 mb-3">
                    <span className={`text-sm ${getLevelColor(module.level)}`}>{module.level}</span>
                    <span className="text-sm text-gray-400">{module.duration}</span>
                  </div>
                  <p className="text-gray-300 mb-4">{module.description}</p>
                  <div className="space-y-2">
                    <h5 className="text-sm font-bold text-gray-400">Topics Covered:</h5>
                    <ul className="list-disc pl-5 space-y-1">
                      {module.topics.map((topic, index) => (
                        <li key={index} className="text-sm text-gray-400">{topic}</li>
                      ))}
                    </ul>
                  </div>
                  <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                    Start Module
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section className="mt-8 p-4 game-card">
        <h3 className="text-xl font-bold text-gold-300 mb-3">Training Schedule</h3>
        <p className="italic text-gray-300">
          Complete all modules to earn your Elite Commander certification. Training progress is saved 
          automatically, and you can resume any module at any time. Good luck, Commander!
        </p>
      </section>
    </div>
  );
}
