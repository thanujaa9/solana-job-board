import React from 'react';

function WelcomePage({ onShowLogin, onShowRegister }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 md:p-12 max-w-lg w-full text-center transform transition-transform duration-500 hover:scale-105">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6">
          Welcome to RizeOS Job Portal
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
          Your gateway to exciting job opportunities and a vibrant professional network, powered by AI and Web3.
        </p>

        <div className="space-y-4">
          <button
            onClick={onShowLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          >
            Login
          </button>
          <p className="text-gray-500 text-base">
            Don't have an account?
          </p>
          <button
            onClick={onShowRegister}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
          >
            Register
          </button>
        </div>

        <p className="mt-10 text-sm text-gray-400">
          Showcasing full-stack, Web3, AI, and product thinking skills.
        </p>
      </div>
    </div>
  );
}

export default WelcomePage;