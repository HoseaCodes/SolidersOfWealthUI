import React, { useState } from 'react';
import { FaThumbsUp, FaComment, FaShare, FaStar, FaUserCircle } from 'react-icons/fa';

export default function Forum() {
  const [activeTab, setActiveTab] = useState('trending');

  const discussions = {
    trending: [
      {
        id: 1,
        author: "Commander_Elite",
        title: "Advanced Market Defense Strategies",
        content: "Here's my analysis of the most effective defensive positions in the current meta...",
        likes: 245,
        comments: 89,
        tags: ["Strategy", "Defense", "Meta"],
        pinned: true
      },
      {
        id: 2,
        author: "MarketTactician",
        title: "Season 5 Alliance Recruitment",
        content: "Looking for experienced commanders to form an elite alliance for the upcoming season...",
        likes: 182,
        comments: 156,
        tags: ["Alliance", "Recruitment", "Season 5"]
      },
      {
        id: 3,
        author: "WealthWarrior",
        title: "Counter-Attack Timing Analysis",
        content: "I've compiled data on optimal counter-attack timing based on market conditions...",
        likes: 167,
        comments: 73,
        tags: ["Analysis", "Combat", "Timing"]
      }
    ],
    strategy: [
      {
        id: 4,
        author: "StrategicMind",
        title: "Resource Allocation Guide",
        content: "Detailed breakdown of optimal resource allocation ratios for different game phases...",
        likes: 143,
        comments: 52,
        tags: ["Resources", "Guide", "Strategy"]
      }
    ],
    alliances: [
      {
        id: 5,
        author: "AllianceLeader",
        title: "Wealth Warriors Recruiting",
        content: "Top 10 alliance seeking active members for Season 5. Requirements: Level 30+...",
        likes: 98,
        comments: 145,
        tags: ["Recruitment", "Alliance"]
      }
    ]
  };

  const renderDiscussion = (discussion) => (
    <div key={discussion.id} className={`game-card p-6 rounded-lg mb-4 ${discussion.pinned ? 'border-l-4 border-yellow-500' : ''}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <FaUserCircle className="h-10 w-10 text-gray-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-blue-400">{discussion.author}</span>
            {discussion.pinned && (
              <span className="flex items-center text-yellow-500 text-sm">
                <FaStar className="mr-1" /> Pinned
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-white mt-2 mb-3">{discussion.title}</h3>
          <p className="text-gray-300 mb-4">{discussion.content}</p>
          
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {discussion.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <button className="flex items-center space-x-2 hover:text-blue-400">
              <FaThumbsUp />
              <span>{discussion.likes}</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-blue-400">
              <FaComment />
              <span>{discussion.comments}</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-blue-400">
              <FaShare />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="text-gray-300">
      {/* Forum Header */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gold-300 mb-4">Community Forum</h3>
        <p className="text-gray-300 mb-6">
          Connect with fellow commanders, share strategies, and form powerful alliances. 
          Join the discussion to enhance your tactical knowledge and build your network.
        </p>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <button 
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'trending' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Trending
            </button>
            <button 
              onClick={() => setActiveTab('strategy')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'strategy' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Strategy
            </button>
            <button 
              onClick={() => setActiveTab('alliances')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'alliances' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Alliances
            </button>
          </div>
          
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            New Discussion
          </button>
        </div>
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        {discussions[activeTab].map(discussion => renderDiscussion(discussion))}
      </div>

      {/* Forum Footer */}
      <div className="mt-8 p-4 game-card">
        <h4 className="text-lg font-bold text-gold-300 mb-2">Forum Guidelines</h4>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
          <li>Be respectful and professional in all interactions</li>
          <li>No sharing of exploits or cheats</li>
          <li>Keep discussions relevant to the game</li>
          <li>Use appropriate channels for recruitment and alliance formation</li>
        </ul>
      </div>
    </div>
  );
}
