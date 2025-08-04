import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate, Outlet } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import WelcomePage from './components/WelcomePage';
import JobDetailsPage from './pages/JobDetailsPage';
import JobApplicantsPage from './components/dashboard/JobApplicantsPage';
import MyApplications from './components/dashboard/MyApplications';
import Navbar from './components/Navbar';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

const AuthenticatedLayout = ({ token, onLogout, userName, userId }) => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar
        onShowProfile={() => navigate('/dashboard/profile')}
        onShowJobs={() => navigate('/dashboard/jobs')}
        onShowPostJob={() => navigate('/dashboard/post-job')}
        onShowMyPostedJobs={() => navigate('/dashboard/my-posted-jobs')}
        onShowMyApplications={() => navigate('/dashboard/my-applications')}
        onLogout={onLogout}
        userName={userName}
      />
      <div className="pt-16 flex flex-grow">
        <Outlet context={{ token, onLogout, userId }} />
      </div>
    </>
  );
};

function AppContent() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const navigate = useNavigate();

  const getUserDataFromToken = (jwtToken) => {
    if (!jwtToken) return { name: 'Guest', id: null };
    try {
      const decoded = JSON.parse(atob(jwtToken.split('.')[1]));
      return {
        name: decoded.user.name ? decoded.user.name.split(' ')[0] : 'User',
        id: decoded.user.id || null
      };
    } catch (e) {
      return { name: 'User', id: null };
    }
  };

  const { name: userName, id: userId } = getUserDataFromToken(token);

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    navigate('/dashboard');
  };

  const handleRegisterSuccess = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
    alert('Logged out successfully!');
  };

  useEffect(() => {
    const currentPath = window.location.pathname;
    const publicPaths = ['/', '/login', '/register'];
    if (!token && !publicPaths.includes(currentPath)) {
      navigate('/login');
    }
  }, [token, navigate]);

  return (
    <Routes>
      <Route path="/" element={<WelcomePage onShowLogin={() => navigate('/login')} onShowRegister={() => navigate('/register')} />} />
      <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} onGoBack={() => navigate('/')} />} />
      <Route path="/register" element={<Register onRegisterSuccess={handleRegisterSuccess} onGoBack={() => navigate('/login')} />} />
      {token ? (
        <Route element={<AuthenticatedLayout token={token} onLogout={handleLogout} userName={userName} userId={userId} />}>
          <Route path="/dashboard/*" element={<Dashboard token={token} onLogout={handleLogout} />} />
          <Route path="/jobs/:id" element={<JobDetailsPage token={token} />} />
          <Route path="/dashboard/jobs/:jobId/applicants" element={<JobApplicantsPage token={token} />} />
          <Route path="/dashboard/my-applications" element={<MyApplications token={token} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}

function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);

  const wallets = React.useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    [network]
  );

  return (
    <Router>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <AppContent />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </Router>
  );
}

export default App;