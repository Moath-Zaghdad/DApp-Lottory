const Web3 = require('web3');
const { interface, bytecode } = require('./compile');
const HDWalletProvider = require('truffle-hdwallet-provider');
const keys = require('./keys');

const provider = new HDWalletProvider(
    keys.mnemonic,
    'https://rinkeby.infura.io/v3/d016de6e29c24e8389566623a8dfac4e',
);
const web3 = new Web3(provider);

const deploy = async () => {
    accounts = await web3.eth.getAccounts();

    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ gas: '1000000', from: accounts[0] });

    console.log('Contract deployed to ', result.options.address);
};
deploy();
