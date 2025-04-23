import React, { useState } from 'react';
import { FaThumbsUp, FaComment, FaShare, FaStar, FaUserCircle } from 'react-icons/fa';

const Forum = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'Commander Alpha',
      content: 'Just discovered a new investment strategy that\'s working wonders!',
      likes: 15,
      comments: 5,
      shares: 3,
      starred: false
    },
    {
      id: 2,
      author: 'General Hawk',
      content: 'Looking for allies in the upcoming battle. Strong defense stats preferred.',
      likes: 8,
      comments: 12,
      shares: 2,
      starred: true
    }
  ]);

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const handleStar = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, starred: !post.starred } : post
    ));
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">COMMANDER FORUM</h2>
      
      {/* Create Post */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <div className="flex items-center mb-4">
          <FaUserCircle className="text-gray-400 text-3xl mr-2" />
          <input 
            type="text" 
            placeholder="Share your battle strategy..."
            className="bg-gray-700 text-white p-2 rounded flex-grow"
          />
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          POST
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <FaUserCircle className="text-gray-400 text-2xl mr-2" />
              <span className="font-bold">{post.author}</span>
            </div>
            <p className="mb-4">{post.content}</p>
            <div className="flex items-center space-x-6 text-gray-400">
              <button 
                onClick={() => handleLike(post.id)}
                className="flex items-center space-x-1 hover:text-white"
              >
                <FaThumbsUp />
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-white">
                <FaComment />
                <span>{post.comments}</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-white">
                <FaShare />
                <span>{post.shares}</span>
              </button>
              <button 
                onClick={() => handleStar(post.id)}
                className={`flex items-center space-x-1 ${post.starred ? 'text-yellow-500' : ''} hover:text-yellow-500`}
              >
                <FaStar />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forum;
