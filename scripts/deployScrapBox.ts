import { ethers } from "hardhat";
import fs from "fs";

async function main() {

  const tNutsAddress = process.env.NUTS_CONTRACT_ADDRESS;
  const gameAccountAddress = process.env.GAME_WALLET_ADDRESS;

  const ScrapBoard = await ethers.getContractFactory("ScrapBoard");
  const scrapBoard = await ScrapBoard.deploy(tNutsAddress, gameAccountAddress);

  await scrapBoard.deployed();

  console.log("ScrapBoxGames ScrapBoard Contract deployed to: ", scrapBoard.address);

  fs.writeFileSync("./tasks/address.json", JSON.stringify({
    ...JSON.parse(fs.readFileSync("./tasks/address.json", "utf8")),
    scrapBoard: scrapBoard.address
  }));

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
