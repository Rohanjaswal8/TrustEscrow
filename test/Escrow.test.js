const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow Contract", function () {
  let Escrow;
  let escrow;
  let owner;
  let buyer;
  let seller;
  let arbitrator;
  let feeCollector;
  const amount = ethers.parseEther("1.0");

  beforeEach(async function () {
    [owner, buyer, seller, arbitrator, feeCollector] = await ethers.getSigners();
    
    Escrow = await ethers.getContractFactory("EscrowV2");
    escrow = await Escrow.deploy();
    await escrow.waitForDeployment();

    // Add arbitrator
    await escrow.addArbitrator(arbitrator.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await escrow.owner()).to.equal(owner.address);
    });

    it("Should set the right fee collector", async function () {
      expect(await escrow.feeCollector()).to.equal(owner.address);
    });
  });

  describe("Arbitrator Management", function () {
    it("Should allow owner to add arbitrator", async function () {
      const newArbitrator = (await ethers.getSigners())[5];
      await escrow.addArbitrator(newArbitrator.address);
      expect(await escrow.arbitrators(newArbitrator.address)).to.be.true;
    });

    it("Should allow owner to remove arbitrator", async function () {
      await escrow.removeArbitrator(arbitrator.address);
      expect(await escrow.arbitrators(arbitrator.address)).to.be.false;
    });
  });

  describe("Escrow Creation", function () {
    it("Should create escrow with correct parameters", async function () {
      await escrow.connect(buyer).createEscrow(seller.address, arbitrator.address, { value: amount });
      
      const escrowDetails = await escrow.escrows(0);
      expect(escrowDetails.buyer).to.equal(buyer.address);
      expect(escrowDetails.seller).to.equal(seller.address);
      expect(escrowDetails.arbitrator).to.equal(arbitrator.address);
      expect(escrowDetails.amount).to.equal(amount);
      expect(escrowDetails.status).to.equal(0);
    });

    it("Should fail if seller is the same as buyer", async function () {
      await expect(
        escrow.connect(buyer).createEscrow(buyer.address, arbitrator.address, { value: amount })
      ).to.be.revertedWith("Seller cannot be the buyer");
    });

    it("Should fail if arbitrator is not registered", async function () {
      const unregisteredArbitrator = (await ethers.getSigners())[5];
      await expect(
        escrow.connect(buyer).createEscrow(seller.address, unregisteredArbitrator.address, { value: amount })
      ).to.be.revertedWith("Invalid arbitrator");
    });
  });

  describe("Fund Management", function () {
    beforeEach(async function () {
      await escrow.connect(buyer).createEscrow(seller.address, arbitrator.address, { value: amount });
    });

    it("Should allow buyer to release funds", async function () {
      const initialBalance = await ethers.provider.getBalance(seller.address);
      await escrow.connect(buyer).releaseFunds(0);
      const finalBalance = await ethers.provider.getBalance(seller.address);
      
      expect(finalBalance - initialBalance).to.equal(amount);
    });

    it("Should allow arbitrator to release funds", async function () {
      const initialBalance = await ethers.provider.getBalance(seller.address);
      await escrow.connect(arbitrator).releaseFunds(0);
      const finalBalance = await ethers.provider.getBalance(seller.address);
      
      expect(finalBalance - initialBalance).to.equal(amount);
    });

    it("Should not allow seller to release funds", async function () {
      await expect(
        escrow.connect(seller).releaseFunds(0)
      ).to.be.revertedWith("Only buyer or arbitrator can release funds");
    });
  });

  describe("Emergency Functions", function () {
    beforeEach(async function () {
      await escrow.connect(buyer).createEscrow(seller.address, arbitrator.address, { value: amount });
    });

    it("Should allow owner to pause contract", async function () {
      await escrow.pause();
      expect(await escrow.paused()).to.be.true;
    });

    it("Should allow owner to unpause contract", async function () {
      await escrow.pause();
      await escrow.unpause();
      expect(await escrow.paused()).to.be.false;
    });

    it("Should allow emergency withdraw when paused", async function () {
      await escrow.pause();
      const initialBalance = await ethers.provider.getBalance(buyer.address);
      await escrow.emergencyWithdraw(0);
      const finalBalance = await ethers.provider.getBalance(buyer.address);
      
      expect(finalBalance - initialBalance).to.equal(amount);
    });
  });
}); 