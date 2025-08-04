// frontend/src/components/dashboard/PostForm.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

function PostForm({ token, onPostCreated }) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState(''); 
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!content.trim()) {
      setError('Post content cannot be empty.');
      setLoading(false);
      return;
    }

    try {
      const postData = { content };
      if (title.trim()) {
        postData.title = title.trim();
      }
      if (image.trim()) {
        postData.image = image.trim();
      }

const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token, 
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          setError(data.errors.map(err => err.msg).join(', '));
        } else {
          throw new Error(data.msg || 'Failed to create post');
        }
      } else {
        setSuccess('Post created successfully!');
        setContent(''); 
        setTitle('');
        setImage('');
        if (onPostCreated) {
          onPostCreated(data); 
        }
      }
    } catch (err) {
      console.error('Post creation error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 w-full max-w-2xl mx-auto my-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create New Post</h3>

      {error && (
        <p className="text-red-600 mb-4 bg-red-100 p-2 rounded text-center">{error}</p>
      )}
      {success && (
        <p className="text-green-600 mb-4 bg-green-100 p-2 rounded text-center">{success}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1 text-left">Title (Optional)</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="A catchy title for your post..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            maxLength="100"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1 text-left">Content</label>
          <textarea
            id="content"
            name="content"
            placeholder="Share your career advice, industry updates, or thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="6"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 resize-y"
            required
            minLength="5"
            maxLength="1000"
          ></textarea>
          <p className="text-sm text-gray-500 text-right">{content.length}/1000 characters</p>
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1 text-left">Image URL (Optional)</label>
          <input
            type="url"
            id="image"
            name="image"
            placeholder="e.g., https://example.com/your-image.jpg"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
          disabled={loading}
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}

PostForm.propTypes = {
  token: PropTypes.string.isRequired,
  onPostCreated: PropTypes.func, 
};

export default PostForm;