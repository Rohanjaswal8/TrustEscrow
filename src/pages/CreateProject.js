import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { FaUserShield, FaBalanceScale, FaEthereum, FaLock, FaHistory, FaExclamationCircle } from 'react-icons/fa';
import { validateEthereumAddress } from '../utils/contractTest';

const CreateProject = () => {
  const navigate = useNavigate();
  const { contract, account, escrows } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    seller: '',
    arbitrator: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Default arbitrator address (properly checksummed)
    amount: ''
  });
  const [previousAddresses, setPreviousAddresses] = useState({
    sellers: new Set(),
    arbitrators: new Set()
  });
  const [validationErrors, setValidationErrors] = useState({
    seller: '',
    arbitrator: ''
  });

  useEffect(() => {
    if (escrows && escrows.length > 0) {
      const sellers = new Set();
      const arbitrators = new Set();
      
      escrows.forEach(escrow => {
        if (escrow.seller) sellers.add(escrow.seller);
        if (escrow.arbitrator) arbitrators.add(escrow.arbitrator);
      });

      setPreviousAddresses({
        sellers: Array.from(sellers),
        arbitrators: Array.from(arbitrators)
      });
    }
  }, [escrows]);

  const validateForm = () => {
    const errors = {
      seller: '',
      arbitrator: ''
    };

    // Validate Ethereum address format using ethers
    const sellerAddress = validateEthereumAddress(formData.seller);
    const arbitratorAddress = validateEthereumAddress(formData.arbitrator);

    if (!sellerAddress) {
      errors.seller = 'Please enter a valid Ethereum address';
    }

    if (!arbitratorAddress) {
      errors.arbitrator = 'Please enter a valid Ethereum address';
    }

    // Check if seller is the same as buyer (current account)
    if (formData.seller.toLowerCase() === account.toLowerCase()) {
      errors.seller = 'Seller cannot be the same as buyer';
    }

    // Check if arbitrator is the same as buyer or seller
    if (formData.arbitrator.toLowerCase() === account.toLowerCase()) {
      errors.arbitrator = 'Arbitrator cannot be the same as buyer';
    }
    if (formData.arbitrator.toLowerCase() === formData.seller.toLowerCase()) {
      errors.arbitrator = 'Arbitrator cannot be the same as seller';
    }

    setValidationErrors(errors);
    return !errors.seller && !errors.arbitrator;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before proceeding
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setLoading(true);

    try {
      if (!contract) {
        throw new Error('Contract not initialized. Please connect your wallet first.');
      }

      if (!account) {
        throw new Error('No wallet connected. Please connect your wallet first.');
      }

      const amountInWei = ethers.parseEther(formData.amount.toString());
      
      console.log('Creating escrow with:', {
        seller: formData.seller,
        arbitrator: formData.arbitrator,
        amount: formData.amount,
        amountInWei: amountInWei.toString()
      });

      const tx = await contract.createEscrow(
        formData.seller,
        formData.arbitrator,
        { value: amountInWei }
      );

      toast.info('Transaction submitted! Waiting for confirmation...');
      await tx.wait();
      toast.success('Escrow created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating escrow:', error);
      
      // Provide more specific error messages
      if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient funds. Please check your MATIC balance.');
      } else if (error.message.includes('user rejected')) {
        toast.error('Transaction was cancelled by user.');
      } else if (error.message.includes('network')) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error(error.message || 'Failed to create escrow. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.4,
        delay: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-3xl mx-auto"
      >
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Create New Escrow
          </motion.h1>
          <motion.p 
            className="text-lg text-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Secure your transaction with our trusted escrow service
          </motion.p>
        </div>

        {/* Main Form Card */}
        <motion.div
          variants={formVariants}
          className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seller Address */}
              <div className="group">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FaUserShield className="w-5 h-5 mr-2 text-purple-500" />
                  Seller Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className={`w-full px-4 py-3 bg-white/5 border ${validationErrors.seller ? 'border-red-500' : 'border-gray-300'} rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300`}
                    placeholder="Enter seller's Ethereum address"
                    value={formData.seller}
                    onChange={(e) => {
                      setFormData({ ...formData, seller: e.target.value });
                      setValidationErrors({ ...validationErrors, seller: '' });
                    }}
                  />
                  {previousAddresses.sellers.length > 0 && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <button
                        type="button"
                        onClick={() => {
                          const lastUsedSeller = previousAddresses.sellers[previousAddresses.sellers.length - 1];
                          setFormData({ ...formData, seller: lastUsedSeller });
                          setValidationErrors({ ...validationErrors, seller: '' });
                        }}
                        className="text-purple-600 hover:text-purple-700 transition-colors"
                        title="Use last used seller address"
                      >
                        <FaHistory className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
                {validationErrors.seller && (
                  <div className="mt-2 flex items-center text-red-600 text-sm">
                    <FaExclamationCircle className="w-4 h-4 mr-1" />
                    {validationErrors.seller}
                  </div>
                )}
                {previousAddresses.sellers.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Previously used sellers:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {previousAddresses.sellers.map((address, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, seller: address });
                            setValidationErrors({ ...validationErrors, seller: '' });
                          }}
                          className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                        >
                          {address.slice(0, 6)}...{address.slice(-4)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Arbitrator Address */}
              <div className="group">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FaBalanceScale className="w-5 h-5 mr-2 text-purple-500" />
                  Arbitrator Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className={`w-full px-4 py-3 bg-white/5 border ${validationErrors.arbitrator ? 'border-red-500' : 'border-gray-300'} rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300`}
                    placeholder="Enter arbitrator's Ethereum address"
                    value={formData.arbitrator}
                    onChange={(e) => {
                      setFormData({ ...formData, arbitrator: e.target.value });
                      setValidationErrors({ ...validationErrors, arbitrator: '' });
                    }}
                  />
                  {previousAddresses.arbitrators.length > 0 && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <button
                        type="button"
                        onClick={() => {
                          const lastUsedArbitrator = previousAddresses.arbitrators[previousAddresses.arbitrators.length - 1];
                          setFormData({ ...formData, arbitrator: lastUsedArbitrator });
                          setValidationErrors({ ...validationErrors, arbitrator: '' });
                        }}
                        className="text-purple-600 hover:text-purple-700 transition-colors"
                        title="Use last used arbitrator address"
                      >
                        <FaHistory className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
                {validationErrors.arbitrator && (
                  <div className="mt-2 flex items-center text-red-600 text-sm">
                    <FaExclamationCircle className="w-4 h-4 mr-1" />
                    {validationErrors.arbitrator}
                  </div>
                )}
                {previousAddresses.arbitrators.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Previously used arbitrators:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {previousAddresses.arbitrators.map((address, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, arbitrator: address });
                            setValidationErrors({ ...validationErrors, arbitrator: '' });
                          }}
                          className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                        >
                          {address.slice(0, 6)}...{address.slice(-4)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className="group">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FaEthereum className="w-5 h-5 mr-2 text-purple-500" />
                  Amount in POL
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.000000000000000001"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter amount in POL"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    POL
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.div 
                className="mt-8"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg transform transition-all duration-300 ${
                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:from-purple-600 hover:to-pink-600'
                  }`}
                >
                  <FaLock className="w-5 h-5 mr-2" />
                  {loading ? 'Creating Escrow...' : 'Create Secure Escrow'}
                </button>
              </motion.div>
            </form>
          </div>
        </motion.div>

        {/* Info Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <FaLock className="w-8 h-8 text-purple-300 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Secure</h3>
            <p className="text-white/70">Your funds are protected by smart contracts</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <FaBalanceScale className="w-8 h-8 text-purple-300 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Fair</h3>
            <p className="text-white/70">Arbitrator ensures fair resolution</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <FaEthereum className="w-8 h-8 text-purple-300 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Efficient</h3>
            <p className="text-white/70">Fast and low-cost transactions</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CreateProject; 