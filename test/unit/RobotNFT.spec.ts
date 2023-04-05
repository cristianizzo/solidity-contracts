import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";

describe("RobotNFT", () => {

  const contractName = "RobotNFT";
  const contractSymbol = "rPNT";
  const metadataUri = "ipfs://QmQkhCQzRCsaFRPWqsf16YuNp6DtXxprgNXzFQeXCu94FW/";

  let robotContract: any;
  let robot: any;
  let owner: any;
  let account1: any;
  let account2: any;
  let accounts: any;

  beforeEach(async () => {

    robotContract = await ethers.getContractFactory("RobotNFT");
    [owner, account1, account2, ...accounts] = await ethers.getSigners();

    robot = await robotContract.deploy(contractName, contractSymbol, metadataUri);
    await robot.deployed();

  });

  it("Should get public variables", async () => {

    const metadataURI = await robot.metadataURI();
    expect(metadataURI).to.equal(metadataUri);

    const baseExtension = await robot.baseExtension();
    expect(baseExtension).to.equal(".json");

    const maxSupply = await robot.maxSupply();
    expect(maxSupply).to.equal(6);

    const name = await robot.name();
    expect(name).to.equal(contractName);

    const symbol = await robot.symbol();
    expect(symbol).to.equal(contractSymbol);

    const maxMintAmountReq = await robot.maxMintAmountReq();
    expect(maxMintAmountReq).to.equal(6);

  });

  describe("Only Owner", () => {

    describe("Max Mint Amount", () => {

      it("Should set max mint amount per request", async () => {

        const maxMintAmountReq = await robot.maxMintAmountReq();
        expect(maxMintAmountReq).to.equal(6);

        await robot.setMaxMintAmountPerRequest(1);

        const newMaxMintAmountReq = await robot.maxMintAmountReq();
        expect(newMaxMintAmountReq).to.equal(1);

        await robot.setMaxMintAmountPerRequest(6);

      });

      it("Should not change max mint amount if not the owner", async () => {

        await expect(
          robot.connect(account1).setMaxMintAmountPerRequest(1)
        ).to.be.revertedWith("Ownable: caller is not the owner");

      });

    });

    describe("Metadata URI", () => {

      it("Should set metadata URI", async () => {

        let metadataURI = await robot.metadataURI();
        expect(metadataURI).to.equal(metadataUri);


        const newMetadata = "xxx";
        await robot.setMetadataURI(newMetadata);

        metadataURI = await robot.metadataURI();
        expect(metadataURI).to.equal(newMetadata);

      });

      it("Should not change metadata URI if not the owner", async () => {

        await expect(
          robot.connect(account1).setMetadataURI("xxx")
        ).to.be.revertedWith("Ownable: caller is not the owner");

      });

    });

    describe("BaseExtension", () => {

      it("Should set base extension", async () => {

        let baseExtension = await robot.baseExtension();
        expect(baseExtension).to.equal(".json");

        const newBaseExtension = "xxx";
        await robot.setBaseExtension(newBaseExtension);

        baseExtension = await robot.baseExtension();
        expect(baseExtension).to.equal(newBaseExtension);

      });

      it("Should not change metadata URI if not the owner", async () => {

        await expect(
          robot.connect(account1).setBaseExtension("xxx")
        ).to.be.revertedWith("Ownable: caller is not the owner");

      });

    });

  });

  describe("Public", () => {

    it("Should get walletOfOwner", async () => {

      let tx = await robot.connect(owner).mint(account1.address, 2);
      await tx.wait();

      tx = await robot.connect(owner).mint(account2.address, 1);
      await tx.wait();

      let tokenIds = await robot.connect(account1).walletOfOwner(account1.address);

      expect(tokenIds[0]).to.eq(BigNumber.from(1));
      expect(tokenIds[1]).to.eq(BigNumber.from(2));

      tokenIds = await robot.connect(account1).walletOfOwner(account2.address);
      expect(tokenIds[0]).to.eq(BigNumber.from(3));

    });

    it("Should get tokenURI", async () => {

      let tx = await robot.connect(owner).mint(account1.address, 2);
      await tx.wait();

      let token = await robot.connect(account1).tokenURI(1);
      console.log(token);
      expect(token).to.eq("ipfs://QmQkhCQzRCsaFRPWqsf16YuNp6DtXxprgNXzFQeXCu94FW/1.json");

      let token2 = await robot.connect(account1).tokenURI(2);
      expect(token2).to.eq("ipfs://QmQkhCQzRCsaFRPWqsf16YuNp6DtXxprgNXzFQeXCu94FW/2.json");

    });

    describe("Mint", () => {

      it("Should not mint if not the owner", async () => {

        await expect(
          robot.connect(account1).mint(owner.address, 1)
        ).to.be.revertedWith("Ownable: caller is not the owner");

      });

      it("Should not mint if mint amount less than 1", async () => {

        await expect(
          robot.mint(owner.address, 0)
        ).to.be.revertedWith("invalid mint amount");

      });

      it("Should not mint if mint amount is more than maxMintAmountReq", async () => {

        await expect(
          robot.mint(owner.address, 11)
        ).to.be.revertedWith("mint amount too high");

      });

      it("Should mint until total supply is reached", async () => {

        let maxSupply = await robot.maxSupply();
        const totalSupply = await robot.totalSupply();

        expect(maxSupply).to.eq(BigNumber.from(6));
        expect(totalSupply).to.eq(BigNumber.from(0));

        let tx = await robot.connect(owner).mint(account1.address, 1);
        await tx.wait();

        let newTotalSupply = await robot.totalSupply();
        expect(newTotalSupply).to.eq(BigNumber.from(1));

        tx = await robot.connect(owner).mint(account1.address, 5);
        await tx.wait();

        newTotalSupply = await robot.totalSupply();
        expect(newTotalSupply).to.eq(BigNumber.from(6));

        await expect(
          robot.connect(owner).mint(account1.address, 6)
        ).to.be.revertedWith("maximum supply is reached");

      });

      it("Should not mint if not the owner", async () => {

        await expect(
          robot.connect(account1).mint(account1.address, 6)
        ).to.be.revertedWith("Ownable: caller is not the owner");

      });

    });

  });

});
