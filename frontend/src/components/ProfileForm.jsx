import React, { useState, useEffect } from 'react';

function ProfileForm({ token, onProfileUpdated, initialProfileData, onCancelEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    linkedin_url: '',
    skills: '', 
    public_wallet_address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState([]);
  useEffect(() => {
    if (initialProfileData) {
      setFormData({
        name: initialProfileData.name || '',
        bio: initialProfileData.bio || '',
        linkedin_url: initialProfileData.linkedin_url || '',
        skills: Array.isArray(initialProfileData.skills) ? initialProfileData.skills.join(', ') : '',
        public_wallet_address: initialProfileData.public_wallet_address || '',
      });
    } else {
        setFormData({
            name: '',
            bio: '',
            linkedin_url: '',
            skills: '',
            public_wallet_address: '',
        });
    }
  }, [initialProfileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddSkill = (skill) => {
    const currentSkills = formData.skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== '');

    if (!currentSkills.includes(skill.toLowerCase())) {
        const newSkills = currentSkills.length > 0 ? `${currentSkills.join(', ')}, ${skill}` : skill;
        setFormData({ ...formData, skills: newSkills });
    }
  };

  const handleExtractSkills = async () => {
    if (!formData.bio || formData.bio.trim() === '') {
        setError('Please enter a bio to extract skills from.');
        return;
    }

    setIsExtracting(true);
    setError('');
    setSuccess('');
    setExtractedSkills([]);

    try {
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/extract-skills`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
            body: JSON.stringify({ text: formData.bio }),
        });
        
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.msg || 'Failed to extract skills.');
        }
        
        // The backend returns an array of skills
        setExtractedSkills(data);
        setSuccess('Skills extracted successfully! Review and click to add them below.');

    } catch (err) {
        console.error('Error extracting skills:', err.message);
        setError(err.message || 'Failed to extract skills.');
    } finally {
        setIsExtracting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const profileData = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== ''),
    };

    const method = initialProfileData ? 'PUT' : 'POST'; 
const url = initialProfileData ? `${import.meta.env.VITE_API_URL}/api/profile` : `${import.meta.env.VITE_API_URL}/api/profile`;
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          setError(data.errors.map(err => err.msg).join(', '));
        } else {
          throw new Error(data.msg || `Failed to ${initialProfileData ? 'update' : 'create'} profile`);
        }
      } else {
        setSuccess(`Profile ${initialProfileData ? 'updated' : 'created'} successfully!`);
        if (onProfileUpdated) {
          onProfileUpdated();
        }
      }
    } catch (err) {
      console.error('Profile Form Error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">{initialProfileData ? 'Edit Your Profile' : 'Create Your Profile'}</h3>

      {error && (
        <p className="text-red-600 mb-4 bg-red-100 p-2 rounded text-center">{error}</p>
      )}
      {success && (
        <p className="text-green-600 mb-4 bg-green-100 p-2 rounded text-center">{success}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 text-left">Your Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Your full name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            required
          />
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1 text-left">Bio</label>
          <textarea
            id="bio"
            name="bio"
            placeholder="Tell us about yourself or your company..."
            value={formData.bio}
            onChange={handleChange}
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          ></textarea>
           {/* --- NEW BUTTON FOR SKILL EXTRACTION --- */}
           <button
            type="button"
            onClick={handleExtractSkills}
            className={`mt-2 py-2 px-4 rounded-lg text-sm transition duration-300 ${isExtracting ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600 text-white'}`}
            disabled={isExtracting}
            >
            {isExtracting ? 'Extracting...' : 'Extract Skills from Bio'}
            </button>
            {/* --- END NEW BUTTON --- */}
        </div>
        
        {/* --- NEW UI FOR EXTRACTED SKILLS --- */}
        {extractedSkills.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="font-semibold text-gray-700 mb-2">Suggested Skills:</p>
                <div className="flex flex-wrap gap-2">
                    {extractedSkills.map((skill, index) => (
                        <span
                            key={index}
                            onClick={() => handleAddSkill(skill)}
                            className="cursor-pointer bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full hover:bg-blue-200 transition-colors duration-200"
                        >
                            + {skill}
                        </span>
                    ))}
                </div>
            </div>
        )}
        {/* --- END NEW UI --- */}

        <div>
          <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-1 text-left">LinkedIn Profile URL</label>
          <input
            type="url"
            id="linkedin_url"
            name="linkedin_url"
            placeholder="e.g., https://linkedin.com/in/yourprofile"
            value={formData.linkedin_url}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>
        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1 text-left">Skills (comma-separated)</label>
          <input
            type="text"
            id="skills"
            name="skills"
            placeholder="e.g., React, Node.js, Blockchain, Solidity"
            value={formData.skills}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>
        <div>
          <label htmlFor="public_wallet_address" className="block text-sm font-medium text-gray-700 mb-1 text-left">Public Wallet Address (Optional)</label>
          <input
            type="text"
            id="public_wallet_address"
            name="public_wallet_address"
            placeholder="e.g., 0x..."
            value={formData.public_wallet_address}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>

        <div className="flex justify-end gap-3">
            {onCancelEdit && ( 
                <button
                    type="button"
                    onClick={onCancelEdit}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
                    disabled={loading}
                >
                    Cancel
                </button>
            )}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
              disabled={loading}
            >
              {loading ? (initialProfileData ? 'Updating...' : 'Creating...') : (initialProfileData ? 'Update Profile' : 'Create Profile')}
            </button>
        </div>
      </form>
    </div>
  );
}

export default ProfileForm;