import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaCheckCircle, FaClock, FaFileUpload, FaSearch, FaGavel } from 'react-icons/fa';
import { toast } from 'react-toastify';

const DisputeCenter = () => {
  const { contract, account } = useWeb3();
  const [activeTab, setActiveTab] = useState('active');
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [evidence, setEvidence] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [resolution, setResolution] = useState('');
  const [file, setFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [escrowStatus, setEscrowStatus] = useState(null);

  const fetchDisputes = async () => {
    if (!contract) {
      console.error('Contract not initialized');
      toast.error('Contract not initialized. Please connect your wallet.');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching disputed escrows...');
      
      let escrowCount;
      try {
        escrowCount = await contract.escrowCount();
        console.log('Total escrow count:', escrowCount.toString());
      } catch (error) {
        console.error('Error getting escrow count:', error);
        toast.error('Failed to connect to the contract. Please check your network connection.');
        return;
      }
      
      const disputesList = [];
      
      for (let i = 0; i < Number(escrowCount); i++) {
        try {
          console.log(`Fetching escrow ${i} details...`);
          const escrow = await contract.getEscrowDetails(i);
          console.log(`Escrow ${i} details:`, escrow);
          
          const status = Number(escrow[4]);
          
          // Only add escrows that are disputed (status 3) - focus on active disputes
          if (status === 3) {
            disputesList.push({
              id: i,
              escrowId: i,
              status: 'DISPUTED',
              amount: escrow[3],
              description: `Disputed escrow #${i} - Requires Resolution`,
              created: new Date().toLocaleDateString(),
              parties: {
                buyer: escrow[0],
                seller: escrow[1],
                arbitrator: escrow[2]
              },
              evidence: escrow[5] ? [escrow[5]] : [],
              isArbitrator: account && account.toLowerCase() === escrow[2].toLowerCase()
            });
          }
        } catch (error) {
          console.error(`Error fetching escrow ${i}:`, error);
          continue;
        }
      }
      
      console.log('Fetched disputed escrows:', disputesList);
      setDisputes(disputesList);
    } catch (error) {
      console.error('Error fetching disputes:', error);
      toast.error('Failed to fetch disputes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const setupEventListeners = async () => {
      if (!contract) {
        console.log('Contract not initialized, skipping event setup');
        return;
      }

      try {
        console.log('Setting up event listeners...');
        
        // Initial fetch
        if (mounted) {
          await fetchDisputes();
        }

        // Set up event listeners
        contract.on('DisputeRaised', async (escrowId, ipfsHash, event) => {
          console.log('Dispute raised:', { escrowId, ipfsHash, event });
          if (mounted) {
            await fetchDisputes();
          }
        });

        contract.on('DisputeResolved', async (escrowId, refund, event) => {
          console.log('Dispute resolved:', { escrowId, refund, event });
          if (mounted) {
            await fetchDisputes();
          }
        });

        return () => {
          mounted = false;
          contract.removeAllListeners('DisputeRaised');
          contract.removeAllListeners('DisputeResolved');
        };
      } catch (error) {
        console.error('Error setting up event listeners:', error);
        toast.error('Failed to set up event listeners');
      }
    };

    setupEventListeners();

    return () => {
      mounted = false;
    };
  }, [contract]);

  const getStatusText = (status) => {
    switch (status) {
      case 'DISPUTED': return 'DISPUTED';
      case 'RESOLVED': return 'RESOLVED';
      case 4: return 'RESOLVED';
      default: return 'UNKNOWN';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DISPUTED': return 'bg-yellow-50 text-yellow-700';
      case 'RESOLVED': return 'bg-green-50 text-green-700';
      case 4: return 'bg-green-50 text-green-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DISPUTED': return <FaClock className="text-yellow-500" />;
      case 'RESOLVED': return <FaCheckCircle className="text-green-500" />;
      case 4: return <FaCheckCircle className="text-green-500" />;
      default: return <FaExclamationTriangle className="text-red-500" />;
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const uploadToIPFS = async () => {
    if (!file) return null;
    
    try {
      setUploadingFile(true);
      console.log('Starting file upload...');

      // For now, we'll use a simple approach without external IPFS
      // In a production environment, you would use a proper IPFS service
      
      // Create a simple hash based on file name and timestamp
      const timestamp = Date.now();
      const fileName = file.name;
      const fileSize = file.size;
      
      // Create a simple identifier (in production, this would be an actual IPFS hash)
      const fileHash = `${timestamp}_${fileName}_${fileSize}`;
      
      console.log('File processed successfully:', fileHash);
      toast.success('File processed successfully');
      return fileHash;
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process file. Please try again.');
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  const isBuyer = (dispute) => {
    return dispute.parties.initiator.toLowerCase() === account.toLowerCase();
  };

  const isArbitrator = (dispute) => {
    return dispute.parties.arbitrator.toLowerCase() === account.toLowerCase();
  };

  const fundEscrow = async (escrowId, amount) => {
    if (!contract || !account) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      console.log('Funding escrow:', escrowId, 'with amount:', amount.toString());
      
      const tx = await contract.depositFunds(escrowId, { value: amount });
      toast.info('Funding transaction submitted! Waiting for confirmation...');
      await tx.wait();
      
      toast.success('Escrow funded successfully!');
      await fetchDisputes();
    } catch (error) {
      console.error('Error funding escrow:', error);
      if (error.message.includes('Only buyer')) {
        toast.error('Only the buyer can fund the escrow');
      } else if (error.message.includes('Escrow must be in Created')) {
        toast.error('Escrow is not in the correct state for funding');
      } else {
        toast.error('Failed to fund escrow: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async (escrowId, resolution) => {
    if (!contract || !account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!resolution.trim()) {
      toast.error('Please provide a resolution decision');
      return;
    }

    try {
      setLoading(true);
      console.log('Resolving dispute:', escrowId, 'with resolution:', resolution);
      
      // For now, we'll release funds to seller (true = release to seller)
      // In a real implementation, you might want to parse the resolution text
      const releaseToSeller = resolution.toLowerCase().includes('seller') || 
                              resolution.toLowerCase().includes('release') ||
                              resolution.toLowerCase().includes('approve');
      
      const tx = await contract.resolveDispute(escrowId, releaseToSeller);
      toast.info('Resolution transaction submitted! Waiting for confirmation...');
      await tx.wait();
      
      toast.success(`Dispute resolved! Funds ${releaseToSeller ? 'released to seller' : 'refunded to buyer'}`);
      setResolution('');
      setSelectedDispute(null);
      await fetchDisputes();
    } catch (error) {
      console.error('Error resolving dispute:', error);
      if (error.message.includes('Only arbitrator')) {
        toast.error('Only the arbitrator can resolve disputes');
      } else if (error.message.includes('Escrow must be in Disputed')) {
        toast.error('Escrow must be in disputed state to resolve');
      } else {
        toast.error('Failed to resolve dispute: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEvidence = async (disputeId) => {
    if (!evidence || !contract) {
      toast.error('Please provide evidence description');
      return;
    }

    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    try {
      setLoading(true);
      
      // First check the escrow status
      const escrowDetails = await contract.getEscrowDetails(disputeId);
      const escrowStatus = Number(escrowDetails[4]);
      
      console.log('Escrow status:', escrowStatus);
      
      // Check if escrow is in the correct state
      if (escrowStatus === 0) {
        toast.error('Escrow is not funded yet. Please fund the escrow first.');
        return;
      } else if (escrowStatus === 2) {
        toast.error('Escrow is already completed. Cannot submit evidence.');
        return;
      } else if (escrowStatus === 3) {
        toast.error('Escrow is already disputed. Cannot submit additional evidence.');
        return;
      } else if (escrowStatus === 4) {
        toast.error('Escrow is already resolved. Cannot submit evidence.');
        return;
      }
      
      let ipfsHash = '';
      
      // Upload file if provided (optional)
      if (file) {
        const uploadedHash = await uploadToIPFS();
        if (uploadedHash) {
          ipfsHash = uploadedHash;
        } else {
          // Continue without file upload if it fails
          console.log('File upload failed, continuing with evidence description only');
        }
      }
      
      // Combine evidence description with file hash
      const fullEvidence = file ? `${evidence} [File: ${ipfsHash}]` : evidence;
      
      console.log('Submitting evidence:', {
        disputeId,
        evidence: fullEvidence,
        ipfsHash,
        escrowStatus
      });

      // Now raise the dispute with the evidence
      const tx = await contract.raiseDispute(disputeId, fullEvidence);
      toast.info('Transaction submitted! Waiting for confirmation...');
      await tx.wait();
      
      setEvidence('');
      setFile(null);
      setSelectedDispute(null);
      toast.success('Evidence submitted successfully');
      await fetchDisputes();
    } catch (error) {
      console.error('Error submitting evidence:', error);
      if (error.message.includes('Only buyer or seller')) {
        toast.error('Only the buyer or seller can submit evidence');
      } else if (error.message.includes('Escrow must be in InProgress')) {
        toast.error('Escrow must be in funded state to submit evidence. Please fund the escrow first.');
      } else if (error.message.includes('user rejected')) {
        toast.error('Transaction was cancelled by user');
      } else {
        toast.error('Failed to submit evidence: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };



  const renderDisputeDetails = (dispute) => {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Escrow #{dispute.id} - Dispute Resolution</h2>
            <p className="text-gray-600 mt-1">{dispute.description}</p>
            {dispute.isArbitrator && (
              <div className="mt-2">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  You are the Arbitrator for this dispute
                </span>
              </div>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(dispute.status)}`}>
            {dispute.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Parties Involved</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Buyer:</span> {dispute.parties.buyer}</p>
              <p><span className="font-medium">Seller:</span> {dispute.parties.seller}</p>
              <p><span className="font-medium">Arbitrator:</span> {dispute.parties.arbitrator}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Escrow Details</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Escrow ID:</span> {dispute.escrowId}</p>
              <p><span className="font-medium">Amount:</span> {dispute.amount} ETH</p>
              <p><span className="font-medium">Status:</span> Disputed - Awaiting Resolution</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Evidence</h3>
          <div className="space-y-3">
            {dispute.evidence.map((item, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {dispute.isArbitrator && dispute.status === 'DISPUTED' && (
          <div className="mt-6 bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <FaGavel className="mr-2 text-blue-600" />
              Arbitrator Resolution Panel
            </h3>
            <p className="text-gray-600 mb-4">
              As the arbitrator, you have the authority to resolve this dispute. Review the evidence and make your decision.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Decision
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Enter your detailed resolution decision and reasoning..."
                  className="w-full h-32 p-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => handleResolveDispute(dispute.id, resolution + " [DECISION: Release to Seller]")}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaCheckCircle className="mr-2" />
                  Release to Seller
                </button>
                <button
                  onClick={() => handleResolveDispute(dispute.id, resolution + " [DECISION: Refund to Buyer]")}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <FaExclamationTriangle className="mr-2" />
                  Refund to Buyer
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setViewMode('list')}
          className="mt-6 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to List
        </button>
      </div>
    );
  };

  const renderDisputeCard = (dispute) => {
    return (
      <motion.div
        key={dispute.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Dispute #{dispute.id}
            </h3>
            <p className="text-gray-600 mt-1">{dispute.description}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(dispute.status)}`}>
            {getStatusText(dispute.status)}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="text-gray-900">{dispute.amount} ETH</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="text-gray-900">{dispute.created}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {getStatusIcon(dispute.status)}
            <span className="text-sm text-gray-600">
              {dispute.evidence.length} Evidence Items
            </span>
          </div>
          <div className="flex space-x-2">
            {isBuyer(dispute) && dispute.status === 'DISPUTED' && (
              <button
                onClick={() => setSelectedDispute(dispute)}
                className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                <FaFileUpload className="mr-1" />
                Submit Evidence
              </button>
            )}
            {isArbitrator(dispute) && dispute.status === 'DISPUTED' && (
              <button
                onClick={() => {
                  setSelectedDispute(dispute);
                  setViewMode('details');
                }}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <FaGavel className="mr-1" />
                Resolve
              </button>
            )}
            <button
              onClick={() => {
                setSelectedDispute(dispute);
                setViewMode('details');
              }}
              className="px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Dispute Resolution Center
          </h1>
          <p className="text-gray-600">Resolve disputed escrows and provide arbitration</p>
        </div>

        {viewMode === 'list' ? (
          <>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex justify-end">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search disputes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
              </div>
            ) : (
              <>
                {/* Active Disputes Section */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <FaExclamationTriangle className="text-red-500 mr-2" />
                    Active Disputes Requiring Resolution
                  </h2>
                  <div className="space-y-4">
                    {disputes
                      .filter(dispute => 
                        dispute.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        dispute.escrowId.toString().toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((dispute) => (
                        <div
                          key={dispute.id}
                          className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                Escrow #{dispute.id} - Dispute
                              </h3>
                              <p className="text-gray-600 mt-1">{dispute.description}</p>
                            </div>
                            <div className="text-right">
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                Requires Resolution
                              </span>
                              {dispute.isArbitrator && (
                                <div className="mt-2">
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    You are Arbitrator
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Amount</p>
                              <p className="text-gray-900 font-medium">{dispute.amount} POL</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Buyer</p>
                              <p className="text-gray-900 text-sm">{`${dispute.parties.buyer.slice(0, 6)}...${dispute.parties.buyer.slice(-4)}`}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Seller</p>
                              <p className="text-gray-900 text-sm">{`${dispute.parties.seller.slice(0, 6)}...${dispute.parties.seller.slice(-4)}`}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Evidence</p>
                              <p className="text-gray-900 text-sm">{dispute.evidence.length} item(s)</p>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end space-x-2">
                            {dispute.isArbitrator && (
                              <button
                                onClick={() => {
                                  setSelectedDispute(dispute);
                                  setViewMode('details');
                                }}
                                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center"
                              >
                                <FaGavel className="mr-1" />
                                Resolve Dispute
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedDispute(dispute);
                                setViewMode('details');
                              }}
                              className="px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                  {disputes.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                      <FaCheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Disputes</h3>
                      <p className="text-gray-600">All escrows are currently in good standing. No disputes require resolution.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          selectedDispute && renderDisputeDetails(selectedDispute)
        )}

        {selectedDispute && viewMode === 'list' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-lg"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit Evidence</h2>
              <p className="text-gray-600 mb-6">
                For Dispute #{selectedDispute.id} - {selectedDispute.escrowId}
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Dispute Details</h3>
                <p className="text-gray-600">{selectedDispute.description}</p>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Status: </span>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    selectedDispute.status === 'DISPUTED' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedDispute.status}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evidence Description
                </label>
                <textarea
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  placeholder="Describe your evidence..."
                  className="w-full h-32 p-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Evidence File (Optional)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-200 rounded-lg"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Max file size: 10MB. File upload is optional - you can submit evidence with description only.
                </p>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedDispute(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading || uploadingFile}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitEvidence(selectedDispute.id)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                  disabled={loading || uploadingFile}
                >
                  {(loading || uploadingFile) && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading || uploadingFile ? 'Processing...' : 'Submit Evidence'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputeCenter; 