import fetch from 'cross-fetch';
import { Dictionary, MetaData } from './types';

async function getTokenLists() {
    console.log('Compiling tokenlists')
    let tokenLists: Dictionary<string> = {
        '1': "https://account.metafi.codefi.network/networks/1/tokens",
        '10': "https://account.metafi.codefi.network/networks/10/tokens",
        '137': "https://account.metafi.codefi.network/networks/137/tokens",
        '51': "https://account.metafi.codefi.network/networks/56/tokens",
        '43114': "https://account.metafi.codefi.network/networks/43114/tokens",
        '42161': "https://account.metafi.codefi.network/networks/42161/tokens",
        '250': "https://account.metafi.codefi.network/networks/250/tokens"
    }

    let promiseArray = Object.keys(tokenLists).map(netId=>{
        return fetch(tokenLists[netId]).then(r=>r.json())
    });

    let result = await Promise.allSettled(promiseArray);
    let res: Array<MetaData> = [];
    for (let index = 0; index < result.length; index++) {
        const data = result[index];
        if(data.status=='fulfilled'){
            res = res.concat(data.value);
        }
    }
    console.log('🪙 ', res.length, 'Tokens')

    res.push({
        "name": "Matic",
        "symbol": "MATIC",
        "decimals": 18,
        "address": "0x0000000000000000000000000000000000001010",
        "iconUrl": "https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png",
        "sources": [
            "https://wiki.polygon.technology/docs/faq/wallet-bridge-faq/#why-is-the-matic-token-is-not-supported-on-pos"
        ],
        "chainId": 137,
        "coingeckoId": "matic-network"
    })

    return res;
}

export default getTokenLists;
