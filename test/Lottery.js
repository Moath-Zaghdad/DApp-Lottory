const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const provider = ganache.provider();
const web3 = new Web3(provider);

const { interface, bytecode } = require('../compile');
let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000' });

    lottery.setProvider(provider);
});

describe('Lottery Contract', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });

    it('allows one to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.015', 'ether'),
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0],
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    });

    it('allaws multople accouts to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.015', 'ether'),
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.015', 'ether'),
        });
        await lottery.methods.enter().send({
            from: accounts[3],
            value: web3.utils.toWei('0.015', 'ether'),
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[1],
        });

        assert.equal(accounts[1], players[0]);
        assert.equal(accounts[2], players[1]);
        assert.equal(accounts[3], players[2]);
        assert.equal(3, players.length);
    });

    it('requires a minimum amout of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[2],
                value: web3.utils.toWei('0.001', 'ether'),
            });
            assert.fail('Should not pass');
        } catch (err) {
            assert.notEqual('Should not pass', err.message);
            assert(err);
        }
    });

    it('only manager can call pickWinner', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[2],
            });
        } catch (err) {
            assert(
                new RegExp('\\b' + 'revert' + '\\b', 'i').exec(
                    JSON.stringify(err.results),
                ),
            );
            assert(err);
        }
    });

    it('sends money to the winner and resets the players array', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('1', 'ether'),
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);

        await lottery.methods.pickWinner().send({ from: accounts[0] });

        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initialBalance;

        assert(difference > web3.utils.toWei('0.8', 'ether'));
    });
});
