import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaShieldAlt, FaUserShield, FaHandshake, FaChartLine, FaLock, FaBalanceScale, FaBolt, FaClock, FaGithub, FaTwitter, FaDiscord, FaLinkedin, FaWallet, FaTimes, FaCheckCircle, FaExclamationTriangle, FaBook, FaQuestionCircle } from 'react-icons/fa';

const Home = () => {
  const { contract, isConnected, account, escrows, getAllEscrows, connectWallet } = useWeb3();
  const [loading, setLoading] = useState(true);
  const [showHelpDialog, setShowHelpDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!contract || !isConnected) {
        console.log('Contract or connection not available', { contract: !!contract, isConnected });
        setLoading(false);
        return;
      }

      try {
        await getAllEscrows();
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, [contract, isConnected, getAllEscrows, escrows]);

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return 'bg-yellow-100 text-yellow-800'; // Created
      case 1: return 'bg-blue-100 text-blue-800';   // Funded
      case 2: return 'bg-green-100 text-green-800'; // Released
      case 3: return 'bg-red-100 text-red-800';    // Disputed
      case 4: return 'bg-purple-100 text-purple-800'; // Refunded
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'Created';
      case 1: return 'Funded';
      case 2: return 'Released';
      case 3: return 'Disputed';
      case 4: return 'Refunded';
      default: return 'Unknown';
    }
  };

  const features = [
    {
      icon: <FaShieldAlt className="h-6 w-6" />,
      title: "Secure Transactions",
      description: "Your funds are protected by smart contracts on the blockchain"
    },
    {
      icon: <FaUserShield className="h-6 w-6" />,
      title: "Trusted Arbitration",
      description: "Professional arbitrators to resolve any disputes"
    },
    {
      icon: <FaHandshake className="h-6 w-6" />,
      title: "Easy to Use",
      description: "Simple interface for both buyers and sellers"
    },
    {
      icon: <FaChartLine className="h-6 w-6" />,
      title: "Real-time Updates",
      description: "Track your transactions status in real-time"
    }
  ];

  const benefits = [
    {
      icon: <FaLock className="h-8 w-8 text-indigo-500" />,
      title: "Maximum Security",
      description: "Smart contracts ensure your funds are secure until conditions are met"
    },
    {
      icon: <FaBalanceScale className="h-8 w-8 text-purple-500" />,
      title: "Fair Trading",
      description: "Equal protection for both buyers and sellers"
    },
    {
      icon: <FaBolt className="h-8 w-8 text-yellow-500" />,
      title: "Fast Processing",
      description: "Quick transaction processing and settlement"
    },
    {
      icon: <FaClock className="h-8 w-8 text-green-500" />,
      title: "24/7 Availability",
      description: "Access your escrow services anytime, anywhere"
    }
  ];

  const handleCloseHelp = () => {
    setShowHelpDialog(false);
  };

  const HelpDialog = () => (
    <AnimatePresence>
      {showHelpDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl relative"
          >
            <button
              onClick={handleCloseHelp}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">How to Connect Wallet</h2>
              <p className="text-gray-600">Follow these simple steps to get started</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <p className="text-gray-600">
                  Install MetaMask browser extension if you haven't already
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <p className="text-gray-600">
                  Click the "Connect Wallet" button in the top right corner
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <p className="text-gray-600">
                  Make sure you're connected to Hardhat Network (Polygon)
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100">
                  <span className="text-blue-600 font-semibold">4</span>
                </div>
                <p className="text-gray-600">
                  Approve the connection request in MetaMask
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleCloseHelp}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <HelpDialog />
        <button
          onClick={() => setShowHelpDialog(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-110 hover:shadow-blue-500/50 z-40 group"
        >
          <div className="relative">
            <FaQuestionCircle className="text-3xl" />
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
          </div>
          <span className="absolute -top-12 right-0 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            How to Connect?
          </span>
        </button>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-extrabold text-white sm:text-6xl md:text-7xl"
            >
              <span className="block">Secure Escrow</span>
              <span className="block text-yellow-300 mt-2">For Digital Transactions</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 max-w-lg mx-auto text-xl text-white/90 sm:max-w-3xl"
            >
              Connect your wallet to start using the most secure and transparent escrow service on the blockchain.
            </motion.p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-white/30"></div>
          </div>
        </div>
      </div>
    );
  }

  const renderEscrowCard = (escrow) => (
    <motion.div
      key={escrow.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-sm rounded-lg p-6 transform transition-all duration-300 ease-in-out hover:-translate-y-3 hover:shadow-2xl hover:bg-white/20"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-white transition-all duration-300 ease-in-out group-hover:text-yellow-300">
            Escrow #{escrow.id}
          </h3>
          <p className="text-sm text-white/60">
            Amount: {ethers.formatEther(escrow.amount)} ETH
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(escrow.status)}`}>
          {getStatusText(escrow.status)}
        </span>
      </div>
      <div className="space-y-2 text-sm text-white/80">
        <p>Buyer: {escrow.buyer.slice(0, 6)}...{escrow.buyer.slice(-4)}</p>
        <p>Seller: {escrow.seller.slice(0, 6)}...{escrow.seller.slice(-4)}</p>
        <p>Arbitrator: {escrow.arbitrator.slice(0, 6)}...{escrow.arbitrator.slice(-4)}</p>
      </div>
      <Link
        to={`/escrow/${escrow.id}`}
        className="mt-4 inline-block w-full px-4 py-2 bg-white/10 text-white rounded-lg text-center transform transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:bg-white/30"
      >
        View Details
      </Link>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <HelpDialog />
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl"
          >
            <span className="block">Welcome to TrustEscrow</span>
            <span className="block text-yellow-300 mt-2">Your Secure Transaction Partner</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-w-lg mx-auto text-xl text-white/90 sm:max-w-3xl"
          >
            Experience secure, transparent, and efficient digital transactions with our blockchain-powered escrow service.
          </motion.p>
          {/* Hero Section Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link
              to="/create"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-lg font-medium rounded-lg text-indigo-700 bg-yellow-300 hover:bg-yellow-400 transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl active:translate-y-0 active:shadow-lg"
            >
              Create New Escrow
            </Link>
            <Link
              to="/documentation"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-lg font-medium rounded-lg text-white hover:bg-white/10 transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl active:translate-y-0 active:shadow-lg"
            >
              Learn More
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/10 backdrop-blur-sm py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">Key Features</h2>
            <p className="mt-4 text-lg text-white/80">Everything you need for secure trading</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.05,
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-lg p-6 shadow-lg cursor-pointer hover:shadow-2xl transform-gpu transition-all duration-300 ease-in-out hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50"
              >
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white transform transition-transform duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-6">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-2 transition-all duration-300 ease-in-out group-hover:text-indigo-600 group-hover:scale-105">{feature.title}</h3>
                <p className="text-gray-600 text-center transition-all duration-300 group-hover:text-indigo-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Escrows Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white">Recent Escrows</h2>
            <p className="mt-4 text-lg text-white/80">Latest escrow transactions on our platform</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {escrows && escrows.length > 0 ? (
              escrows.map(renderEscrowCard)
            ) : (
              <div className="col-span-full text-center text-white/80">
                No escrows found. Create your first escrow to get started!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white/10 backdrop-blur-sm py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white">Why Choose Us</h2>
            <p className="mt-4 text-lg text-white/80">Benefits that set us apart</p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.05,
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-lg p-6 shadow-lg cursor-pointer transform-gpu transition-all duration-300 ease-in-out hover:shadow-2xl hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-indigo-100/50 group-hover:to-purple-100/50 rounded-lg transition-all duration-300 ease-in-out"></div>
                <div className="relative">
                  <div className="flex justify-center mb-4">
                    <div className="transform transition-all duration-300 ease-in-out text-indigo-500 group-hover:scale-125 group-hover:rotate-6">
                      {benefit.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 text-center mb-2 transition-all duration-300 ease-in-out group-hover:text-indigo-600 group-hover:scale-105">{benefit.title}</h3>
                  <p className="text-gray-600 text-center transition-all duration-300 group-hover:text-indigo-500">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  <span className="block">Ready to get started?</span>
                  <span className="block text-yellow-300">Create your first escrow today.</span>
                </h2>
                <p className="mt-4 text-lg text-white/90">
                  Join thousands of users who trust our platform for secure transactions.
                </p>
              </div>
              <div className="mt-8 lg:mt-0 lg:ml-8">
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                  <Link
                    to="/create"
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-lg font-medium rounded-lg text-indigo-700 bg-yellow-300 hover:bg-yellow-400 transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl active:translate-y-0"
                  >
                    Create Escrow
                  </Link>
                  <Link
                    to="/documentation"
                    className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-lg font-medium rounded-lg text-white hover:bg-white/10 transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl active:translate-y-0"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-4">TrustEscrow</h3>
              <p className="text-white/80 mb-4 max-w-md">
                Secure, transparent, and efficient blockchain-powered escrow service for all your digital transactions.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="https://github.com/Rohanjaswal8" 
                  className="text-white/80 hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                >
                  <FaGithub className="h-6 w-6" />
                </a>
                
                 
                <a 
                  href="www.linkedin.com/in/rohan-jaswal8" 
                  className="text-white/80 hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                >
                  <FaLinkedin className="h-6 w-6" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/create" 
                    className="text-white/80 hover:text-white transition-all duration-300 transform hover:-translate-y-1 inline-block"
                  >
                    Create Escrow
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/documentation" 
                    className="text-white/80 hover:text-white transition-all duration-300 transform hover:-translate-y-1 inline-block"
                  >
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/documentation#faq" className="text-white/80 hover:text-white transition-colors">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link to="/documentation#guides" className="text-white/80 hover:text-white transition-colors">
                    User Guides
                  </Link>
                </li>
                <li>
                 <Link to="/documentation#Support" className="text-white/80 hover:text-white transition-colors">
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-center text-white/60">
              © {new Date().getFullYear()} TrustEscrow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 