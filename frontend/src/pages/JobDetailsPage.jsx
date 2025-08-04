// frontend/src/pages/JobDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function JobDetailsPage({ token }) {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  const [coverLetter, setCoverLetter] = useState('');
  const [resumeLink, setResumeLink] = useState('');

  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const headers = {};
        if (token) {
            headers['x-auth-token'] = token;
        }

const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs/${id}`, {
            headers,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.msg || 'Failed to fetch job details');
        }
        
        setJob(data.job);
      } catch (err) {
        console.error('Fetch Job Details Error:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJobDetails();
    }
  }, [id, token]);

  const handleApply = async () => {
    setApplying(true);
    setApplyError('');
    setApplySuccess(false);

    if (!coverLetter.trim()) {
      setApplyError('Please provide a cover letter.');
      setApplying(false);
      return;
    }

    try {
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          jobId: id,
          coverLetter: coverLetter,
          resume: resumeLink,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.msg === 'You have already applied for this job') {
            throw new Error('You have already applied for this job.');
        }
        throw new Error(data.msg || 'Failed to submit application');
      }

      setApplySuccess(true);
      setCoverLetter('');
      setResumeLink('');
    } catch (err) {
      console.error('Apply Error:', err.message);
      setApplyError(err.message);
    } finally {
      setApplying(false);
    }
  };

  const getCompensationDisplay = (jobData) => {
    let display = 'Not specified';
    if (jobData.budget) {
      if (typeof jobData.budget === 'number') {
        display = `$${jobData.budget.toLocaleString()}`;
      } else {
        display = `$${jobData.budget}`;
      }
    } else if (jobData.salary) {
      const min = typeof jobData.salary.min === 'number' ? jobData.salary.min.toLocaleString() : null;
      const max = typeof jobData.salary.max === 'number' ? jobData.salary.max.toLocaleString() : null;
      if (min && max) {
        display = `$${min} - $${max}`;
      } else if (min) {
        display = `$${min}`;
      } else if (max) {
        display = `$${max}`;
      }
    }
    return display;
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading job details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 mx-auto my-8 max-w-lg rounded-lg shadow-md">
        <p className="text-red-600 text-xl font-semibold mb-4">{error}</p>
        <Link to="/dashboard/jobs" className="mt-4 text-blue-600 hover:underline text-lg">Back to Job Feed</Link>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center p-8 bg-gray-50 mx-auto my-8 max-w-lg rounded-lg shadow-md">
        <p className="text-gray-700 text-xl font-semibold mb-4">Job not found.</p>
        <Link to="/dashboard/jobs" className="mt-4 text-blue-600 hover:underline text-lg">Back to Job Feed</Link>
      </div>
    );
  }

  const compensation = getCompensationDisplay(job);

  return (
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-8 md:p-10 mx-auto my-8">
      <Link to="/dashboard/jobs" className="text-blue-600 hover:underline mb-6 inline-flex items-center">
        <i className="fas fa-arrow-left mr-2"></i> Back to Job Feed
      </Link>

      <h1 className="text-4xl font-extrabold text-gray-900 mb-2 mt-4">{job.title || 'Job Title Not Available'}</h1>
      {job.company_name && (
        <p className="text-xl text-gray-700 mb-4 flex items-center">
          <i className="fas fa-building mr-2 text-gray-500"></i>{job.company_name}
          {job.company_website && (
            <a href={job.company_website} target="_blank" rel="noopener noreferrer" className="ml-3 text-blue-600 hover:underline text-base">
              (Visit Website)
            </a>
          )}
        </p>
      )}

      <div className="flex flex-wrap items-center text-gray-700 text-lg mb-6 gap-x-6 gap-y-2 py-3 border-t border-b border-gray-200">
        {job.location && (
          <span className="flex items-center">
            <i className="fas fa-map-marker-alt text-gray-500 mr-2"></i> {job.location}
          </span>
        )}
        {job.job_type && (
          <span className="flex items-center">
            <i className="fas fa-briefcase text-gray-500 mr-2"></i> {job.job_type}
          </span>
        )}
        <span className="flex items-center text-green-700 font-semibold">
          <i className="fas fa-money-bill-wave text-green-500 mr-2"></i> {compensation}
        </span>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3 border-b pb-2">Job Description</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description || 'No description provided.'}</p>
      </div>

      {job.responsibilities && Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3 border-b pb-2">Responsibilities</h2>
          <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
            {job.responsibilities.map((resp, index) => (
              <li key={index}>{resp}</li>
            ))}
          </ul>
        </div>
      )}

      {job.requirements && Array.isArray(job.requirements) && job.requirements.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3 border-b pb-2">Requirements</h2>
          <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
            {job.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      )}

      {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3 border-b pb-2">Required Skills</h2>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {job.tags && Array.isArray(job.tags) && job.tags.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3 border-b pb-2">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag, index) => (
              <span key={index} className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500 mt-8 text-right border-t pt-4">
        Posted by: <span className="font-semibold">{job.user?.name || 'Unknown User'}</span> on{' '}
        {job.date ? new Date(job.date).toLocaleDateString() : 'N/A'}
      </p>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">Apply for this Job</h3>

        {applySuccess && (
          <p className="text-green-600 bg-green-100 p-3 rounded-lg text-center mb-4 font-medium">Application Submitted Successfully!</p>
        )}
        {applyError && (
          <p className="text-red-600 bg-red-100 p-3 rounded-lg text-center mb-4 font-medium">{applyError}</p>
        )}

        {job.application_url ? (
          <div className="text-center">
            <a
              href={job.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-md text-lg font-semibold transition duration-300 ease-in-out shadow-lg"
            >
              Apply Via External Link
              <i className="fas fa-external-link-alt ml-3"></i>
            </a>
          </div>
        ) : (
          <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
            <div className="mb-4">
              <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">Cover Letter / Why you're a good fit:</label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                rows="6"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell us why you're interested in this role and what makes you a great candidate..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 resize-y"
                required
                disabled={applying || applySuccess}
              ></textarea>
            </div>

            <div className="mb-6">
              <label htmlFor="resumeLink" className="block text-sm font-medium text-gray-700 mb-2">Resume Link (e.g., Google Drive, Dropbox, Portfolio link):</label>
              <input
                type="url"
                id="resumeLink"
                name="resumeLink"
                value={resumeLink}
                onChange={(e) => setResumeLink(e.target.value)}
                placeholder="e.g., https://yourdomain.com/resume.pdf"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                disabled={applying || applySuccess}
              />
              <p className="text-sm text-gray-500 mt-1 italic">If you don't have a direct link, you can explain how to access it in your cover letter.</p>
            </div>

            <button
              onClick={handleApply}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md text-lg font-semibold transition duration-300 ease-in-out w-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={applying || applySuccess}
            >
              {applying ? 'Submitting Application...' : (applySuccess ? 'Applied!' : 'Submit Application')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobDetailsPage;