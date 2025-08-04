// frontend/src/components/JobPostForm.jsx
import React, { useState } from 'react';

function JobPostForm({ token, onJobPosted }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
    budget: '', 
    salaryMin: '',
    salaryMax: '',
    location: '',
    job_type: 'Full-time', 
    company_name: '',
    company_website: '',
    tags: '', 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const postData = {
      title: formData.title,
      description: formData.description,
      skills: formData.skills,
      location: formData.location,
      job_type: formData.job_type,
      company_name: formData.company_name,
      company_website: formData.company_website,
      tags: formData.tags,    
    };

    if (formData.budget) {
      postData.budget = parseFloat(formData.budget);
    }
    if (formData.salaryMin && formData.salaryMax) {
      postData.salary = {
        min: parseFloat(formData.salaryMin),
        max: parseFloat(formData.salaryMax),
      };
    } else if (formData.salaryMin) {
       postData.salary = { min: parseFloat(formData.salaryMin) };
    } else if (formData.salaryMax) {
       postData.salary = { max: parseFloat(formData.salaryMax) };
    }


    try {
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token, 
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          setError(data.errors.map(err => err.msg).join(', '));
        } else {
          throw new Error(data.msg || 'Failed to post job');
        }
      } else {
        setSuccess('Job posted successfully!');
        setFormData({
          title: '',
          description: '',
          skills: '',
          budget: '',
          salaryMin: '',
          salaryMax: '',
          location: '',
          job_type: 'Full-time',
          company_name: '',
          company_website: '',
          tags: '',
        });
        if (onJobPosted) {
          onJobPosted(); 
        }
      }
    } catch (err) {
      console.error('Job Post Error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Post a New Job</h3>

      {error && (
        <p className="text-red-600 mb-4 bg-red-100 p-2 rounded text-center">{error}</p>
      )}
      {success && (
        <p className="text-green-600 mb-4 bg-green-100 p-2 rounded text-center">{success}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1 text-left">Job Title</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="e.g., Senior React Developer"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 text-left">Job Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Provide a detailed description of the role..."
            value={formData.description}
            onChange={handleChange}
            rows="6"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            required
          ></textarea>
        </div>
        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1 text-left">Required Skills (comma-separated)</label>
          <input
            type="text"
            id="skills"
            name="skills"
            placeholder="e.g., JavaScript, Node.js, Express, MongoDB"
            value={formData.skills}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1 text-left">Budget (for contract, e.g., $5000)</label>
            <input
              type="number"
              id="budget"
              name="budget"
              placeholder="Optional budget for fixed-price contracts"
              value={formData.budget}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>
          <div className="col-span-1 md:col-span-2 text-center text-sm text-gray-500">
            OR
          </div>
          <div>
            <label htmlFor="salaryMin" className="block text-sm font-medium text-gray-700 mb-1 text-left">Salary Range (Min)</label>
            <input
              type="number"
              id="salaryMin"
              name="salaryMin"
              placeholder="e.g., $80000"
              value={formData.salaryMin}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>
          <div>
            <label htmlFor="salaryMax" className="block text-sm font-medium text-gray-700 mb-1 text-left">Salary Range (Max)</label>
            <input
              type="number"
              id="salaryMax"
              name="salaryMax"
              placeholder="e.g., $120000"
              value={formData.salaryMax}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1 text-left">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            placeholder="e.g., Remote, New York, NY"
            value={formData.location}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>

        <div>
          <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 mb-1 text-left">Job Type</label>
          <select
            id="job_type"
            name="job_type"
            value={formData.job_type}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Freelance">Freelance</option>
          </select>
        </div>

        <div>
          <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1 text-left">Company Name</label>
          <input
            type="text"
            id="company_name"
            name="company_name"
            placeholder="e.g., RizeOS Inc."
            value={formData.company_name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>

        <div>
          <label htmlFor="company_website" className="block text-sm font-medium text-gray-700 mb-1 text-left">Company Website</label>
          <input
            type="url"
            id="company_website"
            name="company_website"
            placeholder="e.g., https://www.rizeos.com"
            value={formData.company_website}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1 text-left">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            placeholder="e.g., DeFi, Blockchain, Remote"
            value={formData.tags}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
          disabled={loading}
        >
          {loading ? 'Posting Job...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
}

export default JobPostForm;