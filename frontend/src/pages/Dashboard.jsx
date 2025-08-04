import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';

import ProfileForm from '../components/ProfileForm';
import JobFeed from '../components/JobFeed';
import PostedJobsAndApplicants from '../components/dashboard/PostedJobsAndApplicants';
import MyApplications from '../components/dashboard/MyApplications';

import PostForm from '../components/dashboard/PostForm';
import PostFeed from '../components/dashboard/PostFeed';

import PostNewJob from '../components/dashboard/PostNewJob'; 



// Lazy load JobDetailsPage
const JobDetailsPage = lazy(() => import('./JobDetailsPage'));

function Dashboard({ token, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const fetchProfileSummary = async () => {
    if (!token) {
      setProfileError('No token provided. Please log in.');
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    setProfileError('');
    try {
      const response = await fetch('http://localhost:8000/api/profile/me', {
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 400 && data.msg === 'There is no profile for this user') {
          setUserProfile(null);
          if (location.pathname === '/dashboard/profile') {
             setShowProfileEdit(true);
          }
        } else {
          throw new Error(data.msg || 'Failed to fetch profile summary');
        }
      } else {
        setUserProfile(data);
        setShowProfileEdit(false);
      }
    } catch (err) {
      console.error('Fetch Profile Summary Error:', err.message);
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
        fetchProfileSummary();
    }
  }, [token, location.pathname]);

  const handleProfileUpdated = () => {
    setShowProfileEdit(false);
    fetchProfileSummary();
    navigate('/dashboard/profile');
  };

  const handleJobPosted = () => {
    alert('Job Posted Successfully! Check the Job Feed or My Posted Jobs.');
    navigate('/dashboard/my-posted-jobs'); 
  };

  const handlePostCreated = (newPostData) => {
    alert('Post created successfully!');
    navigate('/dashboard/community-feed'); 
  };

  const handleViewJobDetails = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  return (
    <div className="flex-grow container mx-auto p-4 flex">
      {/* Left Sidebar for Dashboard Navigation */}
      <div className="w-64 bg-white p-6 rounded-lg shadow-md mr-4 h-fit sticky top-24">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Dashboard</h3>
        <ul className="space-y-3">
          <li>
            <Link
              to="/dashboard/jobs"
              className={`block py-2 px-3 rounded-md transition duration-200 ${location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/jobs') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Job Feed
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/my-applications"
              className={`block py-2 px-3 rounded-md transition duration-200 ${location.pathname.startsWith('/dashboard/my-applications') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              My Applications
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/my-posted-jobs"
              className={`block py-2 px-3 rounded-md transition duration-200 ${location.pathname.startsWith('/dashboard/my-posted-jobs') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              My Posted Jobs
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/post-job"
              className={`block py-2 px-3 rounded-md transition duration-200 ${location.pathname.startsWith('/dashboard/post-job') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Post New Job
            </Link>
          </li>
          {/* Link to Create Post */}
          <li>
            <Link
              to="/dashboard/create-post"
              className={`block py-2 px-3 rounded-md transition duration-200 ${location.pathname.startsWith('/dashboard/create-post') ? 'bg-indigo-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Create Post
            </Link>
          </li>
          {/* Link to Community Feed */}
          <li>
            <Link
              to="/dashboard/community-feed"
              className={`block py-2 px-3 rounded-md transition duration-200 ${location.pathname.startsWith('/dashboard/community-feed') ? 'bg-indigo-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Community Feed
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/profile"
              className={`block py-2 px-3 rounded-md transition duration-200 ${location.pathname.startsWith('/dashboard/profile') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              My Profile
            </Link>
          </li>
        </ul>
      </div>

      {/* Main Content Area - takes remaining space */}
      <div className="flex-1">
        <Suspense fallback={<div className="text-center p-8 text-xl text-gray-700">Loading content...</div>}>
          <Routes>
            {/* These routes are specific to the /dashboard/* path */}
            <Route path="jobs" element={<JobFeed token={token} onViewJobDetails={handleViewJobDetails} />} />

            <Route path="profile" element={
              <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-8 md:p-10 my-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Profile</h3>
                {profileLoading ? (
                  <p className="text-center text-gray-700">Loading Profile Data...</p>
                ) : profileError ? (
                  <p className="text-red-600 text-center bg-red-100 p-2 rounded">{profileError}</p>
                ) : (
                  <>
                    {userProfile && !showProfileEdit && (
                      <div className="mb-8 text-left bg-gray-50 p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Profile Overview</h3>
                        <p className="mb-2"><span className="font-semibold">Name:</span> {userProfile?.name || 'Not set'}</p>
                        <p className="mb-2"><span className="font-semibold">Bio:</span> {userProfile?.bio || 'Not set'}</p>
                        <p className="mb-2"><span className="font-semibold">LinkedIn:</span> {userProfile?.linkedin_url ? <a href={userProfile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{userProfile.linkedin_url}</a> : 'Not set'}</p>
                        <p className="mb-2"><span className="font-semibold">Skills:</span> {userProfile?.skills?.length > 0 ? userProfile.skills.join(', ') : 'No skills added'}</p>
                        <p className="mb-2"><span className="font-semibold">Wallet:</span> {userProfile?.public_wallet_address || 'Not connected'}</p>
                      </div>
                    )}

                    {userProfile && !showProfileEdit && (
                      <button
                        onClick={() => setShowProfileEdit(true)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 mb-6"
                      >
                        Edit Profile
                      </button>
                    )}

                    {showProfileEdit || !userProfile ? (
                      <div className="mt-8 pt-8 border-t border-gray-200">
                        <ProfileForm
                          token={token}
                          onProfileUpdated={handleProfileUpdated}
                          initialProfileData={userProfile}
                          onCancelEdit={userProfile ? () => setShowProfileEdit(false) : null}
                        />
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            } />

            {/*  */}
            <Route path="post-job" element={
              <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-8 md:p-10 my-8">
                <PostNewJob token={token} onJobPosted={handleJobPosted} /> {/* Changed JobPostForm to PostNewJob */}
              </div>
            } />

            {/* NEW ROUTE FOR POST FORM */}
            <Route path="create-post" element={
              <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-8 md:p-10 my-8">
                <PostForm token={token} onPostCreated={handlePostCreated} />
              </div>
            } />

            {/* NEW ROUTE FOR COMMUNITY FEED */}
            <Route path="community-feed" element={
              <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-8 md:p-10 my-8">
                <PostFeed token={token} />
              </div>
            } />

            <Route path="my-posted-jobs" element={<PostedJobsAndApplicants token={token} />} />
            <Route path="my-applications" element={<MyApplications token={token} />} />

            {/*  */}
            <Route index element={<JobFeed token={token} onViewJobDetails={handleViewJobDetails} />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

export default Dashboard;