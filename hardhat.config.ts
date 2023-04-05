import {HardhatUserConfig, task} from 'hardhat/config';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import '@nomiclabs/hardhat-web3';
import '@openzeppelin/hardhat-upgrades';
import '@matterlabs/hardhat-zksync-deploy';
import '@matterlabs/hardhat-zksync-solc';
import accounts from './test/mock/accounts.json';
import initTask from './tasks/minter';

require('dotenv').config();
initTask(task);

const config: HardhatUserConfig | any = {
  solidity: {
    compilers: [
      {
        version: '0.8.4',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  zkTestnet: {
    version: "1.3.5",
    compilerSource: "binary",
    settings: {},
  },
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
      gasMultiplier: 1,
      accounts: [process.env.PRIVATE_KEY],
    },
    hardhat: {
      forking: {
        url: `https://mainnet.infura.io/v3/${process.env.INFURA}`,
      }
    },
    zkTestnet: {
      url: 'https://zksync2-testnet.zksync.dev',
      ethNetwork: 'goerli',
      zksync: true,
    },
    live: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA}`,
      chainId: 1,
      accounts: [process.env.PRIVATE_KEY],
    },
    mumbai: {
      url: `https://rpc-mumbai.maticvigil.com`,
      chainId: 80001,
      accounts: accounts.privateKey,
    },
    testnet: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA}`,
      chainId: 4,
      accounts: accounts.privateKey,
      gasMultiplier: 2,
    }
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN,
  },
  abiExporter: {
    path: './data/abi',
    clear: true,
    spacing: 2,
  },
  spdxLicenseIdentifier: {
    overwrite: false,
    runOnCompile: true,
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  mocha: {
    timeout: 20000,
    enableTimeouts: true,
  },
};

export default config;
