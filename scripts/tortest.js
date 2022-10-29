const { default: fetch } = require("cross-fetch");
const { SocksProxyAgent } = require("socks-proxy-agent");

async function getData(){
    const proxyUrl = 'socks5://0.0.0.0:9150';
    var agent = new SocksProxyAgent(proxyUrl);

    let data = await fetch('https://api.ipify.org/?format=json', {
        method: "GET",
        agent: agent,
        headers: {
            'Content-Type': 'application/json',
            "Accept": 'application/json'
        }
    }).then(e=>e.json());
    console.log('proxy', data);

    data = await fetch('https://api.ipify.org/?format=json', {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            "Accept": 'application/json'
        }
    }).then(e=>e.json());
    console.log('no proxy', data);
}


getData();
