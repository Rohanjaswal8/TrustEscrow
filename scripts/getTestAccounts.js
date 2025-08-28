const { ethers } = require("hardhat");

async function main() {
  const accounts = await ethers.getSigners();
  
  console.log("Test Accounts:");
  console.log("=============");
  
  accounts.forEach((account, index) => {
    console.log(`\nAccount ${index + 1}:`);
    console.log(`Address: ${account.address}`);
    console.log(`Private Key: ${account.privateKey}`);
    console.log("-------------------");
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 