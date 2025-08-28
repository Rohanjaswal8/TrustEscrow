import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { create } from 'ipfs-http-client';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { formatEther, parseEther } from 'ethers';
import LoadingSkeleton from '../components/LoadingSkeleton';

const Dispute = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contract, account, resolveDispute, isConnected } = useWeb3();
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState('');

  const ipfs = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: `Basic ${Buffer.from(
        `${process.env.REACT_APP_IPFS_API_KEY}:${process.env.REACT_APP_IPFS_API_SECRET}`
      ).toString('base64')}`
    }
  });

  useEffect(() => {
    const fetchEscrow = async () => {
      if (!contract || !isConnected) return;

      try {
        const details = await contract.getEscrowDetails(id);
        const escrowData = {
          buyer: details[0],
          seller: details[1],
          arbitrator: details[2],
          amount: details[3], // BigNumber from contract
          status: Number(details[4]),
          ipfsHash: details[5]
        };
        setEscrow(escrowData);
      } catch (err) {
        setError('Error fetching escrow details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEscrow();
  }, [contract, id, isConnected]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadToIPFS = async () => {
    if (!file) return;

    try {
      const added = await ipfs.add(file);
      setIpfsHash(added.path);
      return added.path;
    } catch (err) {
      setError('Error uploading to IPFS');
      console.error(err);
      return null;
    }
  };

  const handleResolveDispute = async (refund) => {
    setActionLoading(true);
    try {
      if (refund) {
        await resolveDispute(id, true);
      } else {
        await resolveDispute(id, false);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return 'bg-yellow-100 text-yellow-800';
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-green-100 text-green-800';
      case 3: return 'bg-red-100 text-red-800';
      case 4: return 'bg-purple-100 text-purple-800';
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

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Please connect your wallet to view dispute details</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  if (!escrow) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Escrow not found</h2>
      </div>
    );
  }

  const isArbitrator = account.toLowerCase() === escrow.arbitrator.toLowerCase();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Dispute Details
          </h3>
          
          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="mt-5 border-t border-gray-200">
            <dl className="divide-y divide-gray-200">
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(escrow.status)}`}>
                    {getStatusText(escrow.status)}
                  </span>
                </dd>
              </div>

              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Amount</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatEther(escrow.amount)} ETH
                </dd>
              </div>

              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Buyer</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {escrow.buyer}
                </dd>
              </div>

              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Seller</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {escrow.seller}
                </dd>
              </div>

              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Arbitrator</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {escrow.arbitrator}
                </dd>
              </div>

              {escrow.ipfsHash && (
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Dispute Evidence</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <a
                      href={`https://ipfs.io/ipfs/${escrow.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      View Evidence
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {isArbitrator && escrow.status === 3 && (
            <div className="mt-5">
              <h4 className="text-sm font-medium text-gray-900">Resolution</h4>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => handleResolveDispute(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Refund Buyer'}
                </button>
                <button
                  onClick={() => handleResolveDispute(false)}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Release to Seller'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dispute; 