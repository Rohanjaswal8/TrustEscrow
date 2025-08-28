import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBook, FaQuestionCircle, FaShieldAlt, FaHeadset, FaTimes, FaChevronRight, FaSearch } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SupportForm from '../components/SupportForm';

const Documentation = () => {
  const [activeTab, setActiveTab] = useState('guides');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const guides = [
    {
      id: 1,
      title: 'Getting Started',
      icon: '🚀',
      content: `
        Quick Start Guide:
        
        1. Connect Your Wallet
           • Install MetaMask or any Web3 wallet
           • Connect to the application
           • Ensure you're on the correct network
        
        2. Create an Escrow
           • Click "Create New Escrow"
           • Enter seller's wallet address
           • Specify amount and arbitrator
           • Confirm transaction
        
        3. Monitor & Manage
           • Track status in Dashboard
           • Receive notifications
           • Take actions when needed
      `
    },
    {
      id: 2,
      title: 'Using Escrow Service',
      icon: '🔒',
      content: `
        Understanding the Process:
        
        1. Escrow Creation
           • Buyer initiates escrow
           • Funds are locked in smart contract
           • Seller is notified
        
        2. Transaction Flow
           • Seller fulfills obligations
           • Buyer verifies delivery
           • Funds are released
        
        3. Safety Measures
           • Automated verification
           • Dispute resolution available
           • Secure fund management
      `
    },
    {
      id: 3,
      title: 'Dispute Resolution',
      icon: '⚖️',
      content: `
        Handling Disputes:
        
        1. Initiating a Dispute
           • Access Dispute Center
           • Provide case details
           • Submit evidence
        
        2. Resolution Process
           • Arbitrator review
           • Both parties heard
           • Fair decision making
        
        3. Outcome
           • Final decision implemented
           • Funds distributed
           • Case closed
      `
    }
  ];

  const faqs = [
    {
      question: 'What is a blockchain escrow service?',
      answer: 'A blockchain escrow service uses smart contracts to automatically hold and release funds based on predefined conditions. It provides a secure, transparent way to conduct transactions between parties who may not trust each other.'
    },
    {
      question: 'How are my funds protected?',
      answer: 'Your funds are secured by smart contracts on the blockchain. They can only be released when all parties agree or through the formal dispute resolution process. The code is immutable and transparent.'
    },
    {
      question: 'What are the fees involved?',
      answer: 'Our service charges a minimal 1% fee for standard escrow transactions. This covers the smart contract deployment and maintenance. Additional fees may apply for expedited dispute resolution.'
    },
    {
      question: 'How long does the process take?',
      answer: 'Standard escrow transactions are processed within minutes on the blockchain. The overall duration depends on how quickly both parties fulfill their obligations. Disputes typically resolve within 48-72 hours.'
    }
  ];

  const filteredGuides = guides.filter(guide =>
    guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Help Center
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers, guides, and support for using our escrow service
          </p>
        </motion.div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/80 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {[
            { id: 'guides', icon: <FaBook />, label: 'Guides' },
            { id: 'faq', icon: <FaQuestionCircle />, label: 'FAQ' },
            { id: 'support', icon: <FaHeadset />, label: 'Support' }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 rounded-xl shadow-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'guides' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGuides.map((guide) => (
                  <motion.div
                    key={guide.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg cursor-pointer border border-gray-100 hover:border-indigo-200 transition-all duration-300"
                    onClick={() => setSelectedGuide(guide)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl">{guide.icon}</span>
                      <FaChevronRight className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{guide.title}</h3>
                    <p className="text-gray-600">Click to learn more...</p>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="max-w-3xl mx-auto space-y-6">
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">{faq.question}</h3>
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'support' && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Support</h2>
                  <SupportForm />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Guide Modal */}
        <AnimatePresence>
          {selectedGuide && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedGuide(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl relative"
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedGuide(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-3">{selectedGuide.icon}</span>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedGuide.title}</h2>
                </div>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-600 bg-gray-50 p-6 rounded-xl font-sans">{selectedGuide.content}</pre>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Documentation; 