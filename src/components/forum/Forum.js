import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { FaEdit, FaTrash, FaReply, FaThumbsUp, FaComment, FaShare, FaStar, FaUserCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  TelegramIcon
} from 'react-share';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editText, setEditText] = useState('');
  const [showShareModal, setShowShareModal] = useState(null);
  
  const { currentUser } = useAuth();
  const db = getFirestore();
  const shareUrl = window.location.origin;

  useEffect(() => {
    const q = query(collection(db, 'forum_posts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, [db]);

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      await addDoc(collection(db, 'forum_posts'), {
        content: newPost,
        authorId: currentUser.uid,
        authorEmail: currentUser.email,
        timestamp: serverTimestamp(),
        likes: 0,
        comments: 0,
        shares: 0,
        starred: false,
        likedBy: [],
        starredBy: [],
        replies: []
      });
      setNewPost('');
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const handleLike = async (postId) => {
    try {
      const postRef = doc(db, 'forum_posts', postId);
      const post = posts.find(p => p.id === postId);
      const likedBy = post.likedBy || [];
      const userIndex = likedBy.indexOf(currentUser.uid);
      
      if (userIndex === -1) {
        await updateDoc(postRef, {
          likes: (post.likes || 0) + 1,
          likedBy: [...likedBy, currentUser.uid]
        });
      } else {
        await updateDoc(postRef, {
          likes: Math.max((post.likes || 0) - 1, 0),
          likedBy: likedBy.filter(id => id !== currentUser.uid)
        });
      }
    } catch (error) {
      console.error('Error updating likes:', error);
      toast.error('Failed to update likes');
    }
  };

  const handleStar = async (postId) => {
    try {
      const postRef = doc(db, 'forum_posts', postId);
      const post = posts.find(p => p.id === postId);
      const starredBy = post.starredBy || [];
      const userIndex = starredBy.indexOf(currentUser.uid);
      
      await updateDoc(postRef, {
        starred: !post.starred,
        starredBy: userIndex === -1 
          ? [...starredBy, currentUser.uid]
          : starredBy.filter(id => id !== currentUser.uid)
      });
    } catch (error) {
      console.error('Error updating star:', error);
      toast.error('Failed to update star');
    }
  };

  const handleShare = async (postId) => {
    try {
      const postRef = doc(db, 'forum_posts', postId);
      const post = posts.find(p => p.id === postId);
      await updateDoc(postRef, {
        shares: (post.shares || 0) + 1
      });
      setShowShareModal(postId);
    } catch (error) {
      console.error('Error updating shares:', error);
      toast.error('Failed to share post');
    }
  };

  const handleReply = async (postId) => {
    if (!replyText.trim()) return;

    try {
      const postRef = doc(db, 'forum_posts', postId);
      const post = posts.find(p => p.id === postId);
      
      await updateDoc(postRef, {
        replies: [...(post.replies || []), {
          content: replyText,
          authorId: currentUser.uid,
          authorEmail: currentUser.email,
          timestamp: new Date().toISOString(),
          likes: 0,
          likedBy: []
        }],
        comments: (post.replies?.length || 0) + 1
      });

      setReplyText('');
      setReplyingTo(null);
      toast.success('Reply added successfully!');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    }
  };

  const handleLikeReply = async (postId, replyIndex) => {
    try {
      const postRef = doc(db, 'forum_posts', postId);
      const post = posts.find(p => p.id === postId);
      const replies = [...post.replies];
      const reply = replies[replyIndex];
      const likedBy = reply.likedBy || [];
      const userIndex = likedBy.indexOf(currentUser.uid);

      if (userIndex === -1) {
        replies[replyIndex] = {
          ...reply,
          likes: (reply.likes || 0) + 1,
          likedBy: [...likedBy, currentUser.uid]
        };
      } else {
        replies[replyIndex] = {
          ...reply,
          likes: Math.max((reply.likes || 0) - 1, 0),
          likedBy: likedBy.filter(id => id !== currentUser.uid)
        };
      }

      await updateDoc(postRef, { replies });
    } catch (error) {
      console.error('Error updating reply likes:', error);
      toast.error('Failed to update reply likes');
    }
  };

  const handleEditPost = async (postId) => {
    if (!editText.trim()) return;

    try {
      const postRef = doc(db, 'forum_posts', postId);
      await updateDoc(postRef, {
        content: editText,
        edited: true,
        editedAt: serverTimestamp()
      });

      setEditingPost(null);
      setEditText('');
      toast.success('Post updated successfully!');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await deleteDoc(doc(db, 'forum_posts', postId));
      toast.success('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const ShareModal = ({ post, onClose }) => {
    const shareTitle = `Check out this post from ${post.authorEmail} on Soldiers of Wealth!`;
    const shareMessage = `${post.content}\n\nJoin the battle at Soldiers of Wealth!`;
    const iconSize = 32;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold mb-4 military-header">SHARE POST</h3>
          <p className="text-gray-300 mb-6 line-clamp-2">{post.content}</p>
          
          <div className="flex justify-center space-x-4 mb-6">
            <FacebookShareButton url={shareUrl} quote={shareMessage} className="hover:opacity-80 transition-opacity">
              <FacebookIcon size={iconSize} round />
            </FacebookShareButton>
            
            <TwitterShareButton url={shareUrl} title={shareTitle} className="hover:opacity-80 transition-opacity">
              <TwitterIcon size={iconSize} round />
            </TwitterShareButton>
            
            <LinkedinShareButton url={shareUrl} title={shareTitle} summary={shareMessage} className="hover:opacity-80 transition-opacity">
              <LinkedinIcon size={iconSize} round />
            </LinkedinShareButton>
            
            <WhatsappShareButton url={shareUrl} title={shareMessage} className="hover:opacity-80 transition-opacity">
              <WhatsappIcon size={iconSize} round />
            </WhatsappShareButton>
            
            <TelegramShareButton url={shareUrl} title={shareMessage} className="hover:opacity-80 transition-opacity">
              <TelegramIcon size={iconSize} round />
            </TelegramShareButton>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full button-military px-4 py-2 rounded transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 military-header">COMMANDER FORUM</h2>
      
      {/* Create Post */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700">
        <div className="flex items-center mb-4">
          <FaUserCircle className="text-gray-400 text-3xl mr-2" />
          <textarea 
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your battle strategy..."
            className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"
            rows="3"
          />
        </div>
        <button 
          onClick={handleSubmitPost}
          className="button-military px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          disabled={!newPost.trim()}
        >
          POST
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="game-card p-4 rounded-lg border border-gray-700">
            <div className="flex items-center mb-2">
              <FaUserCircle className="text-gray-400 text-2xl mr-2" />
              <div>
                <span className="font-bold text-white">{post.authorEmail}</span>
                <div className="text-gray-500 text-sm">
                  {post.timestamp?.toDate().toLocaleString()}
                  {post.edited && ' (edited)'}
                </div>
              </div>
            </div>

            {editingPost === post.id ? (
              <div className="mt-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"
                  rows="3"
                />
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleEditPost(post.id)}
                    className="button-military px-4 py-1 rounded transition-colors"
                    disabled={!editText.trim()}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingPost(null);
                      setEditText('');
                    }}
                    className="button-attack px-4 py-1 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="mb-4 text-gray-300">{post.content}</p>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-6 text-gray-400">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-1 hover:text-white ${
                    post.likedBy?.includes(currentUser.uid) ? 'text-green-500' : ''
                  }`}
                >
                  <FaThumbsUp />
                  <span>{post.likes || 0}</span>
                </button>
                <button 
                  onClick={() => setReplyingTo(post.id)}
                  className="flex items-center space-x-1 hover:text-white"
                >
                  <FaComment />
                  <span>{post.replies?.length || 0}</span>
                </button>
                <button 
                  onClick={() => handleShare(post.id)}
                  className="flex items-center space-x-1 hover:text-white"
                >
                  <FaShare />
                  <span>{post.shares || 0}</span>
                </button>
                <button 
                  onClick={() => handleStar(post.id)}
                  className={`flex items-center space-x-1 hover:text-yellow-500 ${
                    post.starredBy?.includes(currentUser.uid) ? 'text-yellow-500' : ''
                  }`}
                >
                  <FaStar />
                </button>
              </div>

              {currentUser.uid === post.authorId && (
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      setEditingPost(post.id);
                      setEditText(post.content);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <FaTrash />
                  </button>
                </div>
              )}
            </div>

            {/* Replies */}
            {post.replies?.length > 0 && (
              <div className="ml-8 mt-4 space-y-4">
                {post.replies.map((reply, index) => (
                  <div key={index} className="game-card p-3 rounded border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaUserCircle className="text-gray-400 text-xl mr-2" />
                        <div>
                          <div className="font-bold text-white">{reply.authorEmail}</div>
                          <div className="text-gray-500 text-sm">
                            {new Date(reply.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleLikeReply(post.id, index)}
                        className={`flex items-center space-x-1 hover:text-white ${
                          reply.likedBy?.includes(currentUser.uid) ? 'text-green-500' : 'text-gray-400'
                        }`}
                      >
                        <FaThumbsUp />
                        <span>{reply.likes || 0}</span>
                      </button>
                    </div>
                    <p className="text-gray-300 mt-2">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Form */}
            {replyingTo === post.id && (
              <div className="ml-8 mt-4">
                <div className="flex items-center mb-2">
                  <FaUserCircle className="text-gray-400 text-xl mr-2" />
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"
                    rows="2"
                  />
                </div>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleReply(post.id)}
                    className="button-military px-4 py-1 rounded transition-colors"
                    disabled={!replyText.trim()}
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    className="button-attack px-4 py-1 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal 
          post={posts.find(p => p.id === showShareModal)} 
          onClose={() => setShowShareModal(null)}
        />
      )}
    </div>
  );
};

export default Forum;
