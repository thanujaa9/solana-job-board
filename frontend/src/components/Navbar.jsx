// frontend/src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

function Navbar({ onShowProfile, onShowJobs, onShowPostJob, onShowMyPostedJobs, onShowMyApplications, onLogout, userName }) {
  const location = useLocation();

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center fixed w-full top-0 z-50 shadow-md">
      <div className="flex items-center">
        <Link to="/dashboard" className="text-2xl font-bold text-blue-300 hover:text-blue-200 transition duration-200 tracking-wide">
          RizeOS Job Portal
        </Link>
      </div>
      <div className="flex items-center">
        <span className="mr-4 text-lg font-medium text-gray-200">Welcome, {userName}!</span>
        <ul className="flex space-x-6 items-center"> {/* Added items-center for vertical alignment */}
          <li>
            <Link
              to="/dashboard/jobs"
              onClick={onShowJobs}
              className={`hover:text-gray-300 transition duration-200 font-medium px-2 py-1 rounded-md ${location.pathname.startsWith('/dashboard/jobs') ? 'text-blue-400 bg-gray-700' : ''}`}
            >
              Jobs Feed
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/my-applications"
              onClick={onShowMyApplications}
              className={`hover:text-gray-300 transition duration-200 font-medium px-2 py-1 rounded-md ${location.pathname.startsWith('/dashboard/my-applications') ? 'text-blue-400 bg-gray-700' : ''}`}
            >
              My Applications
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/my-posted-jobs"
              onClick={onShowMyPostedJobs}
              className={`hover:text-gray-300 transition duration-200 font-medium px-2 py-1 rounded-md ${location.pathname.startsWith('/dashboard/my-posted-jobs') ? 'text-blue-400 bg-gray-700' : ''}`}
            >
              My Posted Jobs
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/post-job"
              onClick={onShowPostJob}
              className={`hover:text-gray-300 transition duration-200 font-medium px-2 py-1 rounded-md ${location.pathname.startsWith('/dashboard/post-job') ? 'text-blue-400 bg-gray-700' : ''}`}
            >
              Post a Job
            </Link>
          </li>
          {/* NEW LINKS FOR COMMUNITY FEATURES */}
          <li>
            <Link
              to="/dashboard/community-feed"
              className={`hover:text-gray-300 transition duration-200 font-medium px-2 py-1 rounded-md ${location.pathname.startsWith('/dashboard/community-feed') ? 'text-blue-400 bg-gray-700' : ''}`}
            >
              Community Feed
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/create-post"
              className={`hover:text-gray-300 transition duration-200 font-medium px-2 py-1 rounded-md ${location.pathname.startsWith('/dashboard/create-post') ? 'text-blue-400 bg-gray-700' : ''}`}
            >
              Create Post
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/profile"
              onClick={onShowProfile}
              className={`hover:text-gray-300 transition duration-200 font-medium px-2 py-1 rounded-md ${location.pathname.startsWith('/dashboard/profile') ? 'text-blue-400 bg-gray-700' : ''}`}
            >
              Your Profile
            </Link>
          </li>
        </ul>
        <button
          onClick={onLogout}
          className="ml-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 shadow-sm hover:shadow-lg"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  onShowProfile: PropTypes.func.isRequired,
  onShowJobs: PropTypes.func.isRequired,
  onShowPostJob: PropTypes.func.isRequired,
  onShowMyPostedJobs: PropTypes.func.isRequired,
  onShowMyApplications: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  userName: PropTypes.string.isRequired,
};

export default Navbar;