import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';

import {
  useWallet,
  useConnection
} from '@solana/wallet-adapter-react';
import {
  WalletMultiButton,
  useWalletModal
} from '@solana/wallet-adapter-react-ui';
import {
  Transaction,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';

const PostNewJob = () => {
  const { token } = useOutletContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
    budget: '',
    salaryMin: '',
    salaryMax: '',
    location: '',
    jobType: '',
    companyName: '',
    companyWebsite: '',
    tags: '',
  });

  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { publicKey, connected, sendTransaction, connecting, disconnect } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();

  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentTxId, setPaymentTxId] = useState(null);

  const ADMIN_WALLET_ADDRESS = "9UP7m3Fx96x8GumBTHjCQX7AKK7hPapPNhSEuZYbeZdT";
  const PLATFORM_FEE_SOL = 0.01;

  const {
    title,
    description,
    skills,
    budget,
    salaryMin,
    salaryMax,
    location,
    jobType,
    companyName,
    companyWebsite,
    tags,
  } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePayFee = async () => {
    if (!connected) {
      setPaymentError('Please connect your Phantom wallet first.');
      setVisible(true);
      return;
    }
    if (!publicKey) {
      setPaymentError('Wallet public key not available. Please reconnect.');
      return;
    }
    if (ADMIN_WALLET_ADDRESS === "Your_Phantom_Wallet_Address_Here") {
      setPaymentError('ADMIN_WALLET_ADDRESS is not configured. Please set it in PostNewJob.jsx');
      return;
    }

    setPaymentInitiated(true);
    setPaymentError(null);
    setSuccessMessage(null);

    try {
      const adminPublicKey = new PublicKey(ADMIN_WALLET_ADDRESS);
      const lamportsToSend = PLATFORM_FEE_SOL * LAMPORTS_PER_SOL;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: adminPublicKey,
          lamports: lamportsToSend,
        })
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;
      transaction.feePayer = publicKey;

      console.log('Sending transaction:', transaction);

      const signature = await sendTransaction(transaction, connection);
      console.log('Transaction sent with signature:', signature);

      await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature
      });

      console.log('Transaction confirmed successfully!');
      setPaymentTxId(signature);
      setPaymentSuccessful(true);
      setPaymentInitiated(false);
      setSuccessMessage(`Payment of ${PLATFORM_FEE_SOL} SOL confirmed! Transaction ID: ${signature.substring(0, 10)}... You can now post the job.`);

    } catch (err) {
      console.error('Solana Payment Error:', err);
      setPaymentTxId(null);
      setPaymentSuccessful(false);
      setPaymentInitiated(false);
      let errorMessage = 'Failed to process payment.';
      if (err.message.includes('User rejected the request')) {
        errorMessage = 'Payment cancelled by user.';
      } else if (err.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient SOL funds in your wallet for the fee and gas.';
      } else if (err.code === 4001) {
        errorMessage = 'Payment rejected by wallet.';
      }
      setPaymentError(errorMessage);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setSuccessMessage(null);

    // FIX: Add validation for budget to prevent negative values
    if (budget && parseFloat(budget) < 0) {
      setFormError('Project budget cannot be a negative number.');
      setSubmitting(false);
      return;
    }
    
    // FIX: Add validation for min salary to prevent negative values
    if (salaryMin && parseFloat(salaryMin) < 0) {
      setFormError('Minimum salary cannot be a negative number.');
      setSubmitting(false);
      return;
    }

    if (!token) {
      setFormError('You are not authenticated. Please log in.');
      setSubmitting(false);
      return;
    }

    if (!paymentSuccessful || !paymentTxId) {
        setFormError('Please complete the blockchain payment before posting the job.');
        setSubmitting(false);
        return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      };

      const jobData = {
        title,
        description,
        skills: skills.split(',').map((s) => s.trim()),
        budget: budget ? parseFloat(budget) : undefined,
        salary:
          (salaryMin && salaryMax)
            ? { min: parseFloat(salaryMin), max: parseFloat(salaryMax) }
            : (salaryMin ? { min: parseFloat(salaryMin) } : (salaryMax ? { max: parseFloat(salaryMax) } : undefined)),
        location,
        job_type: jobType,
        company_name: companyName,
        company_website: companyWebsite,
        tags: tags.split(',').map((t) => t.trim()).filter(t => t !== ''),
        paymentTxId: paymentTxId,
        paymentStatus: 'confirmed'
      };

      const res = await axios.post(
        'http://localhost:8000/api/jobs',
        jobData,
        config
      );

      console.log('Job Posted:', res.data);
      setSuccessMessage('Job posted successfully!');
      setFormData({
        title: '', description: '', skills: '', budget: '', salaryMin: '',
        salaryMax: '', location: '', jobType: '', companyName: '',
        companyWebsite: '', tags: '',
      });
      setPaymentSuccessful(false);
      setPaymentTxId(null);
    } catch (err) {
      console.error('Error posting job:', err.response?.data || err.message);
      setFormError(
        err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Error posting job.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6 my-8 bg-white rounded-lg shadow-xl">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Post a New Job</h2>

      <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
        <h3 className="text-2xl font-bold text-blue-800 mb-4">Blockchain Payment</h3>
        {!connected ? (
          <div className="text-center">
            <p className="text-gray-700 mb-4">Connect your Phantom wallet to pay the platform fee and enable job posting.</p>
            <WalletMultiButton />
            {connecting && <p className="text-blue-600 mt-2">Connecting wallet...</p>}
            {paymentError && <p className="text-red-500 mt-2">{paymentError}</p>}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-green-700 mb-2 font-semibold">Wallet Connected: {publicKey.toBase58()}</p>
            <p className="text-gray-700 mb-4">Platform Fee: <span className="font-bold text-lg">{PLATFORM_FEE_SOL} SOL</span> (Devnet)</p>
            {!paymentSuccessful ? (
              <button
                type="button"
                onClick={handlePayFee}
                className={`w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 ${paymentInitiated ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={paymentInitiated}
              >
                {paymentInitiated ? 'Processing Payment...' : 'Pay Fee & Enable Post'}
              </button>
            ) : (
              <>
                <p className="text-green-600 font-semibold text-lg">Payment Confirmed!</p>
                {paymentTxId && (
                  <p className="text-sm text-gray-500 mt-1">
                    TX ID: <a href={`https://explorer.solana.com/tx/${paymentTxId}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {paymentTxId.substring(0, 10)}...{paymentTxId.substring(paymentTxId.length - 10)}
                    </a>
                  </p>
                )}
                <p className="text-green-600 font-semibold text-lg mt-2">You can now post your job.</p>
              </>
            )}
            {paymentError && <p className="text-red-500 mt-2">{paymentError}</p>}
            {connected && !paymentInitiated && (
                <button
                    type="button"
                    onClick={() => { disconnect(); setPaymentSuccessful(false); setPaymentTxId(null); }}
                    className="mt-4 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg text-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                    Disconnect Wallet
                </button>
            )}
          </div>
        )}
      </div>

      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {formError}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> {successMessage}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-1">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={onChange}
            placeholder="e.g., Senior Frontend Developer"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
            required
            disabled={!paymentSuccessful || submitting}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-lg font-medium text-gray-700 mb-1">
            Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={onChange}
            rows="6"
            placeholder="Detailed description of the role, responsibilities, and requirements."
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
            required
            disabled={!paymentSuccessful || submitting}
          ></textarea>
        </div>

        <div>
          <label htmlFor="skills" className="block text-lg font-medium text-gray-700 mb-1">
            Required Skills <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="skills"
            name="skills"
            value={skills}
            onChange={onChange}
            placeholder="e.g., React, Node.js, JavaScript, MongoDB (comma-separated)"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
            required
            disabled={!paymentSuccessful || submitting}
          />
        </div>

        <div>
          <label htmlFor="budget" className="block text-lg font-medium text-gray-700 mb-1">
            Project Budget (Optional, for projects)
          </label>
          <input
            type="number"
            id="budget"
            name="budget"
            value={budget}
            onChange={onChange}
            placeholder="e.g., 5000 (USD)"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
            min="0" // Added min attribute for browser validation
            disabled={!paymentSuccessful || submitting}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="salaryMin" className="block text-lg font-medium text-gray-700 mb-1">
              Minimum Salary (Optional)
            </label>
            <input
              type="number"
              id="salaryMin"
              name="salaryMin"
              value={salaryMin}
              onChange={onChange}
              placeholder="e.g., 50000"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
              min="0" // Added min attribute for browser validation
              disabled={!paymentSuccessful || submitting}
            />
          </div>
          <div>
            <label htmlFor="salaryMax" className="block text-lg font-medium text-gray-700 mb-1">
              Maximum Salary (Optional)
            </label>
            <input
              type="number"
              id="salaryMax"
              name="salaryMax"
              value={salaryMax}
              onChange={onChange}
              placeholder="e.g., 80000"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
              min="0" // min attribute is also good practice here
              disabled={!paymentSuccessful || submitting}
            />
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-lg font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={location}
            onChange={onChange}
            placeholder="e.g., New York, Remote"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
            disabled={!paymentSuccessful || submitting}
          />
        </div>

        <div>
          <label htmlFor="jobType" className="block text-lg font-medium text-gray-700 mb-1">
            Job Type
          </label>
          <select
            id="jobType"
            name="jobType"
            value={jobType}
            onChange={onChange}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
            disabled={!paymentSuccessful || submitting}
          >
            <option value="">Select Job Type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Freelance">Freelance</option>
          </select>
        </div>

        <div>
          <label htmlFor="companyName" className="block text-lg font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={companyName}
            onChange={onChange}
            placeholder="e.g., Acme Corp"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
            disabled={!paymentSuccessful || submitting}
          />
        </div>

        <div>
          <label htmlFor="companyWebsite" className="block text-lg font-medium text-gray-700 mb-1">
            Company Website
          </label>
          <input
            type="url"
            id="companyWebsite"
            name="companyWebsite"
            value={companyWebsite}
            onChange={onChange}
            placeholder="e.g., https://www.acmecorp.com"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
            disabled={!paymentSuccessful || submitting}
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-lg font-medium text-gray-700 mb-1">
            Tags (Optional, comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={tags}
            onChange={onChange}
            placeholder="e.g., Web3, Blockchain, Decentralized Finance"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
            disabled={!paymentSuccessful || submitting}
          />
        </div>

        <button
          type="submit"
          className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg text-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 ${(!paymentSuccessful || submitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!paymentSuccessful || submitting}
        >
          {submitting ? 'Posting Job...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
};

export default PostNewJob;