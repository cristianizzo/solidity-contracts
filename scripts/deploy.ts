import { ethers } from "hardhat";

async function initRobotNFT() {

  const RobotNFT = await ethers.getContractFactory("RobotNFT");
  const robot = await RobotNFT.deploy("Peanut Robot NFT", "rPNT", "ipfs://QmQkhCQzRCsaFRPWqsf16YuNp6DtXxprgNXzFQeXCu94FW/");

  await robot.deployed();

  console.log("Peanut Robot NFT deployed to:", robot.address);

  return robot.address;

}


async function main() {

  // await initNUTSToken();
  // await initScrapBox();
  await initRobotNFT();

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
