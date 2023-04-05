import { ethers } from "hardhat";
import fs from "fs";

async function main() {

  const contractName = "ScarpBoxGame";
  const contractSymbol = "tNUTS";
  const totalSupply = 1000000000000;

  const NUTSToken = await ethers.getContractFactory("NUTSToken");
  const nutsToken = await NUTSToken.deploy(contractName, contractSymbol, totalSupply);

  await nutsToken.deployed();

  console.log("ERC20 tNUTS deployed to: ", nutsToken.address);

  fs.writeFileSync("./tasks/address.json", JSON.stringify({
    ...JSON.parse(fs.readFileSync("./tasks/address.json", "utf8")),
    nutsToken: nutsToken.address
  }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
