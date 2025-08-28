const { ethers } = require("hardhat");

async function main() {
  const [deployer, seller, arbitrator] = await ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  
  // Deploy the Escrow contract
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy();
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("Escrow contract deployed to:", escrowAddress);
  
  // Create some test escrows
  const amount = ethers.parseEther("1.0");
  
  // Create and complete first escrow
  console.log("\nCreating and completing first escrow...");
  let tx = await escrow.createEscrow(seller.address, arbitrator.address, { value: amount });
  await tx.wait();
  console.log("- First escrow created");
  tx = await escrow.depositFunds(0, { value: amount });
  await tx.wait();
  console.log("- First escrow funded");
  tx = await escrow.releaseFunds(0);
  await tx.wait();
  console.log("- First escrow completed (released)");
  
  // Create and dispute second escrow
  console.log("\nCreating and disputing second escrow...");
  tx = await escrow.createEscrow(seller.address, arbitrator.address, { value: amount });
  await tx.wait();
  console.log("- Second escrow created");
  tx = await escrow.depositFunds(1, { value: amount });
  await tx.wait();
  console.log("- Second escrow funded");
  tx = await escrow.raiseDispute(1, "");
  await tx.wait();
  console.log("- Second escrow disputed");
  
  // Create active third escrow
  console.log("\nCreating third escrow (will remain active)...");
  tx = await escrow.createEscrow(seller.address, arbitrator.address, { value: amount });
  await tx.wait();
  console.log("- Third escrow created");
  tx = await escrow.depositFunds(2, { value: amount });
  await tx.wait();
  console.log("- Third escrow funded and active");
  
  // Create and refund fourth escrow
  console.log("\nCreating and refunding fourth escrow...");
  tx = await escrow.createEscrow(seller.address, arbitrator.address, { value: amount });
  await tx.wait();
  console.log("- Fourth escrow created");
  tx = await escrow.depositFunds(3, { value: amount });
  await tx.wait();
  console.log("- Fourth escrow funded");
  tx = await escrow.raiseDispute(3, "");
  await tx.wait();
  console.log("- Fourth escrow disputed");
  tx = await escrow.connect(arbitrator).resolveDispute(3, true);
  await tx.wait();
  console.log("- Fourth escrow refunded");
  
  // Verify final state
  const escrowCount = await escrow.escrowCount();
  console.log("\nFinal state:");
  console.log("- Total escrows:", escrowCount.toString());
  for(let i = 0; i < escrowCount; i++) {
    const details = await escrow.getEscrowDetails(i);
    console.log(`- Escrow #${i} status:`, details[4].toString());
  }
  
  // Write the contract address to .env file
  const fs = require('fs');
  const envFile = '.env';
  const envContent = fs.readFileSync(envFile, 'utf8');
  const updatedContent = envContent.replace(
    /REACT_APP_ESCROW_CONTRACT_ADDRESS=.*/,
    `REACT_APP_ESCROW_CONTRACT_ADDRESS=${escrowAddress}`
  );
  fs.writeFileSync(envFile, updatedContent);
  console.log("\nUpdated contract address in .env file");
  
  console.log("\nSeed data created successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 