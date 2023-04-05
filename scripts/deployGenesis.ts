import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const signers = await ethers.getSigners();
  const Minter = await ethers.getContractFactory("Builders");
  const minter = await Minter.deploy("0xabA6EBFF17695C0a0F15742e335bf08A57eA8FeF");

  await minter.deployed();

  console.log("Deployed to:", minter.address, signers[0].address);

  fs.writeFileSync("./tasks/address.json", JSON.stringify({
    ...JSON.parse(fs.readFileSync("./tasks/address.json", "utf8")),
    genesis: minter.address
  }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
