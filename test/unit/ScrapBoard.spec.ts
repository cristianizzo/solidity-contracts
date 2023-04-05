import { expect } from "chai";
import { ethers } from "hardhat";

describe("ScrapBoard", () => {

  const contractName = "TestNuts";
  const contractSymbol = "tNUTS";
  const totalSupply = 1000000000000; // 1 trillion

  let scrapBoardContract: any;
  let scrapBoard: any;

  let tokenContract: any;
  let nutsToken: any;
  let owner: any;
  let gameAccount: any;
  let account2: any;
  let accounts: any;

  beforeEach(async () => {

    scrapBoardContract = await ethers.getContractFactory("ScarpBoard");
    tokenContract = await ethers.getContractFactory("NUTSToken");
    [owner, gameAccount, account2, ...accounts] = await ethers.getSigners();

    nutsToken = await tokenContract.deploy(contractName, contractSymbol, totalSupply);
    await nutsToken.deployed();

    scrapBoard = await scrapBoardContract.deploy(nutsToken.address, gameAccount.address);
    await scrapBoard.deployed();

  });

  it("Should get contract info", async () => {

    const gameAddress = await scrapBoard.gameAddress();
    expect(gameAddress).to.equal(gameAccount.address);

    const nutsAddress = await scrapBoard.nutsToken();
    expect(nutsAddress).to.equal(nutsToken.address);

    const userInfo = await scrapBoard.userInfo(account2.address);

    expect(userInfo.level).to.equal(0);
    expect(userInfo.amount).to.equal(0);
    expect(userInfo.lastDeposit).to.equal(0);

  });

  describe("User Level", () => {

    it("Should update user level", async () => {

      const tx = await scrapBoard.connect(gameAccount).updateUserLevel(account2.address, 1);
      await tx.wait();

      const gameAccountInfo = await scrapBoard.userInfo(account2.address);
      expect(gameAccountInfo.level).to.equal(1);

    });

    it("Should update user level - not authorized", async () => {

      await expect(scrapBoard.connect(account2).updateUserLevel(account2.address, 1)).to.be.revertedWith("Ownable: caller is not the game");

      const gameAccountInfo = await scrapBoard.userInfo(account2.address);
      expect(gameAccountInfo.level).to.equal(0);

    });

  });

  describe("Deposit", () => {

    beforeEach(async () => {

      const tx = await nutsToken.connect(owner).transfer(account2.address, 100000000);
      await tx.wait();

    });

    it("Should deposit", async () => {

      const balanceBefore = await nutsToken.balanceOf(account2.address);
      expect(balanceBefore).to.equal(100000000);

      await nutsToken.connect(account2).approve(scrapBoard.address, 50000000);
      const tx = await scrapBoard.connect(account2).deposit(50000000);
      await tx.wait();

      const balanceAfter = await nutsToken.balanceOf(account2.address);
      expect(balanceAfter).to.equal(50000000);

      const scrapBoardBalance = await nutsToken.balanceOf(scrapBoard.address);
      expect(scrapBoardBalance).to.equal(50000000);

    });

  });

  describe("withdraw", () => {

    beforeEach(async () => {

      const tx = await nutsToken.connect(owner).transfer(account2.address, 100000000);
      await tx.wait();

    });

    it("Should withdraw", async () => {

      await nutsToken.connect(account2).approve(scrapBoard.address, 50000000);
      const tx = await scrapBoard.connect(account2).deposit(50000000);
      await tx.wait();

      const balanceBefore = await nutsToken.balanceOf(account2.address);
      expect(balanceBefore).to.equal(50000000);

      const tx2 = await scrapBoard.connect(account2).withdraw(50000000);
      await tx2.wait();

      const balanceAfter = await nutsToken.balanceOf(account2.address);
      expect(balanceAfter).to.equal(100000000);

      const scrapBoardBalance = await nutsToken.balanceOf(scrapBoard.address);
      expect(scrapBoardBalance).to.equal(0);

    });

  });

});
