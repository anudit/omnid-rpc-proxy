import util from 'node:util';
const exec = util.promisify(require('node:child_process').exec);

import { lifejacketSupportedNetwork } from '../types';
import { getEnv } from '../utils';

export async function setSolidityVersion(version: string): Promise<boolean> {
    const { stderr } = await exec(`solc-select use ${version} --always-install`);
    if (stderr === '') return true;
    else {
        console.error(stderr);
        return false;
    }
}

export const networkIdToEtherscanEndpoint = new Map<lifejacketSupportedNetwork, string>([
    ['mainnet', `https://api.etherscan.io/api?apikey=${getEnv('ETHERSCAN_API_KEY')}`],
    ['polygon', `https://api.polygonscan.com/api?apikey=${getEnv('POLYGONSCAN_API_KEY')}`],
    ['polygon-testnet', `https://api-testnet.polygonscan.com/api?apikey=${getEnv('POLYGONSCAN_API_KEY')}`]
])
