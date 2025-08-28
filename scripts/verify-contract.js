const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x5975830A42a5F137e702F06260532f6Fc400A962";
  
  console.log("Verifying contract at address:", contractAddress);
  
  try {
    // Get the contract factory
    const Escrow = await ethers.getContractFactory("Escrow");
    
    // Try to attach to the existing contract
    const contract = Escrow.attach(contractAddress);
    
    // Try to call a view function to verify the contract exists
    const escrowCount = await contract.escrowCount();
    console.log("✅ Contract is deployed and accessible!");
    console.log("Current escrow count:", escrowCount.toString());
    
    // Try to get the first escrow details if any exist
    if (escrowCount > 0) {
      try {
        const escrowDetails = await contract.getEscrowDetails(0);
        console.log("✅ First escrow details retrieved successfully!");
        console.log("Buyer:", escrowDetails[0]);
        console.log("Seller:", escrowDetails[1]);
        console.log("Arbitrator:", escrowDetails[2]);
        console.log("Amount:", ethers.formatEther(escrowDetails[3]), "MATIC");
        console.log("Status:", escrowDetails[4]);
      } catch (error) {
        console.log("⚠️ Could not retrieve escrow details:", error.message);
      }
    } else {
      console.log("ℹ️ No escrows found yet.");
    }
    
  } catch (error) {
    console.error("❌ Contract verification failed:", error.message);
    console.log("\nPossible issues:");
    console.log("1. Contract is not deployed at this address");
    console.log("2. Contract address is incorrect");
    console.log("3. Network connection issue");
    console.log("4. Contract ABI mismatch");
    
    console.log("\nTo deploy a new contract, run:");
    console.log("npx hardhat run scripts/deploy.js --network polygon");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
