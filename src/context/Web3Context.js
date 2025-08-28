import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import EscrowABI from '../contracts/Escrow.json';
import EscrowAddress from '../contracts/Escrow-address.json';
import { testContractConnection } from '../utils/contractTest';

const abi = EscrowABI.abi; 
const CONTRACT_ADDRESS = EscrowAddress.address;

const Web3Context = createContext();

// Polygon mainnet or testnet RPC
const POLYGON_NETWORK = {
  chainId: '0x89', // Polygon Mainnet, use 0x13881 for Mumbai Testnet
  chainName: 'Polygon Mainnet',
  nativeCurrency: {
    name: 'Polygon',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://polygon-rpc.com'], // or any reliable Polygon RPC
  blockExplorerUrls: ['https://polygonscan.com']
};

const STORAGE_KEYS = {
  CONNECTED: 'web3_connected',
  CONTRACT_ADDRESS: 'web3_contract_address',
  NETWORK_ID: 'web3_network_id'
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [networkId, setNetworkId] = useState(null);
  const [escrows, setEscrows] = useState([]);
  const [pendingRequest, setPendingRequest] = useState(false);
  const [projects, setProjects] = useState([]);

  const resetConnectionState = () => {
    setAccount('');
    setContract(null);
    setProvider(null);
    setIsConnected(false);
    setPendingRequest(false);
    setEscrows([]);
  };

  const initializeContract = async (signer) => {
    try {
      const escrowContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      setContract(escrowContract);
      return escrowContract;
    } catch (error) {
      console.error("Error initializing contract:", error);
      toast.error("Failed to initialize contract");
      return null;
    }
  };

  const connectToPolygon = async () => {
    console.log('🔍 connectToPolygon called');
    console.log('🔍 window.ethereum exists:', !!window.ethereum);
    
    if (!window.ethereum) {
      toast.error('Please install MetaMask to use this application');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Starting wallet connection...');
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      console.log('✅ Account access granted:', accounts[0]);

      // Check and switch network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('Current chain ID:', chainId, 'Expected:', POLYGON_NETWORK.chainId);

      if (chainId !== POLYGON_NETWORK.chainId) {
        console.log('🔄 Switching to Polygon network...');
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: POLYGON_NETWORK.chainId }]
          });
          console.log('✅ Switched to Polygon network');
        } catch (switchError) {
          console.log('Switch error:', switchError);
          if (switchError.code === 4902 || switchError.message.includes('Unrecognized chain ID')) {
            console.log('🔄 Adding Polygon network...');
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [POLYGON_NETWORK]
            });
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: POLYGON_NETWORK.chainId }]
            });
            console.log('✅ Added and switched to Polygon network');
          } else {
            throw new Error('Failed to switch to Polygon network. Please switch manually in MetaMask.');
          }
        }
      }

      // Initialize provider and contract
      console.log('🔄 Initializing provider and contract...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);

      const signer = await provider.getSigner();
      const escrowContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      setContract(escrowContract);
      setAccount(accounts[0]);
      setIsConnected(true);
      setNetworkId(parseInt(POLYGON_NETWORK.chainId, 16));

      // Save connection state
      localStorage.setItem(STORAGE_KEYS.CONNECTED, 'true');
      localStorage.setItem(STORAGE_KEYS.CONTRACT_ADDRESS, CONTRACT_ADDRESS);
      localStorage.setItem(STORAGE_KEYS.NETWORK_ID, POLYGON_NETWORK.chainId);

      console.log('✅ Wallet connected successfully!');
      toast.success('Wallet connected successfully!');

      // Try to fetch escrows (optional - don't fail if this doesn't work)
      try {
        const escrows = await getAllEscrows();
        if (escrows && escrows.length > 0) {
          toast.info(`Loaded ${escrows.length} escrow(s)`);
        } else {
          toast.info('No escrows found yet. You can create new ones!');
        }
      } catch (err) {
        console.error('Failed to fetch escrows initially', err);
        toast.warning('Connected, but failed to fetch existing escrows. You can still create new ones.');
      }

    } catch (error) {
      console.error('❌ Connection error:', error);
      toast.error(error.message || 'Failed to connect to wallet');
      resetConnectionState();
      localStorage.removeItem(STORAGE_KEYS.CONNECTED);
      localStorage.removeItem(STORAGE_KEYS.CONTRACT_ADDRESS);
      localStorage.removeItem(STORAGE_KEYS.NETWORK_ID);
    } finally {
      setLoading(false);
    }
  };

  const getAllEscrows = async () => {
    if (!contract) {
      console.error('Contract not initialized');
      throw new Error('Contract not initialized');
    }
    if (!account) {
      console.error('No account connected');
      throw new Error('No account connected');
    }

    try {
      const escrowCount = await contract.escrowCount();
      console.log('Escrow count:', escrowCount.toString());
      
      if (Number(escrowCount) === 0) {
        setEscrows([]);
        return [];
      }

      const allEscrows = [];
      for (let i = 0; i < Number(escrowCount); i++) {
        try {
          const escrowDetails = await contract.getEscrowDetails(i);
          allEscrows.push({
            id: i,
            buyer: escrowDetails[0],
            seller: escrowDetails[1],
            arbitrator: escrowDetails[2],
            amount: escrowDetails[3],
            status: Number(escrowDetails[4]),
            ipfsHash: escrowDetails[5]
          });
        } catch (escrowError) {
          console.error(`Error fetching escrow ${i}:`, escrowError);
          // Continue with other escrows even if one fails
        }
      }
      
      setEscrows(allEscrows);
      return allEscrows;
    } catch (error) {
      console.error('Error in getAllEscrows:', error);
      
      // Provide more specific error messages
      if (error.message.includes('network') || error.message.includes('connection')) {
        toast.error('Network error. Please check your internet connection.');
      } else if (error.message.includes('contract') || error.message.includes('address')) {
        toast.error('Contract not found. Please check if the contract is deployed.');
      } else {
        toast.error('Failed to fetch data. Please try again.');
      }
      
      throw error;
    }
  };

  const releaseFunds = async (escrowId) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }
    if (!account) {
      throw new Error('No wallet connected');
    }

    try {
      console.log('Releasing funds for escrow:', escrowId);
      const tx = await contract.releaseFunds(escrowId);
      toast.info('Transaction submitted! Waiting for confirmation...');
      await tx.wait();
      toast.success('Funds released successfully!');
      
      // Refresh escrows after successful transaction
      await getAllEscrows();
    } catch (error) {
      console.error('Error releasing funds:', error);
      if (error.message.includes('Only buyer or arbitrator')) {
        throw new Error('Only buyer or arbitrator can release funds');
      } else if (error.message.includes('Escrow must be in InProgress')) {
        throw new Error('Escrow must be in funded state to release funds');
      } else {
        throw new Error(error.message || 'Failed to release funds');
      }
    }
  };

  const raiseDispute = async (escrowId, ipfsHash = '') => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }
    if (!account) {
      throw new Error('No wallet connected');
    }

    try {
      console.log('Raising dispute for escrow:', escrowId, 'with IPFS hash:', ipfsHash);
      const tx = await contract.raiseDispute(escrowId, ipfsHash);
      toast.info('Dispute raised! Waiting for confirmation...');
      await tx.wait();
      toast.success('Dispute raised successfully!');
      
      // Refresh escrows after successful transaction
      await getAllEscrows();
    } catch (error) {
      console.error('Error raising dispute:', error);
      if (error.message.includes('Only buyer or seller')) {
        throw new Error('Only buyer or seller can raise dispute');
      } else if (error.message.includes('Escrow must be in InProgress')) {
        throw new Error('Escrow must be in funded state to raise dispute');
      } else {
        throw new Error(error.message || 'Failed to raise dispute');
      }
    }
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      resetConnectionState();
      localStorage.removeItem(STORAGE_KEYS.CONNECTED);
      localStorage.removeItem(STORAGE_KEYS.CONTRACT_ADDRESS);
      localStorage.removeItem(STORAGE_KEYS.NETWORK_ID);
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      if (provider) {
        try {
          const signer = await provider.getSigner();
          await initializeContract(signer);
          await getAllEscrows();
        } catch (error) {
          console.error('Error handling account change:', error);
        }
      }
    }
  };

  const handleChainChanged = async () => {
    window.location.reload();
  };

  useEffect(() => {
    const init = async () => {
      try {
        if (!window.ethereum) {
          setError('Please install MetaMask');
          setLoading(false);
          return;
        }
        
        const wasConnected = localStorage.getItem(STORAGE_KEYS.CONNECTED) === 'true';
        if (wasConnected) {
          await connectToPolygon();
        }
        
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    init();
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const value = {
    account,
    contract,
    provider,
    loading,
    error,
    isConnected,
    networkId,
    escrows,
    connectWallet: connectToPolygon,
    getAllEscrows,
    releaseFunds,
    raiseDispute
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) throw new Error('useWeb3 must be used within a Web3Provider');
  return context;
};

export { Web3Context };
