import { Wallet } from "zksync-web3";
import hre, { ethers } from "hardhat";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import fs from "fs";

async function main() {

  const zkWallet = new Wallet(process.env.PRIVATE_KEY as string);

  const deployer = new Deployer(hre, zkWallet);
  const artifact = await deployer.loadArtifact("Greeter");

  const greeting = "hello world";
  const deploymentFee = await deployer.estimateDeployFee(artifact, [greeting]);

  // OPTIONAL: Deposit funds to L2
  // const depositHandle = await deployer.zkWallet.deposit({
  //   to: deployer.zkWallet.address,
  //   token: utils.ETH_ADDRESS,
  //   amount: deploymentFee.mul(2)
  // });
  // Wait until the deposit is processed on zkSync
  // await depositHandle.wait();

  const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);
  const greeterContract = await deployer.deploy(artifact, [greeting]);
  //obtain the Constructor Arguments
  console.log("constructor args:" + greeterContract.interface.encodeDeploy([greeting]));

  // Show the contract info.
  const contractAddress = greeterContract.address;
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);

  fs.writeFileSync("./tasks/address.json", JSON.stringify({
    ...JSON.parse(fs.readFileSync("./tasks/address.json", "utf8")),
    zkSync: contractAddress
  }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

