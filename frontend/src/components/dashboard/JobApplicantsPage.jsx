import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const getStatusColor = (status) => {
  switch (status) {
    case 'hired':
      return 'bg-green-500';
    case 'scheduled':
      return 'bg-blue-500';
    case 'rejected':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const JobApplicantsPage = ({ token }) => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchScores, setMatchScores] = useState({});
  const [statusLoading, setStatusLoading] = useState({});

  const fetchJob = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch job details');
      }
      setJob(data.job);
    } catch (err) {
      console.error('JobApplicantsPage: Error fetching job:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchScore = async (jobId, userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs/match/${jobId}/${userId}`, {
        method: 'GET',
        headers: {
          'x-auth-token': token,
        },
      });
      if (!response.ok) {
        console.error(`Failed to fetch match score for job ${jobId} and user ${userId}`);
        return null;
      }
      const data = await response.json();
      return data.score;
    } catch (err) {
      console.error('Error fetching match score:', err);
      return null;
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    setStatusLoading(prev => ({ ...prev, [applicationId]: true }));
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs/application/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error('Failed to update application status.');
      }
      await fetchJob();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setStatusLoading(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  useEffect(() => {
    if (token && jobId) {
      fetchJob();
    }
  }, [token, jobId]);

  useEffect(() => {
    const fetchAllMatchScores = async () => {
      if (job && job.applicants) {
        const scores = {};
        for (const applicant of job.applicants) {
          if (applicant.user) {
            const score = await fetchMatchScore(job._id, applicant.user.id);
            scores[applicant.user.id] = score;
          }
        }
        setMatchScores(scores);
      }
    };
    fetchAllMatchScores();
  }, [job, token]);

  if (loading) {
    return <div className="p-4 text-center text-lg text-gray-700">Loading applicants...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600 bg-red-100 border border-red-300 rounded-md">Error: {error}</div>;
  }

  if (!job) {
    return <div className="p-4 text-center text-lg text-gray-700">Job not found.</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to="/dashboard/my-posted-jobs" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium">
        &larr; Back to My Posted Jobs
      </Link>
      
      <h2 className="text-3xl font-bold text-gray-800 my-4">{job.title} Applicants</h2>
      <p className="text-gray-600 mb-6">Showing all applicants for this job post.</p>

      {job.applicants && job.applicants.length > 0 ? (
        <div className="space-y-6">
          {job.applicants.map((applicant) => (
            <div key={applicant._id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex flex-col md:flex-row justify-between">
              <div className="md:w-3/5">
                <h3 className="text-xl font-semibold text-gray-800">
                  {applicant.user ? applicant.user.name : 'Unknown User'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Applied on: {new Date(applicant.applicationDate).toLocaleDateString()}
                </p>

                <div className="mt-4">
                  <p className="text-md font-medium text-gray-700">Cover Letter:</p>
                  <p className="text-gray-600 italic leading-snug">{applicant.coverLetter || 'No cover letter provided.'}</p>
                </div>
                
                <div className="mt-4">
                  <p className="text-md font-medium text-gray-700">Resume:</p>
                  {applicant.resume ? (
                    <a href={applicant.resume} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      View Resume Link
                    </a>
                  ) : (
                    <p className="text-gray-600 italic">No resume link provided.</p>
                  )}
                </div>
              </div>

              <div className="md:w-2/5 md:text-right mt-6 md:mt-0">
                <div className="mb-4">
                  <p className="text-lg font-bold text-gray-700">Match Score:</p>
                  <p className="text-3xl font-extrabold text-green-600">
                    {matchScores[applicant.user.id] ? `${matchScores[applicant.user.id]}%` : '...' }
                  </p>
                </div>

                <div>
                  <p className="text-md font-medium text-gray-700 mb-2">
                    Current Status: 
                    <span className={`inline-block px-3 py-1 ml-2 text-white text-xs font-semibold rounded-full capitalize ${getStatusColor(applicant.status)}`}>
                      {applicant.status}
                    </span>
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => handleStatusChange(applicant._id, 'hired')}
                      disabled={statusLoading[applicant._id]}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {statusLoading[applicant._id] ? 'Updating...' : 'Hire'}
                    </button>
                    <button
                      onClick={() => handleStatusChange(applicant._id, 'scheduled')}
                      disabled={statusLoading[applicant._id]}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {statusLoading[applicant._id] ? 'Updating...' : 'Schedule Interview'}
                    </button>
                    <button
                      onClick={() => handleStatusChange(applicant._id, 'rejected')}
                      disabled={statusLoading[applicant._id]}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {statusLoading[applicant._id] ? 'Updating...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-lg text-gray-600">No applicants have applied to this job yet.</p>
      )}
    </div>
  );
};

JobApplicantsPage.propTypes = {
  token: PropTypes.string.isRequired,
};

export default JobApplicantsPage;