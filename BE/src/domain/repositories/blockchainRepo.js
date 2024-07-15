const Blockchain = require('../models/blockchain');
const Wallet = require('../models/wallet');

class blockchainRepository {
    static wallet = Wallet;
    constructor() {
        this.chain = new Blockchain();
    }

    getBalance(privateKey) {
        return this.chain.getAccountBalance(privateKey);
    }

    transfer(privateKey, receiverAddress, amount) {
        return this.chain.generateNextBlockWithTransactions(privateKey, receiverAddress, amount);
    }

    historyTransaction(privateKey) {
        return this.chain.getHistoryTransaction(privateKey);
    }

    getBlockchain() {
        return this.chain.getBlockchain();
    }

    getStake(privateKey) {
        return this.chain.getMyStake(privateKey);
    }
}

module.exports = blockchainRepository;
