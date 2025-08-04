// frontend/src/components/JobCard.jsx
import React from 'react';

function JobCard({ job, onViewDetails }) {
  if (!job) {
    console.warn("JobCard received a null or undefined job prop.");
    return null;
  }

  const jobLocation = job.location || 'Unknown Location';
  const jobTypeDisplay = [jobLocation, job.job_type].filter(Boolean).join(' | ');

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

  const compensation = getCompensationDisplay(job);

  return (
    <div className="w-full bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col md:flex-row md:items-center justify-between border border-gray-200">
      {/*  Main Job Details */}
      <div className="flex-grow mb-4 md:mb-0">
        {}
        <div className="flex items-center mb-2">
            {job.company_logo_url && ( 
                <img src={job.company_logo_url} alt={`${job.company_name || 'Company'} Logo`} className="h-10 w-10 object-contain rounded-full mr-3" />
            )}
            <div>
                <h3 className="text-xl font-bold text-indigo-700 leading-tight">
                    {job.title || 'Job Title Not Available'}
                </h3>
                <p className="text-gray-600 text-sm">{job.company_name || 'Company Not Specified'}</p>
            </div>
        </div>

        {/* Location | Type | Compensation */}
        <div className="flex items-center text-gray-700 text-sm mb-2">
            <span className="flex items-center mr-4">
                <i className="fas fa-map-marker-alt text-gray-500 mr-1"></i> {jobLocation}
            </span>
            <span className="flex items-center mr-4">
                <i className="fas fa-briefcase text-gray-500 mr-1"></i> {job.job_type || 'N/A'}
            </span>
            <span className="flex items-center text-green-700 font-semibold">
                <i className="fas fa-money-bill-wave text-green-500 mr-1"></i> {compensation}
            </span>
        </div>

        {/* Skills (showing first few for quick glance) */}
        {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.skills.slice(0, 3).map((skill, i) => ( 
              <span
                key={i}
                className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full">
                +{job.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right/Bottom Section: Posted Date and View Details Button */}
      <div className="flex flex-col items-start md:items-end mt-4 md:mt-0 md:ml-6">
        <span className="text-xs text-gray-500 mb-3 md:mb-4">Posted on {job.date ? new Date(job.date).toLocaleDateString() : 'N/A'}</span>
        <button
          onClick={() => onViewDetails(job._id)} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md text-sm font-medium transition duration-300 ease-in-out"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default JobCard;