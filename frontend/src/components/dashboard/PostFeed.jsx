// frontend/src/components/dashboard/PostFeed.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const PostFeed = ({ token }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState({}); 
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Corrected: Added the token header
          'x-auth-token': token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to fetch posts');
      }

      console.log('PostFeed: Fetched data:', data);
      setPosts(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error('PostFeed: Error fetching posts:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [token]);

  const handleCreatePostClick = () => {
    navigate('/dashboard/create-post');
  };

  // NEW: Handle Like/Unlike
  const handleLikeUnlike = async (postId, isLiked) => {
    if (!token) {
      alert('Please log in to like/unlike posts.');
      return;
    }

    try {
      // Corrected: Fixed the typo (meta.meta)
      const endpoint = isLiked ? `${import.meta.env.VITE_API_URL}/api/posts/unlike/${postId}` : `${import.meta.env.VITE_API_URL}/api/posts/like/${postId}`;
      const method = 'PUT';

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to update like status.');
      }

      fetchPosts();

    } catch (err) {
      console.error('Like/Unlike Error:', err);
      alert(err.message || 'Failed to process like/unlike.');
    }
  };

  // NEW: Handle Comment Submission
  const handleCommentSubmit = async (postId) => {
    if (!token) {
      alert('Please log in to comment.');
      return;
    }
    const text = commentText[postId] ? commentText[postId].trim() : '';

    if (!text) {
      alert('Comment cannot be empty.');
      return;
    }
    if (text.length < 1 || text.length > 500) {
      alert('Comment must be between 1 and 500 characters.');
      return;
    }

    try {
      // Corrected: Replaced hardcoded URL with environment variable
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/comment/${postId}`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to post comment.');
      }

      setCommentText(prev => ({ ...prev, [postId]: '' }));
      fetchPosts();

    } catch (err) {
      console.error('Comment Error:', err);
      alert(err.message || 'Failed to post comment.');
    }
  };

  const handleCommentDelete = async (postId, commentId) => {
    if (!token) {
      alert('Please log in to delete comments.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      // Corrected: Replaced hardcoded URL with environment variable
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/comment/${postId}/${commentId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to delete comment.');
      }

      fetchPosts();

    } catch (err) {
      console.error('Delete Comment Error:', err);
      alert(err.message || 'Failed to delete comment.');
    }
  };


  if (loading) {
    return (
      <div className="p-8 text-center text-xl text-gray-700 min-h-[calc(100vh-100px)] flex items-center justify-center">
        Loading community posts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-100 border border-red-400 text-red-700 rounded-md max-w-2xl mx-auto my-8">
        <p className="text-xl font-semibold mb-2">Error loading posts</p>
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 my-8">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Community Feed</h2>

      {/* Create Post Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleCreatePostClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg text-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
        >
          <i className="fas fa-plus mr-2"></i> Create New Post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="p-8 text-center text-xl text-gray-700 min-h-[calc(100vh-200px)] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <p className="mb-4">No posts found yet. Be the first to share some career advice or updates!</p>
          <button
            onClick={handleCreatePostClick}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
          >
            Create Your First Post
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => {
            const currentUserHasLiked = post.likes.some(
              (like) => like.user.toString() === localStorage.getItem('userId') 
            );

            return (
              <div key={post._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out overflow-hidden border border-gray-100">
                <div className="p-6 md:p-8">
                  <div className="flex items-center mb-4">
                    <img
                      src={post.user?.avatar || `https://ui-avatars.com/api/?name=${post.user?.name || 'User'}&background=random&color=fff`}
                      alt={post.user?.name || 'User'}
                      className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-indigo-200"
                    />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{post.user?.name || 'Anonymous User'}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {post.title && (
                    <h3 className="text-xl font-bold text-indigo-800 mb-3">{post.title}</h3>
                  )}
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>

                  {post.image && (
                    <div className="mb-4">
                      <img
                        src={post.image.includes('drive.google.com') ? post.image.replace('/view?usp=sharing', '/preview') : post.image}
                        alt="Post illustration"
                        className="w-full h-auto rounded-lg object-cover max-h-96"
                        onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/400x200?text=Image+Not+Found" }}
                      />
                    </div>
                  )}

                  {/* Interaction section: Likes and Comments */}
                  <div className="flex items-center text-gray-600 text-sm mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleLikeUnlike(post._id, currentUserHasLiked)}
                      className={`flex items-center mr-6 px-3 py-1 rounded-md transition duration-200 ${
                        currentUserHasLiked ? 'text-red-600 bg-red-100' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title={currentUserHasLiked ? 'Unlike this post' : 'Like this post'}
                    >
                      <i className={`fas fa-heart ${currentUserHasLiked ? 'mr-2' : 'mr-1'}`}></i>
                      {post.likes?.length || 0} {post.likes?.length === 1 ? 'Like' : 'Likes'}
                    </button>
                    <span className="flex items-center">
                      <i className="fas fa-comment mr-1"></i> {post.comments?.length || 0} Comments
                    </span>
                  </div>

                  {/* Comment Input Form */}
                  <div className="mt-6 border-t border-gray-100 pt-6">
                    <div className="flex space-x-3">
                      <textarea
                        className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y min-h-[40px] max-h-[120px]"
                        placeholder="Write a comment..."
                        value={commentText[post._id] || ''}
                        onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                        rows="1" 
                      ></textarea>
                      <button
                        onClick={() => handleCommentSubmit(post._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Post
                      </button>
                    </div>
                  </div>

                  {/* Display Comments */}
                  {post.comments && post.comments.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <h5 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Comments:</h5>
                      {post.comments.map((comment) => (
                        <div key={comment._id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                          <div className="flex items-center mb-2">
                            <img
                              src={comment.avatar || `https://ui-avatars.com/api/?name=${comment.name || 'User'}&background=random&color=fff`}
                              alt={comment.name || 'User'}
                              className="w-8 h-8 rounded-full mr-3 object-cover"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{comment.name || 'Anonymous User'}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(comment.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            {comment.user.toString() === localStorage.getItem('userId') && (
                                <button
                                  onClick={() => handleCommentDelete(post._id, comment._id)}
                                  className="ml-auto text-red-500 hover:text-red-700 transition duration-200"
                                  title="Delete comment"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              )}
                          </div>
                          <p className="text-gray-700 text-base">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

PostFeed.propTypes = {
  token: PropTypes.string,
};

export default PostFeed;