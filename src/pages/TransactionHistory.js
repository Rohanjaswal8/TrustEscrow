import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const TransactionHistory = () => {
  const { account, escrows, getAllEscrows, contract, isConnected } = useWeb3();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all'); // all, sent, received

  useEffect(() => {
    let mounted = true;

    const loadAndProcessTransactions = async () => {
      if (!account || !isConnected) {
        setTransactions([]);
        setLoading(false);
        setError("Please connect your wallet first");
        return;
      }

      if (!contract) {
        setTransactions([]);
        setLoading(false);
        setError("Contract not initialized. Please make sure you're connected to the correct network.");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load escrows if they're not already loaded
        const loadedEscrows = await getAllEscrows();
        
        // Process transactions only if component is still mounted
        if (mounted && loadedEscrows) {
          const txs = loadedEscrows
            .filter(escrow => 
              escrow.buyer.toLowerCase() === account.toLowerCase() || 
              escrow.seller.toLowerCase() === account.toLowerCase()
            )
            .map(escrow => {
              const role = escrow.buyer.toLowerCase() === account.toLowerCase() ? 'Buyer' : 'Seller';
              return {
                id: escrow.id,
                counterparty: role === 'Buyer' ? escrow.seller : escrow.buyer,
                amount: ethers.formatEther(escrow.amount),
                status: ['Created', 'Funded', 'Released', 'Disputed', 'Refunded'][Number(escrow.status)],
                role,
                timestamp: escrow.createdAt
              };
            });

          setTransactions(txs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        }
      } catch (error) {
        console.error('Error loading transactions:', error);
        if (mounted) {
          setError('Failed to load transactions. Please try again.');
          toast.error('Error loading transactions');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAndProcessTransactions();

    return () => {
      mounted = false;
    };
  }, [account, contract, getAllEscrows, isConnected]);

  // Update URL when filter changes
  useEffect(() => {
    if (filter !== 'all') {
      setSearchParams({ filter });
    } else {
      setSearchParams({});
    }
  }, [filter, setSearchParams]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'sent') return tx.role === 'Buyer';
    if (filter === 'received') return tx.role === 'Seller';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Created': return 'bg-yellow-100 text-yellow-800';
      case 'Funded': return 'bg-blue-100 text-blue-800';
      case 'Released': return 'bg-green-100 text-green-800';
      case 'Disputed': return 'bg-red-100 text-red-800';
      case 'Refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600 text-center">Loading your transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <p className="text-gray-600 text-center mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-3xl font-extrabold text-gray-900">Transaction History</h2>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFilterChange('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFilterChange('sent')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  filter === 'sent'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Sent
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFilterChange('received')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  filter === 'received'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Received
              </motion.button>
            </div>
          </div>

          <div className="border-t border-gray-200">
            {filteredTransactions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-500 text-lg">No transactions found</p>
                <Link 
                  to="/create" 
                  className="mt-4 inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                >
                  Create New Escrow
                </Link>
              </motion.div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredTransactions.map((tx, index) => (
                  <motion.li
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={`/escrow/${tx.id}`}
                      className="block hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                              tx.role === 'Buyer' ? 'bg-red-100' : 'bg-green-100'
                            }`}>
                              {tx.role === 'Buyer' ? '↑' : '↓'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Escrow #{tx.id}
                              </p>
                              <p className="text-sm text-gray-500">
                                {tx.role === 'Buyer' ? 'To: ' : 'From: '}
                                {tx.counterparty.slice(0, 6)}...{tx.counterparty.slice(-4)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                              {tx.status}
                            </span>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {tx.amount} ETH
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(tx.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TransactionHistory; 