require('dotenv').config()
const { ContractFactory, Wallet, ethers, Contract } = require('ethers');

const contractAddress = "0x65CAEC30a86135c1dce58f8d4b469E67F87692c2";

const contractAbi = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "num",
				"type": "uint256"
			}
		],
		"name": "store",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "retrieve",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
const RPC = "http://127.0.0.1:80/shardeum-testnet"


async function deployContract(){

    const provider = new ethers.providers.JsonRpcProvider(RPC);
    let wallet = new Wallet(process.env.PRIVKEY);
    const account = wallet.connect(provider);

    const factory = new ContractFactory(contractAbi,
    "608060405234801561001057600080fd5b50610187806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b60405161005091906100d8565b60405180910390f35b610073600480360381019061006e9190610124565b61007e565b005b60008054905090565b806000819055507f9c1b77fde818630dff12fd7f745b3be4920af6325771bc760734502ae7509135816040516100b491906100d8565b60405180910390a150565b6000819050919050565b6100d2816100bf565b82525050565b60006020820190506100ed60008301846100c9565b92915050565b600080fd5b610101816100bf565b811461010c57600080fd5b50565b60008135905061011e816100f8565b92915050565b60006020828403121561013a576101396100f3565b5b60006101488482850161010f565b9150509291505056fea26469706673582212202cf5ac1c620c32b9af4e1bc758c8c8d010d52e2e12d97e378efe20e1f3e6250664736f6c63430008110033",
    account);

    const txn = await factory.deploy();
    await txn.deployTransaction.wait()

    console.log(txn.address);
    console.log(txn.deployTransaction);
}

async function updateDetails(){

    const provider = new ethers.providers.JsonRpcProvider(RPC);
    let wallet = new Wallet(process.env.PRIVKEY);
    const account = wallet.connect(provider);

    const contract = new Contract(contractAddress, contractAbi, account);

    let randomNumber = Math.floor(Math.random()*10000);

    const txn = await contract.store(randomNumber);
    await txn.wait();

    const deets  = await contract.retrieve();

    console.log(randomNumber, deets.toNumber(), randomNumber == deets.toNumber());


}

updateDetails();
