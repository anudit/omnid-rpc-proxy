"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var import_fastify = __toESM(require("fastify"));
var import_helmet = __toESM(require("@fastify/helmet"));
var import_compress = __toESM(require("@fastify/compress"));
var import_cors = __toESM(require("@fastify/cors"));
var import_static = __toESM(require("@fastify/static"));
var import_path2 = __toESM(require("path"));
var import_cross_fetch3 = __toESM(require("cross-fetch"));
var import_tx = require("@ethereumjs/tx");
var import_sdk = require("@theconvospace/sdk");
var import_address2 = require("@ethersproject/address");

// src/utils.ts
require("dotenv").config({ path: ".env" });
var getEnv = /* @__PURE__ */ __name((envVar) => {
  const resp = process.env[envVar];
  if (resp === void 0)
    throw new Error(`'${envVar}' Environment Variable is Not Defined`);
  else
    return resp;
}, "getEnv");
var getEnvJson = /* @__PURE__ */ __name((envVar) => {
  return JSON.parse(getEnv(envVar));
}, "getEnvJson");
var debugLog = /* @__PURE__ */ __name((...args) => {
  if (getEnv("DEBUG") === "true")
    console.log(...args);
}, "debugLog");
var parseSerialFromAnswerData = /* @__PURE__ */ __name((data) => {
  let dataItems = data.split(" ");
  let timestamp = dataItems[2];
  if (timestamp.length === 10) {
    try {
      if (parseInt(timestamp.slice(0, 2)) <= 16) {
        return new Date(parseInt(timestamp + "000"));
      } else {
        return new Date(
          parseInt(timestamp.slice(0, 4)),
          parseInt(timestamp.slice(4, 6)),
          parseInt(timestamp.slice(6, 8)),
          0,
          0,
          0,
          0
        );
      }
    } catch (error) {
      return false;
    }
  } else {
    return false;
  }
}, "parseSerialFromAnswerData");

// src/lifejackets/slither.ts
var import_path = __toESM(require("path"));
var import_node_util2 = __toESM(require("util"));
var import_promises = require("fs/promises");
var import_fs = require("fs");
var import_address = require("@ethersproject/address");
var import_cross_fetch = __toESM(require("cross-fetch"));

// src/lifejackets/common.ts
var import_node_util = __toESM(require("util"));
var exec = import_node_util.default.promisify(require("child_process").exec);
function setSolidityVersion(version) {
  return __async(this, null, function* () {
    const { stderr } = yield exec(`solc-select use ${version}`);
    if (stderr === "")
      return true;
    else {
      console.error(stderr);
      return false;
    }
  });
}
__name(setSolidityVersion, "setSolidityVersion");
var networkIdToEtherscanEndpoint = /* @__PURE__ */ new Map([
  ["mainnet", `https://api.etherscan.io/api?apikey=${getEnv("ETHERSCAN_API_KEY")}`],
  ["polygon", `https://api.polygonscan.com/api?apikey=${getEnv("POLYGONSCAN_API_KEY")}`],
  ["polygon-testnet", `https://api-testnet.polygonscan.com/api?apikey=${getEnv("POLYGONSCAN_API_KEY")}`]
]);

// src/lifejackets/slither.ts
var exec2 = import_node_util2.default.promisify(require("child_process").exec);
function storeAndRun(networkId, address, sourceCode) {
  return __async(this, null, function* () {
    var _a;
    const contractsDir = import_path.default.join(__dirname, "../contracts");
    if (!(0, import_fs.existsSync)(contractsDir)) {
      (0, import_fs.mkdirSync)(contractsDir);
    }
    const fn = networkId + "-" + (0, import_address.getAddress)(address);
    yield (0, import_promises.writeFile)(import_path.default.join(contractsDir, fn + ".sol"), sourceCode);
    const command = `slither ${import_path.default.join(contractsDir, fn + ".sol")} --json ${import_path.default.join(contractsDir, fn + ".json")} --exclude-low --exclude-medium --exclude-informational --exclude-optimization --solc-disable-warnings`;
    try {
      const { stdout, stderr } = yield exec2(command);
    } catch (error) {
    }
    let rawResults = yield (0, import_promises.readFile)(import_path.default.join(contractsDir, fn + ".json"), { encoding: "utf8" });
    let results = JSON.parse(rawResults.toString());
    if (results.success === true && ((_a = results.results) == null ? void 0 : _a.detectors) != void 0 && results.results.detectors.length > 0) {
      console.log("storeAndRun/foundIssue");
      return { foundIssue: true, data: results.results.detectors };
    } else {
      console.log("storeAndRun/Nothing Found");
      return { foundIssue: false, data: [] };
    }
  });
}
__name(storeAndRun, "storeAndRun");
function testUsingSlither(network, address) {
  return __async(this, null, function* () {
    var _a;
    const fn = network + "-" + (0, import_address.getAddress)(address);
    const reportAdd = import_path.default.join(__dirname, "../contracts", fn + ".json");
    if ((0, import_fs.existsSync)(reportAdd)) {
      let rawResults = yield (0, import_promises.readFile)(reportAdd, { encoding: "utf8" });
      let results = JSON.parse(rawResults.toString());
      if (results.success === true && ((_a = results.results) == null ? void 0 : _a.detectors) != void 0 && results.results.detectors.length > 0) {
        return { cached: true, success: true, results: results.results.detectors, error: "" };
      } else {
        return { cached: true, success: true, results: [], error: "" };
      }
    } else {
      const req = yield (0, import_cross_fetch.default)(`${networkIdToEtherscanEndpoint.get(network)}&module=contract&action=getsourcecode&address=${address}`);
      if (req.ok === true) {
        const resp = yield req.json();
        if (resp.status == "1" && resp.result.length > 0) {
          if (resp.result[0].Proxy === "0") {
            const sourceCode = resp.result[0].SourceCode;
            const justVersion = resp.result[0].CompilerVersion.split("+")[0].slice(1);
            let setVersionResp = yield setSolidityVersion(justVersion);
            console.log("setVersionResp", justVersion, setVersionResp);
            if (setVersionResp === true) {
              let slitherResp = yield storeAndRun(network, address, sourceCode);
              if (slitherResp.foundIssue) {
                return { success: true, results: slitherResp.data, error: "" };
              } else {
                return { success: true, results: [], error: "" };
              }
            } else {
              console.log("Failed to set Solidity Version.");
              return { success: false, error: "Failed to set Solidity Version.", results: [] };
            }
          } else {
            return { success: false, error: "Proxy", results: [] };
          }
        } else {
          console.log("Source code not verified on EtherScan");
          return { success: false, error: "Source code not verified on EtherScan", results: [] };
        }
      } else {
        console.log("Error Fetching Source Code from EtherScan");
        return { success: false, error: "Error Fetching Source Code from EtherScan", results: [] };
      }
    }
  });
}
__name(testUsingSlither, "testUsingSlither");

// src/index.ts
var import_fastest_levenshtein = require("fastest-levenshtein");
var import_socks_proxy_agent = require("socks-proxy-agent");
var import_node_util3 = __toESM(require("util"));

// src/globals.ts
var numToBlacklist = {
  1: {
    id: "409H/EtherAddressLookup",
    name: "EtherAddressLookup",
    link: "https://github.com/409H/EtherAddressLookup"
  },
  2: {
    id: "MetaMask/eth-phishing-detect",
    name: "EthPhishingDetector",
    link: "https://github.com/MetaMask/eth-phishing-detect"
  },
  3: {
    id: "MyEtherWallet/ethereum-lists",
    name: "MyEtherWallet",
    link: "https://github.com/MyEtherWallet/ethereum-lists"
  },
  4: {
    id: "DAOBuidler/MetaShieldExtension",
    name: "MetaShield",
    link: "https://www.metashield.cc/indexen.html"
  },
  5: {
    id: "cryptoscamdb",
    name: "CryptoScamDB",
    link: "https://cryptoscamdb.org/"
  },
  6: {
    id: "walletguard",
    name: "Wallet Guard",
    link: "https://walletguard.app/"
  },
  7: {
    id: "anudit/chainabuse",
    name: "Chainabuse",
    link: "https://www.chainabuse.com/"
  },
  8: {
    id: "mitchellkrogza/Phishing.Database",
    name: "Phishing Domain Database",
    link: "https://github.com/mitchellkrogza/Phishing.Database"
  },
  9: {
    id: "phish.sinking.yachts",
    name: "SinkingYachts",
    link: "https://phish.sinking.yachts/"
  },
  10: {
    id: "stamparm/aux",
    name: "stamparm/aux",
    link: "https://github.com/stamparm/aux"
  },
  11: {
    id: "scamsniffer/scam-database",
    name: "ScamSniffer",
    link: "https://scamsniffer.io/"
  },
  12: {
    id: "phishfort/phishfort-lists",
    name: "PhishFort",
    link: "https://www.phishfort.com/"
  },
  13: {
    id: "blueshell-io/scamdb",
    name: "BlueShell",
    link: "https://blueshell.io/"
  }
};

// src/tokenlists.ts
var import_cross_fetch2 = __toESM(require("cross-fetch"));
function getTokenLists() {
  return __async(this, null, function* () {
    console.log("Compiling tokenlists");
    let tokenLists = {
      "1": "https://account.metafi.codefi.network/networks/1/tokens",
      "10": "https://account.metafi.codefi.network/networks/10/tokens",
      "137": "https://account.metafi.codefi.network/networks/137/tokens",
      "51": "https://account.metafi.codefi.network/networks/56/tokens",
      "43114": "https://account.metafi.codefi.network/networks/43114/tokens",
      "42161": "https://account.metafi.codefi.network/networks/42161/tokens",
      "250": "https://account.metafi.codefi.network/networks/250/tokens"
    };
    let promiseArray = Object.keys(tokenLists).map((netId) => {
      return (0, import_cross_fetch2.default)(tokenLists[netId]).then((r) => r.json());
    });
    let result = yield Promise.allSettled(promiseArray);
    let res = [];
    for (let index = 0; index < result.length; index++) {
      const data = result[index];
      if (data.status == "fulfilled") {
        res = res.concat(data.value);
      }
    }
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
    });
    let metamaskData = yield (0, import_cross_fetch2.default)("https://raw.githubusercontent.com/MetaMask/contract-metadata/master/contract-map.json").then((e) => {
      return e.json();
    });
    for (const [key, val] of Object.entries(metamaskData)) {
      res.push({
        "name": val.name,
        "symbol": val.symbol,
        "decimals": val.decimals,
        "address": key,
        "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/" + val.logo,
        "sources": ["https://github.com/MetaMask/contract-metadata"],
        "chainId": 1
      });
    }
    console.log("\u{1FA99} ", res.length, "Tokens");
    return res;
  });
}
__name(getTokenLists, "getTokenLists");
var tokenlists_default = getTokenLists;

// src/ratelimit.ts
var import_ratelimit = require("@upstash/ratelimit");
var import_redis = require("@upstash/redis");
var ratelimit = new import_ratelimit.Ratelimit({
  redis: new import_redis.Redis({
    url: getEnv("RATELIMIT_UPSTASH_REDIS_REST_URL"),
    token: getEnv("RATELIMIT_UPSTASH_REDIS_REST_TOKEN")
  }),
  limiter: import_ratelimit.Ratelimit.slidingWindow(100, "10 s"),
  timeout: 1e3,
  analytics: true
});
var ratelimit_default = ratelimit;

// src/index.ts
"strict";
var server = (0, import_fastify.default)({ logger: false });
var toBuffer = require("ethereumjs-util").toBuffer;
var checkForPhishing = require("eth-phishing-detect");
var exec3 = import_node_util3.default.promisify(require("child_process").exec);
server.register(import_helmet.default, { global: true });
server.register(import_compress.default, { global: true });
server.register(import_cors.default, { origin: "*" });
server.register(import_static.default, {
  root: import_path2.default.join(__dirname, "../public")
});
var MegaHash = require("megahash");
var hashTable = new MegaHash();
var whitelist = /* @__PURE__ */ new Set();
var SIMULATE_URL = `https://api.tenderly.co/api/v1/account/${getEnv("TENDERLY_USER")}/project/${getEnv("TENDERLY_PROJECT")}/simulate`;
var proxyUrl = "socks5://0.0.0.0:9150";
var tokenList = [];
var RATELIMIT_ENABLED = getEnv("RATELIMIT_ENABLED") === "true";
var convo = new import_sdk.Convo(getEnv("CONVO_API_KEY"));
var computeConfig = {
  alchemyApiKey: getEnv("ALCHEMY_API_KEY"),
  CNVSEC_ID: getEnv("CNVSEC_ID"),
  etherscanApiKey: getEnv("ETHERSCAN_API_KEY"),
  polygonscanApiKey: getEnv("POLYGONSCAN_API_KEY"),
  optimismscanApiKey: getEnv("OPTIMISMSCAN_API_KEY"),
  polygonMainnetRpc: "",
  etherumMainnetRpc: "",
  avalancheMainnetRpc: "",
  maticPriceInUsd: 0,
  etherumPriceInUsd: 0,
  deepdaoApiKey: "",
  zapperApiKey: "",
  DEBUG: false
};
var netIdToEnv = /* @__PURE__ */ new Map([
  ["mainnet", "MAINNET_RPC_URL"],
  ["mainnet-flashbots", "MAINNET_FLASHBOTS_RPC_URL"],
  ["mainnet-flashbots-fast", "MAINNET_FLASHBOTS_FAST_RPC_URL"],
  ["goerli", "GOERLI_RPC_URL"],
  ["sepolia", "SEPOLIA_RPC_URL"],
  ["goerli-flashbots", "GOERLI_FLASHBOTS_RPC_URL"],
  ["polygon", "POLYGON_RPC_URL"],
  ["polygon-testnet", "POLYGON_TESTNET_RPC_URL"],
  ["polygon-zkevm", "POLYGON_ZKEVM_RPC_URL"],
  ["optimism", "OPTIMISM_RPC_URL"],
  ["optimism-testnet", "OPTIMISM_TESTNET_RPC_URL"],
  ["arbitrum", "ARBITRUM_RPC_URL"],
  ["arbitrum-nova", "ARBITRUM_NOVA_RPC_URL"],
  ["arbitrum-testnet", "ARBITRUM_TESTNET_RPC_URL"],
  ["bsc", "BSC_RPC_URL"],
  ["bsc-testnet", "BSC_TESTNET_RPC_URL"],
  ["fantom", "FANTOM_RPC_URL"],
  ["fantom-testnet", "FANTOM_TESTNET_RPC_URL"],
  ["base-testnet", "BASE_TESTNET_RPC_URL"]
]);
var networkToRpc = /* @__PURE__ */ __name((netId) => {
  let envName = netIdToEnv.get(netId);
  if (envName) {
    let urls = getEnvJson(envName);
    return urls[Math.floor(Math.random() * urls.length)];
  } else {
    return "";
  }
}, "networkToRpc");
function getMalRpcError(message, details = void 0) {
  return {
    isMalicious: true,
    rpcResp: {
      "id": 420,
      "jsonrpc": "2.0",
      "error": {
        "code": -32003,
        // https://eips.ethereum.org/EIPS/eip-1474#error-codes
        "message": message
      }
    },
    details
  };
}
__name(getMalRpcError, "getMalRpcError");
function checkAddress(address) {
  return __async(this, null, function* () {
    try {
      if ((0, import_address2.isAddress)(address)) {
        let result = yield convo.omnid.kits.isMalicious((0, import_address2.getAddress)(address), computeConfig);
        console.log("omnid.kits.isMalicious", (0, import_address2.getAddress)(address), result);
        if ((result == null ? void 0 : result.alchemy) && result.alchemy === true)
          return getMalRpcError(`Spam Contract Flagged by Alchemy`, result);
        else if ((result == null ? void 0 : result.chainabuse) && Boolean(result.chainabuse) === true)
          return getMalRpcError(`Contract Flagged by Chainabuse`, result);
        else if ((result == null ? void 0 : result.scanblocks) && result.scanblocks === true)
          return getMalRpcError(`Address Flagged by Scanblocks`, result);
        else if ((result == null ? void 0 : result.cryptoscamdb) && result.cryptoscamdb === true)
          return getMalRpcError(`Contract Flagged by CryptoscamDB`, result);
        else if ((result == null ? void 0 : result.etherscan) && "label" in result.etherscan)
          return getMalRpcError(`Address Flagged as ${result.etherscan.label} by Etherscan`, result);
        else if ((result == null ? void 0 : result.mew) && "comment" in result.mew)
          return getMalRpcError(`Address Flagged by MyEtherWallet`, result);
        else if (result == null ? void 0 : result.sdn)
          return getMalRpcError(`Address Flagged by OFAC`, result);
        else if (result == null ? void 0 : result.tokenblacklist)
          return getMalRpcError(`Address Blacklisted by Stablecoin`, result);
        else if (result == null ? void 0 : result.txn)
          return getMalRpcError(`Address/Contract Funded by Tornado Cash.`, result);
        else
          return { isMalicious: false };
      } else
        return { isMalicious: false };
    } catch (error) {
      return { isMalicious: false };
    }
  });
}
__name(checkAddress, "checkAddress");
function alchemySimulate(simData) {
  return __async(this, null, function* () {
    try {
      let resp = yield (0, import_cross_fetch3.default)(SIMULATE_URL, {
        method: "POST",
        body: JSON.stringify(simData),
        headers: {
          "X-Access-Key": getEnv("TENDERLY_ACCESS_KEY")
        }
      }).then((r) => r.json());
      return resp;
    } catch (error) {
      console.log("alchemySimulate", error);
      return false;
    }
  });
}
__name(alchemySimulate, "alchemySimulate");
function sendToRpc(network, req, overrideRpcUrl = "") {
  return __async(this, null, function* () {
    let query = req.query;
    try {
      let rpcUrl = network === "manual" ? overrideRpcUrl === "" ? query.rpcUrl : overrideRpcUrl : networkToRpc(network);
      if (rpcUrl !== void 0) {
        let reqOptions = {
          method: "POST",
          body: JSON.stringify(req.body),
          agent: (query == null ? void 0 : query.useTor) === "true" ? new import_socks_proxy_agent.SocksProxyAgent(proxyUrl) : null,
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "infura-source": "metamask/internal",
            // for infura based rpc urls, look like metamask xD.
            "origin": "chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn"
            // for infura based rpc urls, look like metamask xD.
          }
        };
        let data = yield (0, import_cross_fetch3.default)(rpcUrl, reqOptions).then((e) => e.json());
        return data;
      } else {
        let { rpcResp } = getMalRpcError("Invalid RPC Url");
        return rpcResp;
      }
    } catch (error) {
      let { rpcResp } = getMalRpcError(error);
      return rpcResp;
    }
  });
}
__name(sendToRpc, "sendToRpc");
function processTxs(network, req) {
  return __async(this, null, function* () {
    const body = req.body;
    const query = req.query;
    var txData = toBuffer(body["params"][0]);
    var deserializedTx = import_tx.FeeMarketEIP1559Transaction.fromSerializedTx(txData);
    var deserializedTxParsed = deserializedTx.toJSON();
    console.log("deserializedTx", deserializedTxParsed);
    if (Object.keys(deserializedTxParsed).includes("to") === true) {
      let { isMalicious, rpcResp } = yield checkAddress(deserializedTxParsed.to);
      if (isMalicious == true && rpcResp) {
        rpcResp.id = body.id;
        return rpcResp;
      }
    }
    let gas_price = parseInt(deserializedTxParsed.maxFeePerGas || "0") + parseInt(deserializedTx.maxPriorityFeePerGas.toString(10) || "0");
    let simData = {
      "network_id": parseInt(deserializedTx.chainId.toString(10)),
      "from": deserializedTx.getSenderAddress().toString(),
      "to": deserializedTx.to ? deserializedTx.to.toString() : "",
      "input": deserializedTx.data.toString("hex"),
      "gas": parseInt(deserializedTx.gasLimit.toString(10)),
      "gas_price": gas_price.toString(10),
      "value": parseInt(deserializedTx.value.toString(10)),
      "save_if_fails": true,
      "save": false,
      "simulation_type": "full"
    };
    let alResp = yield alchemySimulate(simData);
    if (alResp != void 0 && alResp != false && "transaction_info" in alResp && alResp.transaction_info != void 0) {
      console.log("Sim Successful");
      for (let index = 0; index < alResp.transaction_info.logs.length; index++) {
        const logData = alResp.transaction_info.logs[index];
        if (logData.name === "Approval" || logData.name === "Transfer") {
          let { isMalicious, rpcResp } = yield checkAddress(logData.inputs[1].value);
          if (isMalicious === true)
            return rpcResp;
        }
      }
    }
    if (network != "manual" && "blockUnverifiedContracts" in query && query.blockUnverifiedContracts === "true") {
      let verificationReq = yield (0, import_cross_fetch3.default)(`https://sourcify.dev/server/check-all-by-addresses?addresses=${deserializedTxParsed == null ? void 0 : deserializedTxParsed.to}&chainIds=1,4,11155111,137,80001,10,42161,421611`);
      let verificationResp;
      if (verificationReq.ok === true) {
        verificationResp = yield verificationReq.json();
        if (Object.keys(verificationResp).includes("status")) {
          let { rpcResp } = getMalRpcError("The contract is unverified");
          return rpcResp;
        }
        ;
      } else {
        let { rpcResp } = getMalRpcError("Sourcify Request Failed");
        return rpcResp;
      }
    }
    if (network in ["mainnet", "polygon", "polygon-testnet"] && (query == null ? void 0 : query.enableScanners) !== void 0 && deserializedTxParsed.to !== void 0) {
      let networkId = network;
      let scanners = query.enableScanners.split(",");
      for (let index = 0; index < scanners.length; index++) {
        const scanner = scanners[index];
        if (scanner === "slither") {
          let slTest = yield testUsingSlither(networkId, deserializedTxParsed.to);
          if (slTest.results.length > 0) {
            return getMalRpcError("Slither detected possible attack vectors");
          }
        }
      }
    }
    if ((query == null ? void 0 : query.blockRecentDnsUpdates) != void 0 && Boolean(parseInt(query.blockRecentDnsUpdates)) === true) {
      let days = parseInt(query.blockRecentDnsUpdates);
      let dnsQuery = yield (0, import_cross_fetch3.default)(`https://dns.google/resolve?name=${req.hostname}&type=SOA`);
      if (dnsQuery.ok === true) {
        const dnsQueryResp = yield dnsQuery.json();
        if (dnsQueryResp.Answer.length > 0 && parseSerialFromAnswerData(dnsQueryResp.Answer[0].data) != false) {
          let dtUpdated = parseSerialFromAnswerData(dnsQueryResp.Answer[0].data);
          if (dtUpdated !== false) {
            let diffDays = (Date.now() - dtUpdated.valueOf()) / (60 * 60 * 24 * 1e3);
            if (diffDays <= days) {
              let { rpcResp } = getMalRpcError("The domain's DNS has been changed recently.");
              return rpcResp;
            }
          }
        }
        ;
      }
    }
    if (network === "mainnet" && (query == null ? void 0 : query.useGasHawk) != void 0 && query.useGasHawk === "true") {
      return yield sendToRpc("manual", req, "https://beta-be.gashawk.io:3001/proxy/rpc");
    }
    return yield sendToRpc(network, req);
  });
}
__name(processTxs, "processTxs");
server.get("/", function(req, reply) {
  reply.header("Content-Security-Policy", "default-src *; style-src 'self' 'unsafe-inline' cdnjs.cloudflare.com fonts.googleapis.com; script-src 'self' 'unsafe-inline'; img-src data: mintlify.s3-us-west-1.amazonaws.com ;");
  return reply.sendFile("index.html");
});
server.get("/ping", (req, reply) => __async(exports, null, function* () {
  return reply.send({ "hello": "world" });
}));
server.get("/blacklist", (req, reply) => __async(exports, null, function* () {
  reply.headers({ "Cache-Control": `max-age=${24 * 60 * 60}` });
  return reply.send(hashTable.stats());
}));
server.get("/whitelist", (req, reply) => __async(exports, null, function* () {
  reply.headers({ "Cache-Control": `max-age=${24 * 60 * 60}` });
  return reply.send(Array.from(whitelist.values()));
}));
server.get("/tokenlist", (req, reply) => __async(exports, null, function* () {
  reply.headers({ "Cache-Control": `max-age=${24 * 60 * 60}` });
  return reply.send({ tokens: tokenList == null ? void 0 : tokenList.length });
}));
server.get("/tor", (req, reply) => __async(exports, null, function* () {
  try {
    const { stdout, stderr } = yield exec3("cat /var/lib/tor/hidden_service/hostname");
    if (stderr == "") {
      return reply.send({ "domain": stdout.replace("\n", "") });
    } else {
      return reply.send({ "domain": false, "error": stderr });
    }
  } catch (error) {
    return reply.send({ "domain": false, "error": error });
  }
}));
server.get("/blacklist/*", (req, reply) => __async(exports, null, function* () {
  reply.headers({ "Cache-Control": `max-age=${24 * 60 * 60}` });
  const params = req.params;
  const res = hashTable.get(params["*"]);
  if (res === void 0)
    return reply.send({ "blacklisted": false });
  else {
    let closestValid = (0, import_fastest_levenshtein.closest)(params["*"], Array.from(whitelist));
    let closestScore = (0, import_fastest_levenshtein.distance)(params["*"], closestValid);
    return reply.send({ "blacklisted": true, "list": numToBlacklist[res], "closestWhitelisted": { url: closestValid, distance: closestScore } });
  }
}));
server.get("/malicious/:ethAddress", (req, reply) => __async(exports, null, function* () {
  reply.headers({ "Cache-Control": `max-age=${24 * 60 * 60}` });
  const params = req.params;
  const res = yield checkAddress(params["ethAddress"]);
  return reply.send(res);
}));
server.get("/tokendeets/:ethAddress", (req, reply) => __async(exports, null, function* () {
  var _a, _b;
  reply.headers({ "Cache-Control": `max-age=${24 * 60 * 60}` });
  const params = req.params;
  if (Boolean(params == null ? void 0 : params.ethAddress) === false)
    reply.send([]);
  let resTokens = [];
  for (let i = 0; i < tokenList.length; i++) {
    if (Boolean((_a = tokenList[i]) == null ? void 0 : _a.address) && ((_b = tokenList[i]) == null ? void 0 : _b.address.toLowerCase()) === (params == null ? void 0 : params.ethAddress.toLowerCase())) {
      resTokens.push(tokenList[i]);
    }
    ;
  }
  return reply.send(resTokens);
}));
server.post("/lifejacket/:jacket", (req, reply) => __async(exports, null, function* () {
  const supportedJackets = ["slither", "mythril"];
  const { jacket } = req.params;
  if (supportedJackets.includes(jacket)) {
    const { network, address } = req.body;
    if (network != void 0 && address != void 0 && (0, import_address2.isAddress)(address)) {
      if (jacket === "slither") {
        let sr = yield testUsingSlither(network, address);
        return reply.send(sr);
      }
    } else
      return reply.send({ success: false, error: "Invalid body params, network or address" });
  } else
    return reply.send({ success: false, error: `Invalid LifeJacket, supported ${supportedJackets.toString()}` });
}));
server.post("/:network", (req, reply) => __async(exports, null, function* () {
  let { hostname, ip } = req;
  const body = req.body;
  let isPhishing = checkForPhishing(hostname);
  if (!isPhishing && Boolean(hashTable.get(hostname)) === false) {
    const { network } = req.params;
    debugLog("req", network, body, req.query);
    if (network && netIdToEnv.get(network)) {
      if (RATELIMIT_ENABLED) {
        const { success: underRatelimit } = yield ratelimit_default.limit(ip);
        if (underRatelimit === false) {
          return reply.send({ error: "Ratelimit Exceeded" });
        }
      }
      if (body["method"] == "eth_sendRawTransaction") {
        let resp = yield processTxs(network, req);
        return reply.send(resp);
      } else if (body["method"] == "web3_clientVersion") {
        return reply.send({
          "jsonrpc": "2.0",
          "id": 42,
          "result": "Omnid/Proxy/1.0.0"
        });
      } else {
        let resp = yield sendToRpc(network, req);
        return reply.send(resp);
      }
    } else {
      return reply.send({ error: `Invalid network '${network}', available networks are ${Array.from(netIdToEnv.keys()).join(", ")}` });
    }
  } else {
    let { rpcResp } = getMalRpcError(`\u{1F6A8} Phishing detector for the site ${hostname} has been triggered.`);
    return reply.send(rpcResp);
  }
}));
server.addHook("preHandler", (req, reply, done) => {
  reply.header("onion-location", `http://omnid2kq4qppsp2a5hgeqok6ahkfo23tdtoe7km4uier4o43taxct5ad.onion${req.url}`);
  done();
});
function clearWhitelist() {
  return __async(this, null, function* () {
    hashTable.delete("instagram.com");
    let defillamaList = yield (0, import_cross_fetch3.default)("https://api.llama.fi/lite/protocols2").then((r) => r.json());
    defillamaList["protocols"].forEach((link) => {
      try {
        let url = new URL(link.url.replace("\n", "").replace("\r", "")).hostname.replace("www.", "");
        whitelist.add(url);
        hashTable.delete(url);
      } catch (error) {
      }
    });
    console.log("\u{1F7E2} DefiLlama Whitelist", defillamaList["protocols"].length);
    let defipulselist = yield (0, import_cross_fetch3.default)("https://gist.githubusercontent.com/anudit/8df081a368397dea5ff4ce8bdfac6256/raw/9d36d984fe3ed78bd1f993c4cca22ec4093d9253/index.json").then((r) => r.json());
    let defipulselistCount = 0;
    Object.values(defipulselist.pageProps.defiList).forEach((dapp) => {
      try {
        let url = new URL(dapp.url).hostname.replace("www.", "");
        whitelist.add(url);
        hashTable.delete(url);
        defipulselistCount += 1;
      } catch (error) {
      }
    });
    console.log("\u{1F7E2} DefiPulse Whitelist", defipulselistCount);
    let dappsResp = yield (0, import_cross_fetch3.default)("https://dap.ps/metadata/all").then((r) => r.json());
    let dappsCount = 0;
    let dappsList = Object.values(dappsResp);
    for (let i = 0; i < dappsList.length; i++) {
      try {
        const dapp = dappsList[i];
        let url = new URL(dapp.details.url).hostname;
        whitelist.add(url);
        hashTable.delete(url);
        dappsCount += 1;
      } catch (error) {
        console.log(error);
        continue;
      }
    }
    console.log("\u{1F7E2} Dap.ps Whitelist", dappsCount);
    let walletconnectlist = yield (0, import_cross_fetch3.default)("https://gist.githubusercontent.com/anudit/a88c5888dcfb7b9cbf14a57d8eca61ad/raw/c9e02047a31989715249c9251e828fbab15d8140/links.json").then((r) => r.json());
    let walletconnectlistCount = 0;
    walletconnectlist.forEach((dapp) => {
      try {
        let url = new URL(dapp.homepage).hostname.replace("www.", "");
        whitelist.add(url);
        hashTable.delete(url);
        walletconnectlistCount += 1;
      } catch (error) {
      }
    });
    console.log("\u{1F7E2} Walletconnect Whitelist", walletconnectlistCount);
  });
}
__name(clearWhitelist, "clearWhitelist");
function compileBlacklist() {
  return __async(this, null, function* () {
    let prev = hashTable.stats()["numKeys"];
    console.log("Compiling Blacklist");
    let stats = [];
    const logStat = /* @__PURE__ */ __name((tag, len = 0) => {
      let htlen = hashTable.stats()["numKeys"];
      let diff = htlen - prev;
      let ret = { "Name": numToBlacklist[tag].id, "Length": len, "Unique Added": `${diff.toLocaleString()} [+${(diff / len * 100).toFixed(2)}%]`, "Total": htlen };
      prev = htlen;
      return ret;
    }, "logStat");
    let blacklist1 = yield (0, import_cross_fetch3.default)("https://raw.githubusercontent.com/409H/EtherAddressLookup/master/blacklists/domains.json").then((r) => r.json());
    blacklist1.forEach((link) => {
      hashTable.set(link, 1);
    });
    stats.push(logStat(1, blacklist1.length));
    let blacklist2 = yield (0, import_cross_fetch3.default)("https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/master/src/config.json").then((r) => r.json());
    blacklist2["blacklist"].forEach((link) => {
      hashTable.set(link, 2);
    });
    stats.push(logStat(2, blacklist2["blacklist"].length));
    let blacklist3 = yield (0, import_cross_fetch3.default)("https://raw.githubusercontent.com/MyEtherWallet/ethereum-lists/master/src/urls/urls-darklist.json").then((r) => r.json());
    blacklist3.forEach((e) => {
      hashTable.set(e.id, 3);
    });
    stats.push(logStat(3, blacklist3.length));
    let blacklist4 = yield (0, import_cross_fetch3.default)("https://raw.githubusercontent.com/DAOBuidler/MetaShieldExtension/main/function/data/domain_blacklist.json").then((r) => r.json());
    blacklist4.forEach((e) => {
      let link = e.replace("'", "").replace("http://", "").replace("https://", "");
      hashTable.set(link, 4);
    });
    stats.push(logStat(4, blacklist4.length));
    try {
      let blacklist5 = yield (0, import_cross_fetch3.default)("https://api.cryptoscamdb.org/v1/blacklist").then((r) => r.json());
      blacklist5["result"].forEach((e) => {
        hashTable.set(e, 5);
      });
      stats.push(logStat(5, blacklist5["result"].length));
    } catch (error) {
    }
    let blacklist7 = yield (0, import_cross_fetch3.default)("https://gist.githubusercontent.com/anudit/643a5a5a7b105a563836578fa6dfdbd1/raw/964215961af0bdce8e64a112da52a022f4679cf7/Chainabuse-ScamDomains.json");
    let b7 = yield blacklist7.json();
    b7.forEach((e) => {
      hashTable.set(e, 7);
    });
    stats.push(logStat(7, b7.length));
    let blacklist8 = yield (0, import_cross_fetch3.default)("https://raw.githubusercontent.com/mitchellkrogza/Phishing.Database/master/phishing-domains-ACTIVE.txt");
    let b8 = (yield blacklist8.text()).split("\n");
    for (let i = 0; i < b8.length; i++) {
      try {
        hashTable.set(b8[i], 8);
      } catch (error) {
        continue;
      }
    }
    stats.push(logStat(8, b8.length));
    let blacklist9 = yield (0, import_cross_fetch3.default)("https://phish.sinking.yachts/v2/all").then((r) => r.json());
    let b9 = yield blacklist9;
    b9.forEach((e) => {
      hashTable.set(e, 9);
    });
    stats.push(logStat(9, b9.length));
    let b10 = yield (0, import_cross_fetch3.default)("https://raw.githubusercontent.com/stamparm/aux/master/maltrail-malware-domains.txt");
    let blacklist10 = (yield b10.text()).split("\n");
    for (let i = 0; i < blacklist10.length; i++) {
      try {
        hashTable.set(blacklist10[i], 10);
      } catch (error) {
        continue;
      }
    }
    stats.push(logStat(10, blacklist10.length));
    let blacklist11 = yield (0, import_cross_fetch3.default)("https://raw.githubusercontent.com/scamsniffer/scam-database/main/blacklist/domains.json").then((e) => e.json());
    blacklist11.forEach((e) => {
      hashTable.set(e, 11);
    });
    stats.push(logStat(11, blacklist11.length));
    let blacklist12 = yield (0, import_cross_fetch3.default)("https://raw.githubusercontent.com/phishfort/phishfort-lists/master/blacklists/domains.json").then((e) => e.json());
    blacklist12.forEach((e) => {
      hashTable.set(e, 12);
    });
    stats.push(logStat(12, blacklist12.length));
    let blacklist13 = yield (0, import_cross_fetch3.default)("https://raw.githubusercontent.com/blueshell-io/scamdb/bec21924d47b3391196b7bb701316a75a3ac6009/website.json").then((e) => e.json());
    let res13 = blacklist13.data.map((e) => e.scams).flat().filter((e) => e != null).map((d) => d.url).filter((e) => e != "");
    res13.forEach((e) => {
      try {
        let link = new URL(e).hostname;
        hashTable.set(link, 13);
      } catch (error) {
      }
    });
    stats.push(logStat(13, res13.length));
    console.table(stats);
    yield clearWhitelist();
  });
}
__name(compileBlacklist, "compileBlacklist");
function rpcSet() {
  return __async(this, null, function* () {
    tokenList = yield tokenlists_default();
    let stats = [];
    const logStat = /* @__PURE__ */ __name((net, len = 0) => {
      let ret = {
        "Network": net,
        "RPC Set": len
      };
      return ret;
    }, "logStat");
    netIdToEnv.forEach((value, key) => {
      stats.push(logStat(key, getEnvJson(value).length));
    });
    console.table(stats);
  });
}
__name(rpcSet, "rpcSet");
server.listen({ port: parseInt(getEnv("PORT")) || 80, host: "0.0.0.0" }, (err, address) => {
  rpcSet();
  compileBlacklist();
  setInterval(compileBlacklist, 60 * 60 * 1e3);
  if (!err)
    console.log("\u{1F680} Server is listening on", address);
  else
    throw err;
});
