"use strict";var he=Object.create;var L=Object.defineProperty;var fe=Object.getOwnPropertyDescriptor;var me=Object.getOwnPropertyNames;var ge=Object.getPrototypeOf,ye=Object.prototype.hasOwnProperty;var d=(t,e)=>L(t,"name",{value:e,configurable:!0});var ke=(t,e,s,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of me(e))!ye.call(t,o)&&o!==s&&L(t,o,{get:()=>e[o],enumerable:!(a=fe(e,o))||a.enumerable});return t};var b=(t,e,s)=>(s=t!=null?he(ge(t)):{},ke(e||!t||!t.__esModule?L(s,"default",{value:t,enumerable:!0}):s,t));var te=b(require("fastify")),se=b(require("@fastify/helmet")),re=b(require("@fastify/compress")),ae=b(require("@fastify/cors")),ne=require("fs"),oe=b(require("path")),u=b(require("cross-fetch")),ie=require("@ethereumjs/tx"),le=require("@theconvospace/sdk"),_=require("@ethersproject/address");require("dotenv").config({path:".env"});var m=d(t=>{let e=process.env[t];if(e===void 0)throw new Error(`'${t}' Environment Variable is Not Defined`);return e},"getEnv"),M=d(t=>JSON.parse(m(t)),"getEnvJson"),N=d(t=>{let s=t.split(" ")[2];if(s.length===10)try{return parseInt(s.slice(0,2))<=16?new Date(parseInt(s+"000")):new Date(parseInt(s.slice(0,4)),parseInt(s.slice(4,6)),parseInt(s.slice(6,8)),0,0,0,0)}catch{return!1}else return!1},"parseSerialFromAnswerData");var A=b(require("path")),z=b(require("util")),C=require("fs/promises"),P=require("fs"),F=require("@ethersproject/address"),Q=b(require("cross-fetch"));var W=b(require("util"));var be=W.default.promisify(require("child_process").exec);async function H(t){let{stderr:e}=await be(`solc-select use ${t}`);return e===""?!0:(console.error(e),!1)}d(H,"setSolidityVersion");var G=new Map([["mainnet",`https://api.etherscan.io/api?apikey=${m("ETHERSCAN_API_KEY")}`],["polygon",`https://api.polygonscan.com/api?apikey=${m("POLYGONSCAN_API_KEY")}`],["polygon-testnet",`https://api-testnet.polygonscan.com/api?apikey=${m("POLYGONSCAN_API_KEY")}`]]);var we=z.default.promisify(require("child_process").exec);async function Re(t,e,s){var w;let a=A.default.join(__dirname,"../contracts");(0,P.existsSync)(a)||(0,P.mkdirSync)(a);let o=t+"-"+(0,F.getAddress)(e);await(0,C.writeFile)(A.default.join(a,o+".sol"),s);let n=`slither ${A.default.join(a,o+".sol")} --json ${A.default.join(a,o+".json")} --exclude-low --exclude-medium --exclude-informational --exclude-optimization --solc-disable-warnings`;try{let{stdout:f,stderr:i}=await we(n)}catch{}let c=await(0,C.readFile)(A.default.join(a,o+".json"),{encoding:"utf8"}),k=JSON.parse(c.toString());return k.success===!0&&((w=k.results)==null?void 0:w.detectors)!=null&&k.results.detectors.length>0?(console.log("storeAndRun/foundIssue"),{foundIssue:!0,data:k.results.detectors}):(console.log("storeAndRun/Nothing Found"),{foundIssue:!1,data:[]})}d(Re,"storeAndRun");async function O(t,e){var o;let s=t+"-"+(0,F.getAddress)(e),a=A.default.join(__dirname,"../contracts",s+".json");if((0,P.existsSync)(a)){let n=await(0,C.readFile)(a,{encoding:"utf8"}),c=JSON.parse(n.toString());return c.success===!0&&((o=c.results)==null?void 0:o.detectors)!=null&&c.results.detectors.length>0?{cached:!0,success:!0,results:c.results.detectors,error:""}:{cached:!0,success:!0,results:[],error:""}}else{let n=await(0,Q.default)(`${G.get(t)}&module=contract&action=getsourcecode&address=${e}`);if(n.ok===!0){let c=await n.json();if(c.status=="1"&&c.result.length>0)if(c.result[0].Proxy==="0"){let k=c.result[0].SourceCode,w=c.result[0].CompilerVersion.split("+")[0].slice(1),f=await H(w);if(console.log("setVersionResp",w,f),f===!0){let i=await Re(t,e,k);return i.foundIssue?{success:!0,results:i.data,error:""}:{success:!0,results:[],error:""}}else return console.log("Failed to set Solidity Version."),{success:!1,error:"Failed to set Solidity Version.",results:[]}}else return{success:!1,error:"Proxy",results:[]};else return console.log("Source code not verified on EtherScan"),{success:!1,error:"Source code not verified on EtherScan",results:[]}}else return console.log("Error Fetching Source Code from EtherScan"),{success:!1,error:"Error Fetching Source Code from EtherScan",results:[]}}}d(O,"testUsingSlither");var x=require("fastest-levenshtein"),ce=require("socks-proxy-agent"),pe=b(require("util"));var U={1:{id:"409H/EtherAddressLookup",name:"EtherAddressLookup",link:"https://github.com/409H/EtherAddressLookup"},2:{id:"MetaMask/eth-phishing-detect",name:"EthPhishingDetector",link:"https://github.com/MetaMask/eth-phishing-detect"},3:{id:"MyEtherWallet/ethereum-lists",name:"MyEtherWallet",link:"https://github.com/MyEtherWallet/ethereum-lists"},4:{id:"DAOBuidler/MetaShieldExtension",name:"MetaShield",link:"https://www.metashield.cc/indexen.html"},5:{id:"cryptoscamdb",name:"CryptoScamDB",link:"https://cryptoscamdb.org/"},6:{id:"walletguard",name:"Wallet Guard",link:"https://walletguard.app/"},7:{id:"anudit/chainabuse",name:"Chainabuse",link:"https://www.chainabuse.com/"},8:{id:"mitchellkrogza/Phishing.Database",name:"Phishing Domain Database",link:"https://github.com/mitchellkrogza/Phishing.Database"},9:{id:"phish.sinking.yachts",name:"SinkingYachts",link:"https://phish.sinking.yachts/"},10:{id:"stamparm/aux",name:"stamparm/aux",link:"https://github.com/stamparm/aux"},11:{id:"scamsniffer/scam-database",name:"ScamSniffer",link:"https://scamsniffer.io/"},12:{id:"phishfort/phishfort-lists",name:"PhishFort",link:"https://www.phishfort.com/"},13:{id:"blueshell-io/scamdb",name:"BlueShell",link:"https://blueshell.io/"}};var X=b(require("cross-fetch"));async function Se(){console.log("Compiling tokenlists");let t={1:"https://account.metafi.codefi.network/networks/1/tokens",10:"https://account.metafi.codefi.network/networks/10/tokens",137:"https://account.metafi.codefi.network/networks/137/tokens",51:"https://account.metafi.codefi.network/networks/56/tokens",43114:"https://account.metafi.codefi.network/networks/43114/tokens",42161:"https://account.metafi.codefi.network/networks/42161/tokens",250:"https://account.metafi.codefi.network/networks/250/tokens"},e=Object.keys(t).map(o=>(0,X.default)(t[o]).then(n=>n.json())),s=await Promise.allSettled(e),a=[];for(let o=0;o<s.length;o++){let n=s[o];n.status=="fulfilled"&&(a=a.concat(n.value))}return console.log("\u{1FA99} ",a.length,"Tokens"),a.push({name:"Matic",symbol:"MATIC",decimals:18,address:"0x0000000000000000000000000000000000001010",iconUrl:"https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png",sources:["https://wiki.polygon.technology/docs/faq/wallet-bridge-faq/#why-is-the-matic-token-is-not-supported-on-pos"],chainId:137,coingeckoId:"matic-network"}),a}d(Se,"getTokenLists");var Z=Se;var y=(0,te.default)({logger:!1}),Ae=require("ethereumjs-util").toBuffer,Ee=require("eth-phishing-detect"),_e=pe.default.promisify(require("child_process").exec);y.register(se.default,{global:!0});y.register(re.default,{global:!0});y.register(ae.default,{origin:"*"});var Ie=require("megahash"),p=new Ie,S=new Set,Ce=`https://api.tenderly.co/api/v1/account/${m("TENDERLY_USER")}/project/${m("TENDERLY_PROJECT")}/simulate`,Pe="socks5://0.0.0.0:9150",j=[],je=new le.Convo(m("CONVO_API_KEY")),Te={alchemyApiKey:m("ALCHEMY_API_KEY"),CNVSEC_ID:m("CNVSEC_ID"),etherscanApiKey:m("ETHERSCAN_API_KEY"),polygonscanApiKey:m("POLYGONSCAN_API_KEY"),optimismscanApiKey:m("OPTIMISMSCAN_API_KEY"),polygonMainnetRpc:"",etherumMainnetRpc:"",avalancheMainnetRpc:"",maticPriceInUsd:0,etherumPriceInUsd:0,deepdaoApiKey:"",zapperApiKey:"",DEBUG:!1},T=new Map([["mainnet","MAINNET_RPC_URL"],["mainnet-flashbots","MAINNET_FLASHBOTS_RPC_URL"],["mainnet-flashbots-fast","MAINNET_FLASHBOTS_FAST_RPC_URL"],["ropsten","ROPSTEN_RPC_URL"],["kovan","KOVAN_RPC_URL"],["rinkeby","RINKEBY_RPC_URL"],["goerli","GOERLI_RPC_URL"],["sepolia","SEPOLIA_RPC_URL"],["goerli-flashbots","GOERLI_FLASHBOTS_RPC_URL"],["polygon","POLYGON_RPC_URL"],["polygon-testnet","POLYGON_TESTNET_RPC_URL"],["polygon-zkevm","POLYGON_ZKEVM_RPC_URL"],["optimism","OPTIMISM_RPC_URL"],["optimism-testnet","OPTIMISM_TESTNET_RPC_URL"],["optimism-bedrock","OPTIMISM_BEDROCK_RPC_URL"],["arbitrum","ARBITRUM_RPC_URL"],["arbitrum-nova","ARBITRUM_NOVA_RPC_URL"],["arbitrum-testnet","ARBITRUM_TESTNET_RPC_URL"]]),xe=d(t=>{let e=T.get(t);if(e){let s=M(e);return s[Math.floor(Math.random()*s.length)]}else return""},"networkToRpc");function g(t,e=void 0){return{isMalicious:!0,rpcResp:{id:420,jsonrpc:"2.0",error:{code:-32003,message:t}},details:e}}d(g,"getMalRpcError");async function q(t){try{if((0,_.isAddress)(t)){let e=await je.omnid.kits.isMalicious((0,_.getAddress)(t),Te);return console.log("omnid.kits.isMalicious",(0,_.getAddress)(t),e),(e==null?void 0:e.alchemy)&&e.alchemy===!0?g("Spam Contract Flagged by Alchemy",e):(e==null?void 0:e.chainabuse)&&Boolean(e.chainabuse)===!0?g("Contract Flagged by Chainabuse",e):(e==null?void 0:e.scanblocks)&&e.scanblocks===!0?g("Address Flagged by Scanblocks",e):(e==null?void 0:e.cryptoscamdb)&&e.cryptoscamdb===!0?g("Contract Flagged by CryptoscamDB",e):(e==null?void 0:e.etherscan)&&"label"in e.etherscan?g(`Address Flagged as ${e.etherscan.label} by Etherscan`,e):(e==null?void 0:e.mew)&&"comment"in e.mew?g("Address Flagged by MyEtherWallet",e):e!=null&&e.sdn?g("Address Flagged by OFAC",e):e!=null&&e.tokenblacklist?g("Address Blacklisted by Stablecoin",e):e!=null&&e.txn?g("Address/Contract Funded by Tornado Cash.",e):{isMalicious:!1}}else return{isMalicious:!1}}catch{return{isMalicious:!1}}}d(q,"checkAddress");async function ve(t){try{return await(0,u.default)(Ce,{method:"POST",body:JSON.stringify(t),headers:{"X-Access-Key":m("TENDERLY_ACCESS_KEY")}}).then(s=>s.json())}catch(e){return console.log("alchemySimulate",e),!1}}d(ve,"alchemySimulate");async function de(t,e){let s=e.query;try{let a=t==="manual"?s.rpcUrl:xe(t);if(a!==void 0)return await(0,u.default)(a,{method:"POST",body:JSON.stringify(e.body),agent:(s==null?void 0:s.useTor)==="true"?new ce.SocksProxyAgent(Pe):null,headers:{"Content-Type":"application/json",Accept:"application/json","infura-source":"metamask/internal",origin:"chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn"}}).then(n=>n.json());{let{rpcResp:o}=g("Invalid RPC Url");return o}}catch(a){let{rpcResp:o}=g(a);return o}}d(de,"sendToRpc");async function De(t,e){let s=e.body,a=e.query;var o=Ae(s.params[0]),n=ie.FeeMarketEIP1559Transaction.fromSerializedTx(o),c=n.toJSON();if(Object.keys(c).includes("to")===!0){let{isMalicious:i,rpcResp:l}=await q(c.to);if(i==!0&&l)return l.id=s.id,l}let k=parseInt(c.maxFeePerGas||"0")+parseInt(n.maxPriorityFeePerGas.toString(10)||"0"),w={network_id:parseInt(n.chainId.toString(10)),from:n.getSenderAddress().toString(),to:n.to?n.to.toString():"",input:n.data.toString("hex"),gas:parseInt(n.gasLimit.toString(10)),gas_price:k.toString(10),value:parseInt(n.value.toString(10)),save_if_fails:!0,save:!1,simulation_type:"full"},f=await ve(w);if(f!=null&&f!=!1&&"transaction_info"in f&&f.transaction_info!=null){console.log("Sim Successful");for(let i=0;i<f.transaction_info.logs.length;i++){let l=f.transaction_info.logs[i];if(l.name==="Approval"||l.name==="Transfer"){let{isMalicious:h,rpcResp:E}=await q(l.inputs[1].value);if(h===!0)return E}}}if(t!="manual"&&"blockUnverifiedContracts"in a&&a.blockUnverifiedContracts==="true"){let i=await(0,u.default)(`https://sourcify.dev/server/check-all-by-addresses?addresses=${c==null?void 0:c.to}&chainIds=1,4,11155111,137,80001,10,42161,421611`),l;if(i.ok===!0){if(l=await i.json(),Object.keys(l).includes("status")){let{rpcResp:h}=g("The contract is unverified");return h}}else{let{rpcResp:h}=g("Sourcify Request Failed");return h}}if(t in["mainnet","polygon","polygon-testnet"]&&(a==null?void 0:a.enableScanners)!==void 0&&c.to!==void 0){let i=t,l=a.enableScanners.split(",");for(let h=0;h<l.length;h++)if(l[h]==="slither"&&(await O(i,c.to)).results.length>0)return g("Slither detected possible attack vectors")}if((a==null?void 0:a.blockRecentDnsUpdates)!=null&&Boolean(parseInt(a.blockRecentDnsUpdates))===!0){let i=parseInt(a.blockRecentDnsUpdates),l=await(0,u.default)(`https://dns.google/resolve?name=${e.hostname}&type=SOA`);if(l.ok===!0){let h=await l.json();if(h.Answer.length>0&&N(h.Answer[0].data)!=!1){let E=N(h.Answer[0].data);if(E!==!1&&(Date.now()-E.valueOf())/864e5<=i){let{rpcResp:$}=g("The domain's DNS has been changed recently.");return $}}}}return await de(t,e)}d(De,"processTxs");y.get("/",async(t,e)=>{let s=(0,ne.readFileSync)(oe.default.join(__dirname,"../public/","index.html"));return e.header("Content-Security-Policy","default-src *; style-src 'self' 'unsafe-inline' cdnjs.cloudflare.com; script-src 'self' 'unsafe-inline'; img-src data:;"),e.type("text/html").send(s)});y.get("/ping",async(t,e)=>e.send({hello:"world"}));y.get("/blacklist",async(t,e)=>(e.headers({"Cache-Control":`max-age=${24*60*60}`}),e.send(p.stats())));y.get("/whitelist",async(t,e)=>(e.headers({"Cache-Control":`max-age=${24*60*60}`}),e.send(Array.from(S.values()))));y.get("/tor",async(t,e)=>{try{let{stdout:s,stderr:a}=await _e("cat /var/lib/tor/hidden_service/hostname");return a==""?e.send({domain:s.replace(`
`,"")}):e.send({domain:!1,error:a})}catch(s){return e.send({domain:!1,error:s})}});y.get("/blacklist/*",async(t,e)=>{e.headers({"Cache-Control":`max-age=${24*60*60}`});let s=t.params,a=p.get(s["*"]);if(a===void 0)return e.send({blacklisted:!1});{let o=(0,x.closest)(s["*"],Array.from(S)),n=(0,x.distance)(s["*"],o);return e.send({blacklisted:!0,list:U[a],closestWhitelisted:{url:o,distance:n}})}});y.get("/malicious/:ethAddress",async(t,e)=>{e.headers({"Cache-Control":`max-age=${24*60*60}`});let s=t.params,a=await q(s.ethAddress);return e.send(a)});y.get("/tokendeets/:ethAddress",async(t,e)=>{var o;e.headers({"Cache-Control":`max-age=${24*60*60}`});let s=t.params,a=[];for(let n=0;n<j.length;n++)((o=j[n])==null?void 0:o.address.toLowerCase())===(s==null?void 0:s.ethAddress.toLowerCase())&&a.push(j[n]);return e.send(a)});y.post("/lifejacket/:jacket",async(t,e)=>{let s=["slither","mythril"],{jacket:a}=t.params;if(s.includes(a)){let{network:o,address:n}=t.body;if(o!=null&&n!=null&&(0,_.isAddress)(n)){if(a==="slither"){let c=await O(o,n);return e.send(c)}}else return e.send({success:!1,error:"Invalid body params, network or address"})}else return e.send({success:!1,error:`Invalid LifeJacket, supported ${s.toString()}`})});y.post("/:network",async(t,e)=>{let{hostname:s}=t,a=t.body;if(!Ee(s)&&Boolean(p.get(s))===!1){let{network:n}=t.params;if(n&&T.get(n))if(a.method=="eth_sendRawTransaction"){let c=await De(n,t);return e.send(c)}else{let c=await de(n,t);return e.send(c)}else return e.send({error:`Invalid network '${n}', available networks are ${Array.from(T.keys()).join(", ")}`})}else{let{rpcResp:n}=g(`\u{1F6A8} Phishing detector for the site ${s} has been triggered.`);return e.send(n)}});y.addHook("preHandler",(t,e,s)=>{e.header("onion-location",`http://omnid2kq4qppsp2a5hgeqok6ahkfo23tdtoe7km4uier4o43taxct5ad.onion${t.url}`),s()});async function Le(){p.delete("instagram.com");let t=await(0,u.default)("https://api.llama.fi/lite/protocols2").then(i=>i.json());t.protocols.forEach(i=>{try{let l=new URL(i.url.replace(`
`,"").replace("\r","")).hostname.replace("www.","");S.add(l),p.delete(l)}catch{}}),console.log("\u{1F7E2} DefiLlama Whitelist",t.protocols.length);let e=await(0,u.default)("https://apis.thedapplist.com/api/won-dapps?limit=1000000").then(i=>i.json()),s=0;Object.values(e.data).forEach(i=>{try{if(i.votes>=5){let l=new URL(i.msg.payload.url).hostname.replace("www.","");S.add(l),p.delete(l),s+=1}}catch{}}),console.log("\u{1F7E2} Dapplist Whitelist",s);let a=await(0,u.default)("https://gist.githubusercontent.com/anudit/8df081a368397dea5ff4ce8bdfac6256/raw/9d36d984fe3ed78bd1f993c4cca22ec4093d9253/index.json").then(i=>i.json()),o=0;Object.values(a.pageProps.defiList).forEach(i=>{try{let l=new URL(i.url).hostname.replace("www.","");S.add(l),p.delete(l),o+=1}catch{}}),console.log("\u{1F7E2} DefiPulse Whitelist",o);let n=await(0,u.default)("https://dap.ps/metadata/all").then(i=>i.json()),c=0,k=Object.values(n);for(let i=0;i<k.length;i++)try{let l=k[i],h=new URL(l.details.url).hostname;S.add(h),p.delete(h),c+=1}catch(l){console.log(l);continue}console.log("\u{1F7E2} Dap.ps Whitelist",c);let w=await(0,u.default)("https://gist.githubusercontent.com/anudit/a88c5888dcfb7b9cbf14a57d8eca61ad/raw/c9e02047a31989715249c9251e828fbab15d8140/links.json").then(i=>i.json()),f=0;w.forEach(i=>{try{let l=new URL(i.homepage).hostname.replace("www.","");S.add(l),p.delete(l),f+=1}catch{}}),console.log("\u{1F7E2} Walletconnect Whitelist",f)}d(Le,"clearWhitelist");async function ee(){let t=p.stats().numKeys;console.log("Compiling Blacklist");let e=[],s=d((r,R=0)=>{let D=p.stats().numKeys,J=D-t,ue={Name:U[r].id,Length:R,"Unique Added":`${J.toLocaleString()} [+${(J/R*100).toFixed(2)}%]`,Total:D};return t=D,ue},"logStat"),a=await(0,u.default)("https://raw.githubusercontent.com/409H/EtherAddressLookup/master/blacklists/domains.json").then(r=>r.json());a.forEach(r=>{p.set(r,1)}),e.push(s(1,a.length));let o=await(0,u.default)("https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/master/src/config.json").then(r=>r.json());o.blacklist.forEach(r=>{p.set(r,2)}),e.push(s(2,o.blacklist.length));let n=await(0,u.default)("https://raw.githubusercontent.com/MyEtherWallet/ethereum-lists/master/src/urls/urls-darklist.json").then(r=>r.json());n.forEach(r=>{p.set(r.id,3)}),e.push(s(3,n.length));let c=await(0,u.default)("https://raw.githubusercontent.com/DAOBuidler/MetaShieldExtension/main/function/data/domain_blacklist.json").then(r=>r.json());c.forEach(r=>{let R=r.replace("'","").replace("http://","").replace("https://","");p.set(R,4)}),e.push(s(4,c.length));let k=await(0,u.default)("https://api.cryptoscamdb.org/v1/blacklist").then(r=>r.json());k.result.forEach(r=>{p.set(r,5)}),e.push(s(5,k.result.length));let w=await(0,u.default)("https://wallet-guard-server-prod.herokuapp.com/lists/all",{method:"GET",redirect:"follow",headers:{Origin:"chrome-extension://pdgbckgdncnhihllonhnjbdoighgpimk"}}),f=JSON.parse(await w.text());f.blocklist.forEach(r=>{p.set(r,6)}),JSON.parse(f.whitelist).map(r=>r.extensions.map(R=>r.key+R)).flat().forEach(r=>{S.add(r),p.delete(r)}),e.push(s(6,f.blocklist.length));let h=await(await(0,u.default)("https://gist.githubusercontent.com/anudit/643a5a5a7b105a563836578fa6dfdbd1/raw/964215961af0bdce8e64a112da52a022f4679cf7/Chainabuse-ScamDomains.json")).json();h.forEach(r=>{p.set(r,7)}),e.push(s(7,h.length));let I=(await(await(0,u.default)("https://raw.githubusercontent.com/mitchellkrogza/Phishing.Database/master/phishing-domains-ACTIVE.txt")).text()).split(`
`);for(let r=0;r<I.length;r++)try{p.set(I[r],8)}catch{continue}e.push(s(8,I.length));let B=await await(0,u.default)("https://phish.sinking.yachts/v2/all").then(r=>r.json());B.forEach(r=>{p.set(r,9)}),e.push(s(9,B.length));let v=(await(await(0,u.default)("https://raw.githubusercontent.com/stamparm/aux/master/maltrail-malware-domains.txt")).text()).split(`
`);for(let r=0;r<v.length;r++)try{p.set(v[r],10)}catch{continue}e.push(s(10,v.length));let K=await(0,u.default)("https://raw.githubusercontent.com/scamsniffer/scam-database/main/blacklist/domains.json").then(r=>r.json());K.forEach(r=>{p.set(r,11)}),e.push(s(11,K.length));let V=await(0,u.default)("https://raw.githubusercontent.com/phishfort/phishfort-lists/master/blacklists/domains.json").then(r=>r.json());V.forEach(r=>{p.set(r,12)}),e.push(s(12,V.length));let Y=(await(0,u.default)("https://raw.githubusercontent.com/blueshell-io/scamdb/bec21924d47b3391196b7bb701316a75a3ac6009/website.json").then(r=>r.json())).data.map(r=>r.scams).flat().filter(r=>r!=null).map(r=>r.url).filter(r=>r!="");Y.forEach(r=>{try{let R=new URL(r).hostname;p.set(R,13)}catch{}}),e.push(s(13,Y.length)),console.table(e),await Le()}d(ee,"compileBlacklist");async function Me(){j=await Z();let t=[],e=d((s,a=0)=>({Network:s,"RPC Set":a}),"logStat");T.forEach((s,a)=>{t.push(e(a,M(s).length))}),console.table(t)}d(Me,"rpcSet");y.listen({port:parseInt(m("PORT"))||80,host:"0.0.0.0"},(t,e)=>{if(Me(),ee(),setInterval(ee,60*60*1e3),!t)console.log("\u{1F680} Server is listening on",e);else throw t});
