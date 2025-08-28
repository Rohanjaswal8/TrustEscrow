import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { ethers, formatEther } from 'ethers';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const ViewEscrow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contract, account, releaseFunds, raiseDispute, isConnected } = useWeb3();
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchEscrow = async () => {
      if (!contract || !isConnected) return;

      try {
        const details = await contract.getEscrowDetails(id);
        const escrowData = {
          buyer: details[0],
          seller: details[1],
          arbitrator: details[2],
          amount: details[3],
          status: Number(details[4]),
          ipfsHash: details[5]
        };
        setEscrow(escrowData);
      } catch (err) {
        console.error('Error fetching escrow details:', err);
        setError('Error fetching escrow details');
      } finally {
        setLoading(false);
      }
    };

    fetchEscrow();
  }, [contract, id, isConnected]);

  const handleReleaseFunds = async () => {
    setActionLoading(true);
    try {
      await releaseFunds(id);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRaiseDispute = async () => {
    setActionLoading(true);
    try {
      await raiseDispute(id, '');
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFundEscrow = async () => {
    setActionLoading(true);
    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }
      if (!escrow.amount || escrow.amount.toString() === '0') {
        throw new Error('Invalid escrow amount');
      }
      const tx = await contract.depositFunds(id, { value: escrow.amount });
      toast.info('Transaction submitted. Waiting for confirmation...');
      await tx.wait();
      toast.success('Escrow funded successfully!');

      const updatedDetails = await contract.getEscrowDetails(id);
      setEscrow({
        ...escrow,
        status: Number(updatedDetails[4])
      });
    } catch (err) {
      console.error('Error funding escrow:', err);
      setError(err.message || 'Failed to fund escrow');
      toast.error(err.message || 'Failed to fund escrow');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 1: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 2: return 'bg-green-100 text-green-800 border-green-200';
      case 3: return 'bg-red-100 text-red-800 border-red-200';
      case 4: return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    const statusNum = Number(status);
    switch (statusNum) {
      case 0: return 'Created (Unfunded)';
      case 1: return 'Funded';
      case 2: return 'Released';
      case 3: return 'Disputed';
      case 4: return 'Resolved';
      default: return 'Unknown';
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-2xl text-center">
          <h2 className="text-2xl font-bold text-gray-800">Please connect your wallet to view escrow details</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (!escrow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-2xl text-center">
          <h2 className="text-2xl font-bold text-gray-800">Escrow not found</h2>
        </div>
      </div>
    );
  }

  const isBuyer = account.toLowerCase() === escrow.buyer.toLowerCase();
  const isSeller = account.toLowerCase() === escrow.seller.toLowerCase();
  const isArbitrator = account.toLowerCase() === escrow.arbitrator.toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-2xl font-extrabold text-gray-900 mb-8">Escrow Details</h3>

            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </motion.div>
            )}

            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(Number(escrow?.status))}`}>
                    {getStatusText(Number(escrow?.status))}
                  </span>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Amount</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {escrow.amount ? formatEther(escrow.amount) : '0'} ETH
                  </span>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-lg border p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Buyer</span>
                    <span className="text-sm text-gray-900">{escrow.buyer}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Seller</span>
                    <span className="text-sm text-gray-900">{escrow.seller}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Arbitrator</span>
                    <span className="text-sm text-gray-900">{escrow.arbitrator}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8 flex justify-end space-x-4">
              
              {/* NEW: Fund button for buyer when status is 0 */}
              {isBuyer && Number(escrow?.status) === 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFundEscrow}
                  disabled={actionLoading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
                >
                  {actionLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Fund Escrow'
                  )}
                </motion.button>
              )}

              {isBuyer && Number(escrow?.status) === 1 && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleReleaseFunds} disabled={actionLoading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-200">
                  {actionLoading ? 'Processing...' : 'Release Funds'}
                </motion.button>
              )}

              {(isBuyer || isSeller) && Number(escrow?.status) === 1 && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleRaiseDispute} disabled={actionLoading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-200">
                  {actionLoading ? 'Processing...' : 'Raise Dispute'}
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ViewEscrow;
