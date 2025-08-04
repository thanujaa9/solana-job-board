import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const MyApplications = ({ token }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyApplications = async () => {
      setLoading(true);
      setError(null);
      try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications/my-applications`, {

          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.msg || 'Failed to fetch my applications');
        }

        setApplications(Array.isArray(data) ? data : []);

      } catch (err) {
        console.error('MyApplications: Error fetching applications:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMyApplications();
    } else {
      setLoading(false);
      setError('Authentication token not available. Please log in.');
    }
  }, [token]);

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xl text-gray-700 min-h-[calc(100vh-100px)] flex items-center justify-center">
        Loading your applications...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-100 border border-red-400 text-red-700 rounded-md max-w-2xl mx-auto my-8">
        <p className="text-xl font-semibold mb-2">Error loading applications</p>
        <p className="text-lg">{error}</p>
        <Link to="/dashboard/jobs" className="mt-4 inline-block text-blue-600 hover:underline">
          Go back to Job Feed
        </Link>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="p-8 text-center text-xl text-gray-700 min-h-[calc(100vh-100px)] flex flex-col items-center justify-center">
        <p className="mb-4">You haven't applied for any jobs yet.</p>
        <Link
          to="/dashboard/jobs"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          Browse available jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 my-8">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">My Job Applications</h2>
      <div className="space-y-8">
        {applications.map((app) => (
          <div key={app._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out overflow-hidden border border-gray-100">
            <div className="p-6 md:p-8">
              {app.job ? (
                <>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <h3 className="text-2xl md:text-3xl font-bold text-blue-800 leading-tight mb-2 md:mb-0">
                      <Link to={`/jobs/${app.job._id}`} className="hover:text-blue-600 transition-colors duration-200">
                        {app.job.title}
                      </Link>
                    </h3>
                    <span className={`px-4 py-1.5 text-sm font-bold rounded-full uppercase tracking-wide ${getStatusBadgeClasses(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  <p className="text-lg text-gray-700 mb-2">
                    <span className="font-semibold">Company:</span> {app.job.company_name || 'N/A'}
                  </p>
                  <p className="text-lg text-gray-700 mb-2">
                    <span className="font-semibold">Location:</span> {app.job.location || 'N/A'}
                  </p>
                  <p className="text-lg text-gray-700 mb-2">
                    <span className="font-semibold">Job Type:</span> {app.job.job_type || 'N/A'}
                  </p>
                  {app.job.salary && (
                    <p className="text-lg text-gray-700 mb-4">
                      <span className="font-semibold">Salary:</span> ₹{app.job.salary.min} - ₹{app.job.salary.max}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 italic">
                    Applied on: {new Date(app.applicationDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </>
              ) : (
                <p className="text-red-600 font-bold text-xl py-4">Job details not available (Job may have been deleted or is inaccessible).</p>
              )}
            </div>

            {(app.coverLetter || app.resume) && (
              <div className="bg-gray-50 border-t border-gray-100 p-6 md:p-8">
                <h4 className="text-xl font-bold text-gray-800 mb-4">Your Submission</h4>
                {app.coverLetter && (
                  <div className="mb-4">
                    <p className="text-md font-semibold text-gray-700 mb-2">Cover Letter:</p>
                    <div className="bg-white p-4 rounded-md shadow-inner text-gray-800 text-sm leading-relaxed whitespace-pre-wrap border border-gray-200">
                      {app.coverLetter}
                    </div>
                  </div>
                )}

                {app.resume && (
                  <div>
                    <p className="text-md font-semibold text-gray-700 mb-2">Resume Link:</p>
                    <a
                      href={app.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm break-all bg-white p-3 rounded-md shadow-inner border border-gray-200 inline-block"
                    >
                      {app.resume}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

MyApplications.propTypes = {
  token: PropTypes.string.isRequired,
};

export default MyApplications;
