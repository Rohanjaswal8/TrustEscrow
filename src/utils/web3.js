import { ethers } from 'ethers';
import Escrow from '../artifacts/contracts/Escrow.sol/Escrow.json';

export const getWeb3Provider = async () => {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask!');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  return provider;
};

export const getContract = async (provider) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(
    process.env.REACT_APP_ESCROW_CONTRACT_ADDRESS,
    Escrow.abi,
    signer
  );
  return contract;
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatEther = (wei) => {
  if (!wei) return '0';
  return ethers.formatEther(wei);
};

export const parseEther = (eth) => {
  if (!eth) return ethers.parseUnits('0');
  return ethers.parseEther(eth.toString());
};

export const handleError = (error) => {
  if (error.code === 4001) {
    return 'Transaction rejected by user';
  }
  if (error.code === -32603) {
    return 'Internal JSON-RPC error';
  }
  return error.message || 'An error occurred';
}; 