import { ethers } from "hardhat";
import fs from "fs";

async function main() {

  const RobotNFT = await ethers.getContractFactory("RobotNFT");
  const robot = await RobotNFT.deploy("Peanut Robot NFT", "rPNT", "ipfs://QmQkhCQzRCsaFRPWqsf16YuNp6DtXxprgNXzFQeXCu94FW/");

  await robot.deployed();

  console.log("Peanut Robot NFT deployed to:", robot.address);

  fs.writeFileSync("./tasks/address.json", JSON.stringify({
    ...JSON.parse(fs.readFileSync("./tasks/address.json", "utf8")),
    robot: robot.address
  }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
