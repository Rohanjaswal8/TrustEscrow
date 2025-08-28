async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "POL");

  const Escrow = await ethers.getContractFactory("Escrow"); // Replace with your contract name
  const escrow = await Escrow.deploy();
  await escrow.waitForDeployment();

  console.log("Escrow contract deployed at:", escrow.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
