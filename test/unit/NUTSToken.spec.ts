import { expect } from "chai";
import { ethers } from "hardhat";

describe("NUTSToken", () => {

  const contractName = "TestNuts";
  const contractSymbol = "tNUTS";

  let tokenContract: any;
  let nutsToken: any;
  let nutsTokenSupply: any;
  let owner: any;
  let account1: any;
  let account2: any;
  let accounts: any;

  beforeEach(async () => {

    tokenContract = await ethers.getContractFactory("NUTSToken");
    [owner, account1, account2, ...accounts] = await ethers.getSigners();

    const totalSupply = 1000000000000; // 1 trillion
    nutsToken = await tokenContract.deploy(contractName, contractSymbol, totalSupply);
    await nutsToken.deployed();
    nutsTokenSupply = await nutsToken.totalSupply();

  });

  it("Should get contract info", async () => {

    const ownerBalance = await nutsToken.balanceOf(owner.address);
    expect(nutsTokenSupply).to.equal(ownerBalance);

    const symbol = await nutsToken.symbol();
    expect(symbol).to.equal(contractSymbol);

    const name = await nutsToken.name();
    expect(name).to.equal(contractName);

    const decimals = await nutsToken.decimals();
    expect(decimals).to.equal(18);

  });

  it("Should transfer tokens new address", async () => {

    const tx = await nutsToken.connect(owner).transfer(account1.address, nutsTokenSupply);
    await tx.wait();

    const balance = await nutsToken.balanceOf(owner.address);
    expect(balance).to.equal(0);

    const balanceAccount1 = await nutsToken.balanceOf(account1.address);
    expect(balanceAccount1).to.equal(nutsTokenSupply);

  });

  it("Should allow account1 to spend the tokens of the owner", async () => {

    await nutsToken.approve(account1.address, nutsTokenSupply);

    const tx = await nutsToken.connect(account1).transferFrom(owner.address, account1.address, nutsTokenSupply);
    await tx.wait();

    const balance = await nutsToken.balanceOf(owner.address);
    expect(balance).to.equal(0);

    const balanceAccount1 = await nutsToken.balanceOf(account1.address);
    expect(balanceAccount1).to.equal(nutsTokenSupply);

  });

});
