import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { FaEdit, FaTrash, FaReply } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editText, setEditText] = useState('');
  
  const { currentUser } = useAuth();
  const db = getFirestore();

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
        replies: []
      });
      setNewPost('');
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
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
          timestamp: new Date().toISOString()
        }]
      });

      setReplyText('');
      setReplyingTo(null);
      toast.success('Reply added successfully!');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
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

  return (
    <div className="p-6">
      {/* Create New Post */}
      <form onSubmit={handleSubmitPost} className="mb-8">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your thoughts with fellow commanders..."
          className="w-full p-4 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500"
          rows="4"
        />
        <button
          type="submit"
          className="mt-2 button-military px-6 py-2 rounded-lg"
        >
          POST MESSAGE
        </button>
      </form>

      {/* Posts List */}
      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="game-card p-4 rounded-lg">
            {/* Post Content */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-bold text-white">{post.authorEmail}</div>
                {editingPost === post.id ? (
                  <div className="mt-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                      rows="3"
                    />
                    <div className="mt-2 space-x-2">
                      <button
                        onClick={() => handleEditPost(post.id)}
                        className="button-military px-4 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingPost(null);
                          setEditText('');
                        }}
                        className="button-attack px-4 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-300 mt-1">{post.content}</p>
                )}
                <div className="text-gray-500 text-sm mt-2">
                  {post.timestamp?.toDate().toLocaleString()}
                  {post.edited && ' (edited)'}
                </div>
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
            <div className="ml-8 space-y-4">
              {post.replies?.map((reply, index) => (
                <div key={index} className="game-card p-3 rounded">
                  <div className="font-bold text-white">{reply.authorEmail}</div>
                  <p className="text-gray-300 mt-1">{reply.content}</p>
                  <div className="text-gray-500 text-sm mt-1">
                    {new Date(reply.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            {replyingTo === post.id ? (
              <div className="ml-8 mt-4">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                  rows="2"
                />
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleReply(post.id)}
                    className="button-military px-4 py-1 rounded"
                  >
                    Send Reply
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    className="button-attack px-4 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setReplyingTo(post.id)}
                className="mt-2 text-gray-400 hover:text-white flex items-center space-x-1"
              >
                <FaReply />
                <span>Reply</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forum;
