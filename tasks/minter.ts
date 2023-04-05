import addresses from './address.json';
import pvKeys from '../test/mock/accounts.json'
async function showTxStatus(tx: any, hre: any) {
    console.log('[Transaction]', tx.hash);
    let receipt = await tx.wait();
    console.log(`[Cost] ${hre.ethers.utils.formatEther(tx.gasPrice * receipt.gasUsed)} ETH`);
}

async function getMinter(hre, artifact = 'BBots') {
    return await hre.ethers.getContractAt(artifact, addresses.genesis);
}

export default function initTask(task: any) {
    task('pause', 'Pause all transfers ').setAction(async (taskArgs: any, hre: any) => {
        let minter = await getMinter(hre);
        let tx = await minter.pause();
        await showTxStatus(tx, hre);
    });

    task('unpause', 'UnPause all transfers ').setAction(async (taskArgs: any, hre: any) => {
        let minter = await getMinter(hre);
        let tx = await minter.unpause();
        await showTxStatus(tx, hre);
    });

    task('sale-status', 'Update Sale Status')
        .addParam('status', 'Sale Status, 0 fot no sale, 1 for whitelist sale and 2 for public sale')
        .setAction(async (taskArgs: any, hre: any) => {
            let minter = await getMinter(hre)
            let tx = await minter.updateSaleState(taskArgs.status);
            await showTxStatus(tx, hre);
        })

    task('balance', 'Get Balance').setAction(async (arg: any, hre: any) => {
        const accounts = await hre.ethers.getSigners();
        for (let i = 0; i < accounts.length; i++) {
            let balance = await hre.web3.eth.getBalance(accounts[i].address);
            console.log(pvKeys.privateKey[i], accounts[i].address, balance / 1e18);
        }
    });

    task('add-whitelist').setAction(async (arg: any, hre: any) => {
        const accounts = (await hre.ethers.getSigners());
        let minter = await getMinter(hre)
        accounts.shift()
        const wl: any = []
        for (let i = 0; i < accounts.length; i++) {
            wl[i] = await accounts[i].getAddress()
        }
        const tx = await minter.addToWhiteList(wl)
        await showTxStatus(tx, hre)
    })

    task('new-whitelist')
        .addParam('address', 'Address to remove from whitelist')
        .setAction(async (arg: any, hre: any) => {
            let minter = await getMinter(hre)
            const tx = await minter.addToWhiteList([arg.address])
            await showTxStatus(tx, hre)
        })

    task('remove-whitelist')
        .addParam('address', 'Address to remove from whitelist')
        .setAction(async (arg: any, hre: any) => {
            let minter = await getMinter(hre)
            const tx = await minter.removeFromWhitelist(arg.address)
            await showTxStatus(tx, hre)
    })

    task('migrate-ipfs', 'Update the base uri')
        .addParam('url', 'New Base Url eg. ipfs ')
        .setAction(async (arg: any, hre: any) => {
            let minter = await getMinter(hre);
            let tx = await minter.updateBaseUri(arg.cid);
            await showTxStatus(tx, hre);
        });

    task('dev-mint', 'Mint by the dev team')
        .addParam('num', 'Total number of nft')
        .addParam('address', 'Address to receive')
        .setAction(async (taskArgs: any, hre: any) => {
            let minter = await getMinter(hre);
            let tx = await minter.devMint(taskArgs.address, taskArgs.num);
            await showTxStatus(tx, hre);
        });

    task('gen:update-sale', 'Update the sale status')
        .addParam('status', 'Sale Status, 0 fot no sale, 1 for sale')
        .setAction(async (taskArgs: any, hre: any) => {
            let minter = await getMinter(hre, 'Builders')
            let tx = await minter.updateSaleState(taskArgs.status != '0');
            await showTxStatus(tx, hre);
        })

    task('gen:pause', 'Pause all transfers ').setAction(async (taskArgs: any, hre: any) => {
        let minter = await getMinter(hre, 'Builders');
        let tx = await minter.pause();
        await showTxStatus(tx, hre);
    });

    task('gen:unpause', 'UnPause all transfers ').setAction(async (taskArgs: any, hre: any) => {
        let minter = await getMinter(hre, 'Builders');
        let tx = await minter.unpause();
        await showTxStatus(tx, hre);
    });

    task('gen:update-uri', 'Update the base uri')
        .addParam('url', 'New Base Url eg. ipfs ')
        .setAction(async (arg: any, hre: any) => {
            let minter = await getMinter(hre, 'Builders');
            let tx = await minter.updateBaseUri(arg.url);
            await showTxStatus(tx, hre);
        });
}
