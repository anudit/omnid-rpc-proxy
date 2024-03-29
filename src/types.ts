export interface RpcResp {
    isMalicious: boolean,
    rpcResp?: {
        "id": number,
        "jsonrpc": string,
        "error": {
            "code": number,
            "message": string
        }
    }
    details?: any
}

export type supportedNetworkIds = "mainnet"
    | "mainnet-flashbots"
    | "mainnet-flashbots-fast"
    | "sepolia"
    | "goerli-flashbots"
    | "polygon"
    | "polygon-testnet"
    | "polygon-zkevm"
    | "optimism"
    | "optimism-testnet"
    | "arbitrum"
    | "arbitrum-nova"
    | "arbitrum-testnet"
    | "bsc"
    | "bsc-testnet"
    | "fantom"
    | "fantom-testnet"
    | "base"
    | "base-testnet"
    | "manual";

export interface Dictionary<T> {
    [Key: string]: T;
}

export interface MetaData {
    "name": string,
    "symbol": string,
    "decimals": number,
    "address": string,
    "sources": Array<string>,
    "chainId": number,
    "iconUrl": string,
    coingeckoId?: string,
}

export interface MetaMaskTokenMetaData {
    "name": string,
    "logo": string,
    "erc20": boolean,
    "symbol": string,
    "decimals": number
}

export interface IQuerystring {
    rpcUrl?: string;
    blockUnverifiedContracts?: string;
    enableScanners?: string;
    blockRecentDnsUpdates?: string;
    useTor?: string;
    useGasHawk?: string;
}

export interface IRouteParams {
    network: supportedNetworkIds;
}

export type SourifyResp = Array<{
    address: string;
    status: 'perfect' | 'partial' | 'false';
    chainIds: Array<string>;
}>;

export type DoHResp = {
    Answer: Array<{
        data: string;
    }>
};

export interface AlchemySimulationReq {
    "network_id": number,
    "from": string,
    "to": string,
    "input": string,
    "gas": number,
    "gas_price": string,
    "value": number,
    "save_if_fails": boolean,
    "save": boolean,
    "simulation_type": "full"
}

export interface AlchemySimulationResp {
    transaction_info?: {
        logs: Array<{
            name: string;
            inputs: Array<{ value: string }>
        }>
    }
}

export interface JsonRpcReq {
    id: number;
    jsonrpc: string;
    method: string;
    params: Array<any>
}

export interface EtherscanVerificationResp {
    status: string;
    message: string;
    result: Array<{
        SourceCode: string;
        ABI: string;
        ContractName: string;
        CompilerVersion: string;
        Implementation: string;
        Proxy: "0" | "1";
    }>
}

export type SlitherDetectors = Array<{
    impact: string;
    confidence: string;
    check: string;
}>

export interface SlitherOutput {
    success: boolean,
    error: string,
    results: {
        detectors?: SlitherDetectors
    }
}
export type lifejacketSupportedNetwork = 'mainnet' | 'polygon' | 'polygon-testnet';

export type MythrilIssues = Array<{
    severity: "Low" | "Medium" | "High",
    title: string;
    description: string;
}>

export interface MythrilOutput {
    error: null | string,
    issues: MythrilIssues
}

export interface TestResult<T> {
    success: boolean,
    error: string,
    cached?: boolean,
    results: T
}

export type supportedEnvVars = "MAINNET_RPC_URL"
    | "SEPOLIA_RPC_URL"
    | "MAINNET_FLASHBOTS_RPC_URL"
    | "MAINNET_FLASHBOTS_FAST_RPC_URL"
    | "GOERLI_FLASHBOTS_RPC_URL"
    | "POLYGON_RPC_URL"
    | "POLYGON_TESTNET_RPC_URL"
    | "POLYGON_ZKEVM_RPC_URL"
    | "OPTIMISM_RPC_URL"
    | "OPTIMISM_TESTNET_RPC_URL"
    | "ARBITRUM_RPC_URL"
    | "ARBITRUM_NOVA_RPC_URL"
    | "ARBITRUM_TESTNET_RPC_URL"
    | "BSC_RPC_URL"
    | "BSC_TESTNET_RPC_URL"
    | "FANTOM_RPC_URL"
    | "FANTOM_TESTNET_RPC_URL"
    | "BASE_RPC_URL"
    | "BASE_TESTNET_RPC_URL"
    | "TENDERLY_USER"
    | "TENDERLY_PROJECT"
    | "TENDERLY_ACCESS_KEY"
    | "CONVO_API_KEY"
    | "ALCHEMY_API_KEY"
    | "CNVSEC_ID"
    | "ETHERSCAN_API_KEY"
    | "POLYGONSCAN_API_KEY"
    | "OPTIMISMSCAN_API_KEY"
    | "BSCSCAN_API_KEY"
    | "FTMSCAN_API_KEY"
    | "BASE_API_KEY"
    | "PORT"
    | "DEBUG"
    | "RATELIMIT_ENABLED"
    | "RATELIMIT_UPSTASH_REDIS_REST_URL"
    | "RATELIMIT_UPSTASH_REDIS_REST_TOKEN"

export type SupportedJackets = "mythril" | "slither";

export type blacklistIndices = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface MegaHashType extends Map<string, blacklistIndices> {
    stats: () => { numKeys: number }
}

export interface DapplistResponse {
    total: number;
    data: {
        list: Array<{
            url: string;
            numberOfVotes: number;
        }>
    }
}

export interface DefipulseResponse {
    pageProps: {
        defiList: Array<{
            url: string
        }>
    }
}

export interface DappsResponse {
    [Key: string]: {
        details: {
            url: string
        }
        status: string
    }
}

export interface WalletconnectResponse {
    homepage: string
}


export interface ListDeets {
    id: string,
    name: string,
    link: string,
}

