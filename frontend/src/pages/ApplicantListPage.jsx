// frontend/src/pages/ApplicantListPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const ApplicantListPage = ({ token }) => {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); 

  const fetchJobAndApplicants = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
     
const jobResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs/${jobId}`);
      const jobData = await jobResponse.json();
      if (!jobResponse.ok) {
        throw new Error(jobData.msg || 'Failed to fetch job title');
      }
      setJobTitle(jobData.title || 'Job');

const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications/job/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to fetch applicants');
      }

      console.log('ApplicantListPage: Fetched applicants data:', data);
      setApplicants(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error('ApplicantListPage: Error fetching data:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && jobId) {
      fetchJobAndApplicants();
    } else if (!token) {
      setLoading(false);
      setError('Authentication token not available. Please log in.');
    } else if (!jobId) {
      setLoading(false);
      setError('Job ID not provided in URL.');
    }
  }, [token, jobId]); 


  const handleStatusUpdate = async (applicationId, newStatus) => {
    setMessage(null); 
    try {
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to update application status');
      }

      setApplicants(prevApplicants =>
        prevApplicants.map(applicant =>
          applicant._id === applicationId ? { ...applicant, status: newStatus } : applicant
        )
      );
      setMessage(`Status updated to '${newStatus}' successfully!`);
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.message || 'Failed to update status.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xl text-gray-700">Loading applicants...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 text-xl bg-red-100 p-4 rounded">{error}</p>
        <Link to="/dashboard/my-posted-jobs" className="mt-4 text-blue-600 hover:underline inline-block">
          &larr; Back to My Posted Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-8 md:p-10 my-8 mx-auto"> {/* Added mx-auto for centering */}
      <Link to="/dashboard/my-posted-jobs" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to My Posted Jobs
      </Link>
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">Applicants for "{jobTitle}"</h2>

      {message && ( 
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}


      {applicants.length === 0 ? (
        <p className="text-gray-500 italic text-lg text-center p-4">No applicants for this job yet.</p>
      ) : (
        <ul className="space-y-6"> {/*  */}
          {applicants.map((applicant) => (
            <li key={applicant._id} className="p-6 flex flex-col items-start bg-gray-50 rounded-lg shadow-md border border-gray-200">
              <div className="w-full mb-4"> {/* */}
                <p className="text-xl font-semibold text-gray-900 mb-1">
                  Applicant: <span className="font-bold">{applicant.user?.name || 'Unknown Applicant'}</span>
                </p>
                <p className="text-md text-gray-700 mb-1">
                  Email: {applicant.user?.email || 'No Email'}
                </p>
                <p className="text-md text-gray-700 mb-2">
                  Applied: {new Date(applicant.applicationDate).toLocaleDateString()}
                  <span className={`ml-3 px-3 py-1 text-sm font-semibold rounded-full ${
                      applicant.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      applicant.status === 'Reviewed' ? 'bg-blue-100 text-blue-800' :
                      applicant.status === 'Interviewing' ? 'bg-purple-100 text-purple-800' :
                      applicant.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      applicant.status === 'Hired' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                  }`}>
                    {applicant.status}
                  </span>
                </p>

                {applicant.coverLetter && (
                  <div className="mt-4 p-3 bg-white rounded-md border border-gray-200">
                    <p className="text-sm font-semibold text-gray-800">Cover Letter / Why a good fit:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{applicant.coverLetter}</p>
                  </div>
                )}

                {applicant.resume && (
                  <div className="mt-3 p-3 bg-white rounded-md border border-gray-200">
                    <p className="text-sm font-semibold text-gray-800">Resume Link:</p>
                    <a
                      href={applicant.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm break-all"
                    >
                      {applicant.resume}
                    </a>
                  </div>
                )}
              </div>
              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap gap-2 self-end"> {/*  */}
                {applicant.status !== 'Reviewed' && applicant.status !== 'Hired' && applicant.status !== 'Rejected' && (
                  <button
                    onClick={() => handleStatusUpdate(applicant._id, 'Reviewed')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition duration-150 ease-in-out"
                  >
                    Mark Reviewed
                  </button>
                )}
                {applicant.status !== 'Interviewing' && applicant.status !== 'Hired' && applicant.status !== 'Rejected' && (
                    <button
                        onClick={() => handleStatusUpdate(applicant._id, 'Interviewing')}
                        className="bg-purple-500 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-600 transition duration-150 ease-in-out"
                    >
                        Schedule Interview
                    </button>
                )}
                {applicant.status !== 'Hired' && applicant.status !== 'Rejected' && (
                    <button
                        onClick={() => handleStatusUpdate(applicant._id, 'Hired')}
                        className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 transition duration-150 ease-in-out"
                    >
                        Mark Hired
                    </button>
                )}
                {applicant.status !== 'Rejected' && applicant.status !== 'Hired' && (
                    <button
                        onClick={() => handleStatusUpdate(applicant._id, 'Rejected')}
                        className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition duration-150 ease-in-out"
                    >
                        Mark Rejected
                    </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

ApplicantListPage.propTypes = {
  token: PropTypes.string.isRequired,
};

export default ApplicantListPage;