import { ethers } from 'ethers';
import EscrowABI from '../contracts/Escrow.json';
import EscrowAddress from '../contracts/Escrow-address.json';

export const testContractConnection = async (provider) => {
  try {
    const contract = new ethers.Contract(EscrowAddress.address, EscrowABI.abi, provider);
    
    // Test basic contract call
    const escrowCount = await contract.escrowCount();
    console.log('✅ Contract connection successful!');
    console.log('Escrow count:', escrowCount.toString());
    
    // Test if required functions exist
    try {
      await contract.releaseFunds.staticCall(0);
      console.log('✅ releaseFunds function exists');
    } catch (error) {
      console.log('❌ releaseFunds function not found or not callable');
    }
    
    try {
      await contract.raiseDispute.staticCall(0, '');
      console.log('✅ raiseDispute function exists');
    } catch (error) {
      console.log('❌ raiseDispute function not found or not callable');
    }
    
    return {
      success: true,
      escrowCount: escrowCount.toString(),
      contract
    };
  } catch (error) {
    console.error('❌ Contract connection failed:', error);
    
    let errorMessage = 'Contract connection failed';
    
    if (error.message.includes('could not decode result data')) {
      errorMessage = 'Contract not found at this address. Please check if the contract is deployed.';
    } else if (error.message.includes('network')) {
      errorMessage = 'Network connection error. Please check your internet connection.';
    } else if (error.message.includes('execution reverted')) {
      errorMessage = 'Contract function call failed. The contract might not be properly deployed.';
    }
    
    return {
      success: false,
      error: errorMessage,
      details: error.message
    };
  }
};

export const validateEthereumAddress = (address) => {
  try {
    // Use ethers to validate and get checksummed address
    const checksummedAddress = ethers.getAddress(address);
    return checksummedAddress;
  } catch (error) {
    return false;
  }
};

export const getDefaultArbitrator = () => {
  // Use a known valid checksummed address (Vitalik's address as example)
  return '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
};
