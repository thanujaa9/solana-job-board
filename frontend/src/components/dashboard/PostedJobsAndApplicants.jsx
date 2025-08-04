// frontend/src/components/dashboard/PostedJobsAndApplicants.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'; 

const PostedJobsAndApplicants = ({ token }) => {
  const [postedJobs, setPostedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostedJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:8000/api/jobs/my-posted-jobs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch posted jobs');
        }

        console.log('PostedJobsAndApplicants: Fetched data:', data);
        setPostedJobs(Array.isArray(data.jobs) ? data.jobs : []);

      } catch (err) {
        console.error('PostedJobsAndApplicants: Error fetching jobs:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPostedJobs();
    } else {
      setLoading(false);
      setError('Authentication token not available. Please log in.');
    }
  }, [token]);

  if (loading) {
    return <div className="p-4 text-center text-lg text-gray-700">Loading your posted jobs...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600 bg-red-100 border border-red-300 rounded-md">Error: {error}</div>;
  }

  if (postedJobs.length === 0) {
    return (
      <div className="p-4 text-center text-lg text-gray-700">
        You haven't posted any jobs yet.
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">My Posted Jobs</h2>
      {postedJobs.map((job) => (
        <div key={job._id} className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <h3 className="text-2xl font-semibold text-blue-700 mb-2">{job.title}</h3>
          <p className="text-gray-600 mb-4">{job.description}</p>
          <p className="text-sm text-gray-500 mb-4">
            Posted on: {job.date ? new Date(job.date).toLocaleDateString() : 'N/A'}
          </p>

          <div className="flex justify-between items-center mt-4">
            <p className="text-gray-700 text-lg">
              Applicants: <span className="font-bold">{job.applicants ? job.applicants.length : 0}</span>
            </p>
            
            <Link
              to={`/dashboard/jobs/${job._id}/applicants`} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-md font-medium transition duration-300 ease-in-out"
            >
              View Applicants
            </Link>
            {/* --- END NEW --- */}
          </div>

          {}
          {}

        </div>
      ))}
    </div>
  );
};

PostedJobsAndApplicants.propTypes = {
  token: PropTypes.string.isRequired,
};

export default PostedJobsAndApplicants;