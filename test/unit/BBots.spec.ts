import { expect } from "chai";
import { ethers } from "hardhat";

describe("BBots", function() {
  let minter;
  let signers;

  before(async () => {
    signers = await ethers.getSigners();
    const Minter = await ethers.getContractFactory("BBots", signers[0]);
    minter = await Minter.deploy(10000, 1000, 50);
    await minter.deployed();
  });

  it("Should have the total nft supply", async () => {
    let totalSupply = await minter.totalSupply();
    expect(totalSupply).to.be.eq(0);
  });

  it("Should add to whitelist", async () => {
    const addresses: any[] = [];
    for (let i = 0; i < signers.length; i++) {
      let address = await signers[i].getAddress();
      addresses.push(address);
    }

    await minter.addToWhiteList(addresses);
    expect(await minter.WhiteListed(addresses[1])).to.be.true;
  });

  it("Should remove from the whitelist", async () => {
    const addr = await signers[3].getAddress();
    await minter.removeFromWhitelist(addr);
    expect(await minter.WhiteListed(addr)).to.be.false;
  });

  it("Should start the whitelist Sale", async () => {

    await minter.updateSaleState(1);

    const started = await minter.saleStatus();

    expect(started).to.be.eq(1);

  });

  it("Should buy from whitelist and check boss balance", async () => {

    const bossPrevBalance = await ethers.provider.getBalance(await signers[0].getAddress());

    await minter.connect(signers[2]).mintBbotsWL(2, {
      value: BigInt(0.02 * 2 * 1e18)
    });

    const bossAfterBalance = await ethers.provider.getBalance(await signers[0].getAddress());

    expect(bossAfterBalance).to.gt(bossPrevBalance);

    expect(await minter.balanceOf(await signers[2].getAddress())).to.be.eq(2);
  });

  it("Should start the sale", async () => {
    await minter.updateSaleState(2);
    const started = await minter.saleStatus();
    expect(started).to.be.eq(2);
  });

  it("Should mint some nft", async () => {
    await minter.connect(signers[1]).mintBbots(3, {
      value: BigInt(3 * 0.05 * 1e18)
    });
    const balance = await minter.balanceOf(signers[1].address);
    expect(balance).to.be.eq(3);
  });

  it("should transfer the nft", async () => {
    let myTokens = await minter.tokensOfOwner(signers[1].address);
    await minter.connect(signers[1]).transferFrom(signers[1].address, signers[0].address, myTokens[0].toNumber());
    let isOwner = await minter.ownerOf(myTokens[0].toNumber());
    expect(isOwner).to.be.eql(signers[0].address);
  });

  it("should approve", async () => {
    let myTokens = await minter.tokensOfOwner(signers[1].address);
    await minter.connect(signers[1]).approve(signers[3].address, myTokens[1].toString());
  });

  it("Should approve all", async () => {
    await minter.setApprovalForAll(signers[1].address, true);
  });

  it("Should return the proper base uri", async () => {
    await minter.updateBaseUri("https://dev.peanuthub.com/nft/");
    const tokenUri = await minter.tokenURI(1);
    expect(tokenUri).to.be.eq("https://dev.peanuthub.com/nft/1.json");
  });

  it("Should update the cost price of nfts", async () => {
    await minter.updateNftPrice(BigInt(0.2 * 1e18), BigInt(0.1 * 1e18));

    await minter.connect(signers[4]).mintBbots(2, {
      value: BigInt(0.2 * 2 * 1e18)
    });

    expect(await minter.balanceOf(await signers[4].getAddress())).to.be.eq(2);

    await minter.updateSaleState(1);

    expect(await minter.saleStatus()).to.be.eq(1);

    await minter.connect(signers[5]).mintBbotsWL(2, {
      value: BigInt(0.1 * 2 * 1e18)
    });

    expect(await minter.balanceOf(await signers[5].getAddress())).to.be.eq(2);
  });

  it("Should mint for dev", async () => {
    await minter.devMint(await signers[6].getAddress(), 10);
    expect(await minter.balanceOf(signers[6].getAddress())).to.be.eq(10);
  });

  it("Should validate the supply limit", async () => {
    const REMAINING_RESERVE = await minter.REMAINING_RESERVE();
    const remainingReserve = 50 - (50 - REMAINING_RESERVE.toNumber());
    const whitelistMinted = await minter.REMAINING_WL();
    const remainingWhitelist = 1000 - (1000 - whitelistMinted.toNumber());

    await minter.devMint(await signers[7].getAddress(), remainingReserve);

    expect(await minter.balanceOf(await signers[7].getAddress())).to.be.eq(remainingReserve);

    await expect(minter.devMint(await signers[8].getAddress(), 1)).to.be.revertedWith("Exceeds reserved suppl");

    await minter.updateSaleState(1);
    await minter.updateMaxMint(remainingWhitelist);
    await minter.updateNftPrice(BigInt(0.0002 * 1e18), BigInt(0.0001 * 1e18));

    await minter.connect(signers[8]).mintBbotsWL(remainingWhitelist, {
      value: BigInt(remainingWhitelist * 0.0001 * 1e18)
    });

    let addrBalance = await minter.balanceOf(await signers[8].getAddress());
    expect(remainingWhitelist).to.be.eq(addrBalance);


    await expect(
      minter.connect(signers[8]).mintBbotsWL(1, {
        value: BigInt(0.0001 * 1e18)
      })
    ).to.be.revertedWith("EXCEEDS_SUPPLY");


    const totalSupply = await minter.totalSupply();
    const remainingToMint = 10000 - totalSupply.toNumber();

    await minter.updateSaleState(2);

    await minter.updateMaxMint(remainingToMint);

    await minter.connect(signers[9]).mintBbots(remainingToMint, {
      value: BigInt(remainingToMint * 0.0002 * 1e18)
    });

    addrBalance = await minter.balanceOf(await signers[9].getAddress());
    expect(addrBalance).to.be.eq(remainingToMint);

    await expect(
      minter.connect(signers[0]).mintBbots(1, {
        value: BigInt(0.0002 * 1e18)
      })
    ).to.be.revertedWith("EXCEEDS_SUPPLY");
  });
});
