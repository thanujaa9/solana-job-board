// frontend/src/components/Register.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Register({ onGoBack, onRegisterSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // --- INCLUDE name IN THE BODY ---
        body: JSON.stringify({ name, email, password }),
        // --- END INCLUDE name IN THE BODY ---
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.msg || (data.errors && data.errors.length > 0 ? data.errors[0].msg : 'Registration failed');
        throw new Error(errorMessage);
      }

      console.log('Registration successful, token:', data.token);
      if (onRegisterSuccess) {
        onRegisterSuccess(data.token); 
      }

    } catch (err) {
      console.error('Registration Error:', err.message);
      setError(err.message); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 md:p-10 max-w-md w-full text-center transform transition-transform duration-500">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6">Register</h2>

        {error && (
          <p className="text-red-600 mb-4 bg-red-100 p-2 rounded">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* --- ADD NAME INPUT FIELD --- */}
          <div>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              required
            />
          </div>
          {/* --- END ADD NAME INPUT FIELD --- */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;