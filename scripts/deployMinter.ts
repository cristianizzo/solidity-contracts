import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const signers = await ethers.getSigners();
  const Minter = await ethers.getContractFactory("BBots");
  const minter = await Minter.deploy(10000, 1000, 50);

  await minter.deployed();

  console.log("Box deployed to:", minter.address, signers[0].address);

  fs.writeFileSync("./tasks/address.json", JSON.stringify({
    ...JSON.parse(fs.readFileSync("./tasks/address.json", "utf8")),
    minter: minter.address
  }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
