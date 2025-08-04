import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import JobCard from './JobCard';

function JobFeed({ token, onViewJobDetails }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [minSalaryFilter, setMinSalaryFilter] = useState('');
  const [maxSalaryFilter, setMaxSalaryFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const jobsPerPage = 10;

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'];

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      if (locationFilter) queryParams.append('location', locationFilter);
      if (jobTypeFilter) queryParams.append('jobType', jobTypeFilter);
      if (skillsFilter) queryParams.append('skills', skillsFilter);
      if (minSalaryFilter) queryParams.append('minSalary', minSalaryFilter);
      if (maxSalaryFilter) queryParams.append('maxSalary', maxSalaryFilter);

      queryParams.append('page', currentPage);
      queryParams.append('limit', jobsPerPage);

      const url = `${import.meta.env.VITE_API_URL}/api/jobs?${queryParams.toString()}`; 
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to fetch jobs');
      }

      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);

    } catch (err) {
      console.error('JobFeed: Error fetching jobs:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, locationFilter, jobTypeFilter, skillsFilter, minSalaryFilter, maxSalaryFilter, currentPage]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
   
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocationFilter(value);
    setCurrentPage(1);
  };

  const handleJobTypeChange = (e) => {
    const value = e.target.value;
    setJobTypeFilter(value);
    setCurrentPage(1);
  };

  const handleSkillsChange = (e) => {
    const value = e.target.value;
    setSkillsFilter(value);
    setCurrentPage(1);
  };

  const handleMinSalaryChange = (e) => {
    const value = e.target.value;
    setMinSalaryFilter(value);
    setCurrentPage(1);
  };

  const handleMaxSalaryChange = (e) => {
    const value = e.target.value;
    setMaxSalaryFilter(value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };


  if (loading) {
    return (
      <div className="p-8 text-center text-xl text-gray-700 min-h-[calc(100vh-100px)] flex items-center justify-center">
        Loading jobs...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-100 border border-red-400 text-red-700 rounded-md max-w-2xl mx-auto my-8">
        <p className="text-xl font-semibold mb-2">Error loading jobs</p>
        <p className="text-lg">{error}</p>
        <button
          onClick={fetchJobs}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 my-8">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Job Feed</h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Filter Jobs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="searchQuery" className="block text-gray-700 text-sm font-bold mb-2">Search (Title, Company, Description)</label>
            <input
              type="text"
              id="searchQuery"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., React Developer, Google"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div>
            <label htmlFor="locationFilter" className="block text-gray-700 text-sm font-bold mb-2">Location</label>
            <input
              type="text"
              id="locationFilter"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., New York, Remote"
              value={locationFilter}
              onChange={handleLocationChange}
            />
          </div>
          <div>
            <label htmlFor="jobTypeFilter" className="block text-gray-700 text-sm font-bold mb-2">Job Type</label>
            <select
              id="jobTypeFilter"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={jobTypeFilter}
              onChange={handleJobTypeChange}
            >
              <option value="">All Types</option>
              {jobTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="skillsFilter" className="block text-gray-700 text-sm font-bold mb-2">Skills (comma-separated)</label>
            <input
              type="text"
              id="skillsFilter"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., React, Node.js, AWS"
              value={skillsFilter}
              onChange={handleSkillsChange}
            />
          </div>
          <div className="flex gap-2">
            <div className="w-1/2">
              <label htmlFor="minSalaryFilter" className="block text-gray-700 text-sm font-bold mb-2">Min Salary</label>
              <input
                type="number"
                id="minSalaryFilter"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="e.g., 50000"
                value={minSalaryFilter}
                onChange={handleMinSalaryChange}
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="maxSalaryFilter" className="block text-gray-700 text-sm font-bold mb-2">Max Salary</label>
              <input
                type="number"
                id="maxSalaryFilter"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="e.g., 100000"
                value={maxSalaryFilter}
                onChange={handleMaxSalaryChange}
              />
            </div>
          </div>
        </div>
      </div>

      {jobs.length === 0 ? (
        <p className="text-gray-500 italic text-lg text-center p-4 bg-white rounded-lg shadow-md">No jobs found matching your criteria.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} onViewDetails={onViewJobDetails} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
          >
            Previous
          </button>
          <span className="text-lg text-gray-700">Page {currentPage} of {totalPages}</span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

JobFeed.propTypes = {
  token: PropTypes.string,
  onViewJobDetails: PropTypes.func.isRequired,
};

export default JobFeed;
