/* global BigInt */
import React, { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatEther } from 'ethers';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEscrows: 0,
    activeEscrows: 0,
    completedEscrows: 0,
    disputedEscrows: 0,
    totalValue: 0n
  });
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const { account, contract, escrows, getAllEscrows, loading: web3Loading, error: web3Error } = useWeb3();
  const navigate = useNavigate();
  const [recentActivity, setRecentActivity] = useState([]);
  const [transactionLoading, setTransactionLoading] = useState(false);

  const calculateStats = useCallback((escrows) => {
    if (!Array.isArray(escrows)) {
      setStats({
        totalEscrows: 0,
        activeEscrows: 0,
        completedEscrows: 0,
        disputedEscrows: 0,
        totalValue: 0n
      });
      return;
    }

    const newStats = escrows.reduce((acc, escrow) => {
      acc.totalEscrows++;
      acc.totalValue += BigInt(escrow.amount || 0);

      switch (Number(escrow.status)) {
        case 0:
        case 1:
          acc.activeEscrows++;
          break;
        case 2:
          acc.completedEscrows++;
          break;
        case 3:
          acc.disputedEscrows++;
          break;
        default:
          break;
      }
      return acc;
    }, {
      totalEscrows: 0,
      activeEscrows: 0,
      completedEscrows: 0,
      disputedEscrows: 0,
      totalValue: 0n
    });

    setStats(newStats);
  }, []);

  const calculateRecentActivity = useCallback((escrows) => {
    if (!escrows || !Array.isArray(escrows) || !account) {
      setRecentActivity([]);
      return;
    }

    try {
      const activity = escrows
        .map((escrow, index) => {
          let status = 'Unknown';
          try {
            switch (Number(escrow.status)) {
              case 0: status = 'Created'; break;
              case 1: status = 'Funded'; break;
              case 2: status = 'Released'; break;
              case 3: status = 'Disputed'; break;
              case 4: status = 'Refunded'; break;
            }
          } catch (err) {
            console.error('Error mapping status:', err);
          }

          let amount = '0';
          try {
            amount = formatEther(escrow.amount || '0');
          } catch (e) {
            console.error('Error formatting amount:', e);
          }

          // Use current time as fallback since contract doesn't provide timestamps
          const timestamp = Date.now() - (index * 60000); // Simulate different times

          return {
            id: escrow.id || index,
            type: account.toLowerCase() === (escrow.buyer || '').toLowerCase() ? 'Sent' : 'Received',
            amount,
            status,
            timestamp
          };
        })
        .sort((a, b) => b.timestamp - a.timestamp);

      setRecentActivity(activity);
    } catch (err) {
      console.error('Error calculating activity:', err);
      setError('Failed to calculate recent activity');
      setRecentActivity([]);
    }
  }, [selectedPeriod, account]);

  const fetchAndUpdateData = useCallback(async () => {
    if (!account || !contract) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedEscrows = await getAllEscrows();
      
      if (Array.isArray(fetchedEscrows)) {
        calculateStats(fetchedEscrows);
        calculateRecentActivity(fetchedEscrows);
      } else {
        console.error('Invalid escrows data:', fetchedEscrows);
        setError('Invalid data received from the contract');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [account, contract, getAllEscrows, calculateStats, calculateRecentActivity]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!web3Loading && account && contract && mounted) {
        await fetchAndUpdateData();
      } else if (!web3Loading && mounted) {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [web3Loading, account, contract, fetchAndUpdateData]);

  const handleCardClick = useCallback((type) => {
    navigate(`/transactions?filter=${type}`);
  }, [navigate]);

  if (web3Loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-6 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connecting to Wallet</h2>
              <p className="text-gray-600">Please wait while we connect to your wallet...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contract || web3Error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-6 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-red-100 rounded-full p-4 mb-4">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contract Connection Error</h2>
              <p className="text-gray-600 mb-6 max-w-md">
                {web3Error || "No contract found at the specified address. Please check if the contract is deployed."}
              </p>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Please make sure:</p>
                <ul className="text-sm text-gray-500 list-disc list-inside space-y-2">
                  <li>Your wallet is connected to the correct network</li>
                  <li>The smart contract is deployed and accessible</li>
                  <li>You have the correct contract address configured</li>
                </ul>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-6 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-yellow-100 rounded-full p-4 mb-4">
                <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-6">
                Please connect your wallet to access the dashboard.
              </p>
              <button
                onClick={() => window.ethereum.request({ method: 'eth_requestAccounts' })}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCardClick('total')}
            className="bg-gradient-to-br from-indigo-500 to-blue-600 p-6 rounded-xl shadow-lg cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Total Escrows</h3>
            <p className="text-3xl font-bold text-white">{stats.totalEscrows}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCardClick('active')}
            className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Active Escrows</h3>
            <p className="text-3xl font-bold text-white">{stats.activeEscrows}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCardClick('completed')}
            className="bg-gradient-to-br from-purple-500 to-violet-600 p-6 rounded-xl shadow-lg cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Completed</h3>
            <p className="text-3xl font-bold text-white">{stats.completedEscrows}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCardClick('disputed')}
            className="bg-gradient-to-br from-red-500 to-pink-600 p-6 rounded-xl shadow-lg cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Disputed</h3>
            <p className="text-3xl font-bold text-white">{stats.disputedEscrows}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Network Statistics</h2>
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Value Locked</h3>
                  <p className="text-2xl font-bold text-indigo-600">{formatEther(stats.totalValue || '0')} POL</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Success Rate</h3>
                  <p className="text-2xl font-bold text-emerald-600">
                    {stats.totalEscrows > 0 
                      ? Math.round((stats.completedEscrows / stats.totalEscrows) * 100)
                      : 0}%
                  </p>
                </div>

                <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Connected Wallet</h3>
                  <p className="text-xs text-gray-500 break-all">{account}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Network Status</span>
                    <span className="text-sm font-medium text-green-600">Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Time</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                </select>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={fetchAndUpdateData}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentActivity.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item.type === 'Sent' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            <span className={item.type === 'Sent' ? 'text-blue-600' : 'text-green-600'}>
                              {item.type === 'Sent' ? '↑' : '↓'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.type} Escrow #{item.id}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(item.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{item.amount} ETH</p>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            item.status === 'Active' ? 'bg-yellow-100 text-yellow-800' :
                            item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            item.status === 'Released' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No recent activity</p>
                  <Link
                    to="/create"
                    className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Create Your First Escrow
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {transactionLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl max-w-sm w-full mx-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
            <p className="text-center mt-4 text-gray-700 font-medium">Processing transaction...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 