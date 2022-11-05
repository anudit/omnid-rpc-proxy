'strict'

import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
const server: FastifyInstance = fastify({ logger: false })

import helmet from '@fastify/helmet'
import compress from '@fastify/compress'
import cors from '@fastify/cors'

import { readFileSync } from 'fs';
import path from 'path'

import fetch from 'cross-fetch';
const toBuffer = require('ethereumjs-util').toBuffer
import { FeeMarketEIP1559Transaction } from '@ethereumjs/tx'
import { Convo } from '@theconvospace/sdk'
import { getAddress, isAddress } from '@ethersproject/address'
const checkForPhishing = require('eth-phishing-detect');
import { AlchemySimulationReq, AlchemySimulationResp, IQuerystring, IRouteParams, JsonRpcReq, RpcResp, lifejacketSupportedNetwork, SourifyResp, supportedNetworkIds, SupportedJackets, DoHResp, MegaHashType, blacklistIndices, Dictionary, DapplistResponse, DefipulseResponse, DappsResponse, supportedEnvVars, MetaData, WalletconnectResponse } from './types';
import { getEnv, getEnvJson, parseSerialFromAnswerData } from "./utils";
import { testUsingMythril } from "./lifejackets/mythril";
import { testUsingSlither } from "./lifejackets/slither";
import { closest, distance } from 'fastest-levenshtein';
import { SocksProxyAgent } from "socks-proxy-agent";

import util from 'node:util';
import { numToBlacklist } from "./globals";
import getTokenLists from "./tokenlists";
const exec = util.promisify(require('node:child_process').exec);

server.register(helmet, { global: true })
server.register(compress, { global: true })
server.register(cors, { origin: "*" })

const MegaHash = require('megahash');
const hashTable: MegaHashType = new MegaHash();
let whitelist = new Set<string>();

const SIMULATE_URL = `https://api.tenderly.co/api/v1/account/${getEnv('TENDERLY_USER')}/project/${getEnv('TENDERLY_PROJECT')}/simulate`
const proxyUrl = 'socks5://0.0.0.0:9150';
let tokenList: Array<MetaData> = [];

const convo = new Convo(getEnv('CONVO_API_KEY'));
const computeConfig = {
    alchemyApiKey: getEnv('ALCHEMY_API_KEY'),
    CNVSEC_ID: getEnv('CNVSEC_ID'),
    etherscanApiKey: getEnv('ETHERSCAN_API_KEY'),
    polygonscanApiKey: getEnv('POLYGONSCAN_API_KEY'),
    optimismscanApiKey: getEnv('OPTIMISMSCAN_API_KEY'),
    polygonMainnetRpc: '',
    etherumMainnetRpc: '',
    avalancheMainnetRpc: '',
    maticPriceInUsd: 0,
    etherumPriceInUsd: 0,
    deepdaoApiKey: '',
    zapperApiKey: '',
    DEBUG: false,
};

const netIdToEnv =  new Map<supportedNetworkIds, supportedEnvVars>([
    ['mainnet', 'MAINNET_RPC_URL'],
    ['mainnet-flashbots', 'MAINNET_FLASHBOTS_RPC_URL'],
    ['mainnet-flashbots-fast', 'MAINNET_FLASHBOTS_FAST_RPC_URL'],
    ['ropsten', 'ROPSTEN_RPC_URL'],
    ['kovan', 'KOVAN_RPC_URL'],
    ['rinkeby', 'RINKEBY_RPC_URL'],
    ['goerli', 'GOERLI_RPC_URL'],
    ['sepolia', 'SEPOLIA_RPC_URL'],
    ['goerli-flashbots', 'GOERLI_FLASHBOTS_RPC_URL'],
    ['polygon', 'POLYGON_RPC_URL'],
    ['polygon-testnet', 'POLYGON_TESTNET_RPC_URL'],
    ['polygon-zkevm', 'POLYGON_ZKEVM_RPC_URL'],
    ['optimism', 'OPTIMISM_RPC_URL'],
    ['optimism-testnet', 'OPTIMISM_TESTNET_RPC_URL'],
    ['optimism-bedrock', 'OPTIMISM_BEDROCK_RPC_URL'],
    ['arbitrum', 'ARBITRUM_RPC_URL'],
    ['arbitrum-nova', 'ARBITRUM_NOVA_RPC_URL'],
    ['arbitrum-testnet', 'ARBITRUM_TESTNET_RPC_URL'],
    ['bsc', 'BSC_RPC_URL'],
    ['bsc-testnet', 'BSC_TESTNET_RPC_URL'],
    ['fantom', 'FANTOM_RPC_URL'],
    ['fantom-testnet', 'FANTOM_TESTNET_RPC_URL'],
]);

const networkToRpc = (netId: supportedNetworkIds): string => {
    let envName = netIdToEnv.get(netId);
    if (envName){
        let urls: Array<string> = getEnvJson(envName);
        return urls[Math.floor(Math.random() * urls.length)]
    }
    else {
        return '';
    }
}

function getMalRpcError(message: string, details: any = undefined): RpcResp {
    return {
        isMalicious: true,
        rpcResp:{
            "id": 420,
            "jsonrpc": "2.0",
            "error": {
                "code": -32003, // https://eips.ethereum.org/EIPS/eip-1474#error-codes
                "message": message
            }
        },
        details: details
    }
}

async function checkAddress(address: string): Promise<RpcResp> {
    try {
        if (isAddress(address)){
            let result = await convo.omnid.kits.isMalicious(getAddress(address), computeConfig);
            console.log('omnid.kits.isMalicious', getAddress(address), result);

            if (result?.alchemy && result.alchemy === true) return getMalRpcError(`Spam Contract Flagged by Alchemy`, result);
            else if (result?.chainabuse && Boolean(result.chainabuse) === true) return getMalRpcError(`Contract Flagged by Chainabuse`, result);
            else if (result?.scanblocks && result.scanblocks === true) return getMalRpcError(`Address Flagged by Scanblocks`, result);
            else if (result?.cryptoscamdb && result.cryptoscamdb === true) return getMalRpcError(`Contract Flagged by CryptoscamDB`, result);
            else if (result?.etherscan && 'label' in result.etherscan) return getMalRpcError(`Address Flagged as ${result.etherscan.label} by Etherscan`, result);
            else if (result?.mew && 'comment' in result.mew) return getMalRpcError(`Address Flagged by MyEtherWallet`, result);
            else if (result?.sdn) return getMalRpcError(`Address Flagged by OFAC`, result);
            else if (result?.tokenblacklist) return getMalRpcError(`Address Blacklisted by Stablecoin`, result);
            else if (result?.txn) return getMalRpcError(`Address/Contract Funded by Tornado Cash.`, result);
            else return {isMalicious: false}
        }
        else return {isMalicious: false}

    } catch (error) {
        return {isMalicious: false}
    }
}

async function alchemySimulate(simData: AlchemySimulationReq): Promise<AlchemySimulationResp | false> {
    try {

        let resp = await fetch(SIMULATE_URL, {
            method: "POST",
            body: JSON.stringify(simData),
            headers: {
                'X-Access-Key': getEnv('TENDERLY_ACCESS_KEY'),
            }
        }).then(r=>r.json());

        return resp as AlchemySimulationResp;

    } catch (error) {
        console.log('alchemySimulate', error);
        return false;
    }
}

async function sendToRpc(network: supportedNetworkIds, req: FastifyRequest, overrideRpcUrl: string = "") {
    let query = req.query as IQuerystring;
    try {

        let rpcUrl = network === 'manual' ? (overrideRpcUrl === "" ? query.rpcUrl : overrideRpcUrl) : networkToRpc(network);
        if (rpcUrl !== undefined){

            // Proxy the Request without any PII.
            let data = await fetch(rpcUrl, {
                method: "POST",
                body: JSON.stringify(req.body),
                // @ts-expect-error - shut up ts, it works.
                agent: query?.useTor === 'true' ? new SocksProxyAgent(proxyUrl) : null,
                headers: {
                    'Content-Type': 'application/json',
                    "Accept": 'application/json',
                    "infura-source": 'metamask/internal',                           // for infura based rpc urls, look like metamask xD.
                    "origin": 'chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn' // for infura based rpc urls, look like metamask xD.
                }
            }).then(e=>e.json());

            // console.log('sendToRpc/result', rpcUrl, data);
            return data;

        }
        else {
            let {rpcResp} = getMalRpcError('Invalid RPC Url');
            return rpcResp;
        }

    } catch (error) {
        let {rpcResp} = getMalRpcError(error as string);
        return rpcResp;
    }
}

async function processTxs(network: supportedNetworkIds, req: FastifyRequest) {

    const body = req.body as JsonRpcReq;
    const query = req.query as IQuerystring;

    var txData = toBuffer(body['params'][0])
    var deserializedTx = FeeMarketEIP1559Transaction.fromSerializedTx(txData);
    var deserializedTxParsed = deserializedTx.toJSON();

    // console.log('deserializedTx', deserializedTxParsed);

    // Check `to`
    //      if malicious then revert txn
    if (Object.keys(deserializedTxParsed).includes('to') === true){
        let {isMalicious, rpcResp} = await checkAddress((deserializedTxParsed.to) as string);
        if (isMalicious == true && rpcResp){
            rpcResp.id = body.id;
            return rpcResp; // Return if Mal intent found.
        }
    }

    let gas_price = parseInt(deserializedTxParsed.maxFeePerGas || '0') + parseInt(deserializedTx.maxPriorityFeePerGas.toString(10) || '0')
    // Simulate Txn
    let simData: AlchemySimulationReq = {
        "network_id": parseInt(deserializedTx.chainId.toString(10)),
        "from": deserializedTx.getSenderAddress().toString(),
        "to":  deserializedTx.to ? deserializedTx.to.toString() : "",
        "input": deserializedTx.data.toString('hex'),
        "gas": parseInt(deserializedTx.gasLimit.toString(10)),
        "gas_price": gas_price.toString(10),
        "value": parseInt(deserializedTx.value.toString(10)),
        "save_if_fails": true,
        "save": false,
        "simulation_type": "full"
    }
    let alResp = await alchemySimulate(simData);

    if (alResp != undefined && alResp != false && 'transaction_info' in alResp && alResp.transaction_info != undefined){
        console.log('Sim Successful')
        for (let index = 0; index < alResp.transaction_info.logs.length; index++) {
            const logData = alResp.transaction_info.logs[index];

            // Scan through the events emitted for malicious addresses.
            if (logData.name === 'Approval' || logData.name === 'Transfer'){
                let {isMalicious, rpcResp} = await checkAddress(logData.inputs[1].value);
                // console.log('logcheck', getAddress(deserializedTxParsed.to), isMalicious, rpcResp);
                if (isMalicious === true) return rpcResp;
            }
            // TODO: if token value greater than tolerance for token then revert.

        }
    }

    // test blockUnverifiedContracts
    if (network != 'manual' && 'blockUnverifiedContracts' in query && query.blockUnverifiedContracts === 'true'){
        let verificationReq = await fetch(`https://sourcify.dev/server/check-all-by-addresses?addresses=${deserializedTxParsed?.to}&chainIds=1,4,11155111,137,80001,10,42161,421611`);
        let verificationResp;
        if (verificationReq.ok === true) {
            verificationResp = await verificationReq.json() as SourifyResp
            if (Object.keys(verificationResp).includes('status')){ // mean unverified.
                let {rpcResp} = getMalRpcError('The contract is unverified');
                return rpcResp;
            };
        }
        else {
            let {rpcResp} = getMalRpcError('Sourcify Request Failed');
            return rpcResp;
        }

    }

    // test enableScanners
    if (network in ['mainnet', 'polygon', 'polygon-testnet'] && query?.enableScanners !== undefined && deserializedTxParsed.to !== undefined){
        let networkId = network as lifejacketSupportedNetwork;
        let scanners = query.enableScanners.split(',');
        for (let index = 0; index < scanners.length; index++) {
            const scanner = scanners[index];
            if (scanner === 'slither'){
                let slTest = await testUsingSlither(networkId, deserializedTxParsed.to);
                if (slTest.results.length>0){
                    return getMalRpcError('Slither detected possible attack vectors');
                }
            }
            // else if (scanner === 'mythril'){
            //     let slTest = await testUsingMythril(networkId, deserializedTxParsed.to);
            //     if (slTest.results.length>0){
            //         return getMalRpcError('Slither detected possible attack vectors');
            //     }
            // }
        }
    }

    // test blockRecentDnsUpdates
    if (query?.blockRecentDnsUpdates != undefined && Boolean(parseInt(query.blockRecentDnsUpdates)) === true){
        let days = parseInt(query.blockRecentDnsUpdates);
        let dnsQuery = await fetch(`https://dns.google/resolve?name=${req.hostname}&type=SOA`);
        if (dnsQuery.ok === true) {
            const dnsQueryResp = await dnsQuery.json() as DoHResp;
            if (dnsQueryResp.Answer.length > 0 && parseSerialFromAnswerData(dnsQueryResp.Answer[0].data) != false){
                let dtUpdated = parseSerialFromAnswerData(dnsQueryResp.Answer[0].data);
                if (dtUpdated !== false){
                    let diffDays = (Date.now() - dtUpdated.valueOf()) / (60*60*24*1000);
                    if (diffDays <= days){
                        let { rpcResp } = getMalRpcError("The domain's DNS has been changed recently.");
                        return rpcResp;
                    }
                }
            };
        }
    }

    // Use Gas Hawk, enable only on mainnet.
    if (network === 'mainnet' && query?.useGasHawk != undefined && query.useGasHawk === 'true'){
        return await sendToRpc('manual', req, 'https://beta-be.gashawk.io:3001/proxy/rpc');
    }

    // If nothing found, simply submit txn to network.
    return await sendToRpc(network, req);

}

server.get('/', async (req: FastifyRequest, reply: FastifyReply) => {
    const stream = readFileSync(path.join(__dirname, '../public/', 'index.html'))
    reply.header("Content-Security-Policy", "default-src *; style-src 'self' 'unsafe-inline' cdnjs.cloudflare.com; script-src 'self' 'unsafe-inline'; img-src data:;");
    return reply.type('text/html').send(stream)
})

server.get('/ping', async (req: FastifyRequest, reply: FastifyReply) => {
    return reply.send({'hello':'world'})
})

server.get('/blacklist', async (req: FastifyRequest, reply: FastifyReply) => {
    reply.headers({ 'Cache-Control': `max-age=${24*60*60}` });
    return reply.send(hashTable.stats())
})

server.get('/whitelist', async (req: FastifyRequest, reply: FastifyReply) => {
    reply.headers({ 'Cache-Control': `max-age=${24*60*60}` });
    return reply.send(Array.from(whitelist.values()));
})

server.get('/tor', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { stdout, stderr } = await exec('cat /var/lib/tor/hidden_service/hostname');
        if(stderr == "") {
            return reply.send({'domain': stdout.replace('\n', '')});
        }
        else {
            return reply.send({'domain': false, 'error': stderr});
        }
    } catch (error) {
        return reply.send({'domain': false, 'error': error});
    }
})

server.get('/blacklist/*', async (req: FastifyRequest, reply: FastifyReply) => {
    reply.headers({ 'Cache-Control': `max-age=${24*60*60}` })
    const params = req.params as {'*': string};
    const res = hashTable.get(params['*']);
    if (res === undefined) return reply.send({'blacklisted': false})
    else {
        let closestValid = closest(params['*'], Array.from(whitelist));
        let closestScore = distance(params['*'], closestValid);
        return reply.send({'blacklisted': true, 'list': numToBlacklist[res], 'closestWhitelisted': {url: closestValid, distance: closestScore}})
    }
})

server.get('/malicious/:ethAddress', async (req: FastifyRequest, reply: FastifyReply) => {
    reply.headers({ 'Cache-Control': `max-age=${24*60*60}` })
    const params = req.params as {'ethAddress': string};
    const res = await checkAddress(params['ethAddress']);
    return reply.send(res);
})

server.get('/tokendeets/:ethAddress', async (req: FastifyRequest, reply: FastifyReply) => {
    reply.headers({ 'Cache-Control': `max-age=${24*60*60}` })
    const params = req.params as {'ethAddress': string};
    if (Boolean(params?.ethAddress) === false) reply.send([]);
    let resTokens: Array<MetaData> = [];
    for (let i = 0; i < tokenList.length; i++) {
        if (Boolean(tokenList[i]?.address) && tokenList[i]?.address.toLowerCase() === params?.ethAddress.toLowerCase()){
            resTokens.push(tokenList[i]);
        };
    }
    return reply.send(resTokens);
})

server.post('/lifejacket/:jacket', async (req: FastifyRequest, reply: FastifyReply) => {
    const supportedJackets : Array<SupportedJackets> = ['slither', 'mythril'];
    const {jacket} = req.params as {jacket: SupportedJackets};
    if(supportedJackets.includes(jacket)){
        const {network, address} = req.body as {network: string, address: string};
        if(network != undefined && address != undefined && isAddress(address)){
            if (jacket === 'slither'){
                let sr = await testUsingSlither(network as lifejacketSupportedNetwork, address);
                return reply.send(sr);
            }
            // else if (jacket === 'mythril'){
            //     let sr = await testUsingMythril(network as lifejacketSupportedNetwork, address);
            //     return reply.send(sr)
            // }
        }
        else return reply.send({success: false, error: "Invalid body params, network or address"})
    }
    else return reply.send({success: false, error: `Invalid LifeJacket, supported ${supportedJackets.toString()}`})
});

server.post('/:network', async (req: FastifyRequest, reply: FastifyReply) => {
    let { hostname } =  req;
    const body = req.body as JsonRpcReq;

    let isPhishing = checkForPhishing(hostname);

    if (!isPhishing && Boolean(hashTable.get(hostname)) === false){
        const {network} = req.params as IRouteParams;

        if (network && netIdToEnv.get(network)){ // valid chain
            if (body['method'] == 'eth_sendRawTransaction') {
                // Check for Malicious Activity
                let resp = await processTxs(network, req)
                return reply.send(resp);
            }
            else {
                let resp = await sendToRpc(network, req);
                return reply.send(resp)
            }
        }
        else {
            return reply.send({error: `Invalid network '${network}', available networks are ${Array.from(netIdToEnv.keys()).join(', ')}`})
        }
    }
    else {
        let {rpcResp} = getMalRpcError(`🚨 Phishing detector for the site ${hostname} has been triggered.`)
        return reply.send(rpcResp);
    }
})

server.addHook('preHandler', (req, reply, done) => {
    reply.header("onion-location", `http://omnid2kq4qppsp2a5hgeqok6ahkfo23tdtoe7km4uier4o43taxct5ad.onion${req.url}`);
    done();
})

async function clearWhitelist() {
    hashTable.delete('instagram.com'); // blocked by cryptoscamdb.
    // Clear verified dapp urls from blacklist as a precaution.

    let defillamaList: { protocols: Array<{url: string}> }= await fetch('https://api.llama.fi/lite/protocols2').then(r=>r.json());
    defillamaList['protocols'].forEach((link) => {
        try {
            let url = new URL(link.url.replace('\n',"").replace('\r',"")).hostname.replace('www.',"");
            whitelist.add(url);
            hashTable.delete(url);
        } catch (error) {
            // console.log('Defillama invalid_url', link, error);
        }
    });
    console.log('🟢 DefiLlama Whitelist', defillamaList['protocols'].length);


    let dapplist: DapplistResponse = await fetch('https://api2.thedapplist.com/api/v2/proposals/listed?offset=0&limit=1000000').then(r=>r.json());
    let dapplistCount = 0;
    Object.values(dapplist.data.list).forEach((dapp)=>{
        try {
            if(dapp.numberOfVotes >= 5){
                let url = new URL(dapp.url).hostname.replace('www.',"");
                whitelist.add(url);
                hashTable.delete(url);
                dapplistCount+=1
            }
        } catch (error) {
            // console.log('dapplist invalid_url', link, error);
        }
    })
    console.log('🟢 Dapplist Whitelist',  dapplistCount);

    let defipulselist: DefipulseResponse = await fetch('https://gist.githubusercontent.com/anudit/8df081a368397dea5ff4ce8bdfac6256/raw/9d36d984fe3ed78bd1f993c4cca22ec4093d9253/index.json').then(r=>r.json());
    let defipulselistCount = 0;
    Object.values(defipulselist.pageProps.defiList).forEach((dapp)=>{
        try {
            let url = new URL(dapp.url).hostname.replace('www.',"");
            whitelist.add(url);
            hashTable.delete(url);
            defipulselistCount+=1
        } catch (error) {
            // console.log('dapplist invalid_url', link, error);
        }
    })
    console.log('🟢 DefiPulse Whitelist',  defipulselistCount);

    let dappsResp: DappsResponse = await fetch('https://dap.ps/metadata/all').then(r=>r.json());
    let dappsCount = 0;
    let dappsList = Object.values(dappsResp)
    for (let i = 0; i < dappsList.length; i++) {
        try {
            const dapp = dappsList[i];
            let url = new URL(dapp.details.url).hostname;
            whitelist.add(url);
            hashTable.delete(url);
            dappsCount+=1
        } catch (error) {
            console.log(error);
            continue;
        }
    }
    console.log('🟢 Dap.ps Whitelist',  dappsCount);

    let walletconnectlist: Array<WalletconnectResponse> = await fetch('https://gist.githubusercontent.com/anudit/a88c5888dcfb7b9cbf14a57d8eca61ad/raw/c9e02047a31989715249c9251e828fbab15d8140/links.json').then(r=>r.json());
    let walletconnectlistCount = 0;
    walletconnectlist.forEach((dapp)=>{
        try {
            let url = new URL(dapp.homepage).hostname.replace('www.',"");
            whitelist.add(url);
            hashTable.delete(url);
            walletconnectlistCount+=1
        } catch (error) {
            // console.log('walletconnect invalid_url', link, error);
        }
    })
    console.log('🟢 Walletconnect Whitelist',  walletconnectlistCount);

}

async function compileBlacklist() {

    let prev = hashTable.stats()['numKeys'];

    console.log('Compiling Blacklist');
    let stats = []

    const logStat = (tag: blacklistIndices, len = 0): Dictionary<any> =>{
        let htlen = hashTable.stats()['numKeys'];
        let diff = htlen - prev;
        let ret = {'Name':numToBlacklist[tag].id, 'Length':len, 'Unique Added':`${diff.toLocaleString()} [+${(diff/len*100).toFixed(2)}%]`, 'Total':htlen}
        prev = htlen;
        return ret;
    }

    let blacklist1: Array<string> = await fetch('https://raw.githubusercontent.com/409H/EtherAddressLookup/master/blacklists/domains.json').then(r=>r.json());
    blacklist1.forEach((link: string) => {
        hashTable.set(link, 1);
    });
    stats.push(logStat(1, blacklist1.length));

    let blacklist2: {blacklist: Array<string>} = await fetch('https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/master/src/config.json').then(r=>r.json());
    blacklist2['blacklist'].forEach((link: string) => {
        hashTable.set(link, 2);
    });
    stats.push(logStat(2, blacklist2['blacklist'].length));

    let blacklist3: Array<{id:string}> = await fetch('https://raw.githubusercontent.com/MyEtherWallet/ethereum-lists/master/src/urls/urls-darklist.json').then(r=>r.json());
    blacklist3.forEach(e => {
        hashTable.set(e.id, 3);
    });
    stats.push(logStat(3, blacklist3.length));

    let blacklist4: Array<string> = await fetch('https://raw.githubusercontent.com/DAOBuidler/MetaShieldExtension/main/function/data/domain_blacklist.json').then(r=>r.json());
    blacklist4.forEach(e => {
        let link = e.replace("'", "").replace("http://", "").replace("https://", "");
        hashTable.set(link, 4);
    });
    stats.push(logStat(4, blacklist4.length));

    let blacklist5: {result: Array<string>} = await fetch('https://api.cryptoscamdb.org/v1/blacklist').then(r=>r.json());
    blacklist5['result'].forEach(e => {
        hashTable.set(e, 5);
    });
    stats.push(logStat(5, blacklist5['result'].length));

    let blacklist6  = await fetch('https://wallet-guard-server-prod.herokuapp.com/lists/all',{
        method: "GET",
        redirect: 'follow',
        headers:{
            'Origin': 'chrome-extension://pdgbckgdncnhihllonhnjbdoighgpimk'
        }
    })
    let b6r: { blocklist: Array<string>, whitelist: string } = JSON.parse(await blacklist6.text())
    b6r['blocklist'].forEach(e => {
        hashTable.set(e, 6);
    });
    let b6Whitelist: Array<{extensions: Array<string>, key: string}>  = JSON.parse(b6r['whitelist']);
    b6Whitelist.map((data)=>{
        return data['extensions'].map(e=>data['key']+e)
    }).flat().forEach(e => {
        whitelist.add(e);
        hashTable.delete(e);
    });
    stats.push(logStat(6, b6r['blocklist'].length));

    let blacklist7 = await fetch('https://gist.githubusercontent.com/anudit/643a5a5a7b105a563836578fa6dfdbd1/raw/964215961af0bdce8e64a112da52a022f4679cf7/Chainabuse-ScamDomains.json');
    let b7: Array<string> = await blacklist7.json();
    b7.forEach(e => {
        hashTable.set(e, 7);
    });
    stats.push(logStat(7, b7.length));

    let blacklist8 = await fetch('https://raw.githubusercontent.com/mitchellkrogza/Phishing.Database/master/phishing-domains-ACTIVE.txt');
    let b8: Array<string> = (await blacklist8.text()).split('\n');
    for (let i = 0; i < b8.length; i++) {
        try {
            hashTable.set(b8[i], 8);
        } catch (error) {
            continue;
        }
    }
    stats.push(logStat(8, b8.length));

    let blacklist9 = await fetch('https://phish.sinking.yachts/v2/all').then(r=>r.json());
    let b9: Array<string> = await blacklist9
    b9.forEach(e => {
        hashTable.set(e, 9);
    });
    stats.push(logStat(9, b9.length));

    let b10 = await fetch('https://raw.githubusercontent.com/stamparm/aux/master/maltrail-malware-domains.txt');
    let blacklist10 = (await b10.text()).split('\n');
    for (let i = 0; i < blacklist10.length; i++) {
        try {
            hashTable.set(blacklist10[i], 10);
        } catch (error) {
            continue;
        }
    }
    stats.push(logStat(10, blacklist10.length));

    let blacklist11: Array<string>  = await fetch('https://raw.githubusercontent.com/scamsniffer/scam-database/main/blacklist/domains.json').then(e=>e.json());
    blacklist11.forEach(e => {
        hashTable.set(e, 11);
    });
    stats.push(logStat(11, blacklist11.length));

    let blacklist12: Array<string>  = await fetch('https://raw.githubusercontent.com/phishfort/phishfort-lists/master/blacklists/domains.json').then(e=>e.json());
    blacklist12.forEach(e => {
        hashTable.set(e, 12);
    });
    stats.push(logStat(12, blacklist12.length));

    let blacklist13: {data: Array<{scams: Array<{url:string}>}>}  = await fetch('https://raw.githubusercontent.com/blueshell-io/scamdb/bec21924d47b3391196b7bb701316a75a3ac6009/website.json').then(e=>e.json());
    let res13 = blacklist13.data.map(e=>e.scams).flat().filter(e=>e!=null).map(d=>d.url).filter(e=>e!="");
    res13.forEach(e => {
        try {
            let link = new URL(e).hostname;
            hashTable.set(link, 13);
        } catch (error) {
        }
    });
    stats.push(logStat(13, res13.length));

    console.table(stats);
    await clearWhitelist();

}

async function rpcSet() {

    tokenList = await getTokenLists();

    let stats: Array<Dictionary<any>> = []

    const logStat = (net: supportedNetworkIds, len = 0): Dictionary<any> =>{
        let ret = {
            'Network': net,
            'RPC Set': len
        }
        return ret;
    }

    netIdToEnv.forEach((value, key) => {
        stats.push(logStat(key, getEnvJson(value).length));
    });

    console.table(stats);

}

server.listen({ port: parseInt(getEnv('PORT')) || 80, host: "0.0.0.0" }, (err, address)=>{
    rpcSet();
    compileBlacklist();

    setInterval(compileBlacklist, 60*60*1000);  // Update blacklist every hour.

    if (!err) console.log('🚀 Server is listening on', address);
    else throw err;
});
