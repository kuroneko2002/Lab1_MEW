const DTOs = require('../dtos');
const blockchainRepo = require('../../domain/repositories/blockchainRepo');
const getPublic = require('../../utils/get-public');

const users = [];

class blockchainService {
    constructor() {
        this.blockchainRepo = new blockchainRepo();
    }

    register() {
        const privateKey = blockchainRepo.wallet.initWallet(this.blockchainRepo.chain);
        users.push(getPublic(privateKey));
        return privateKey;
    }

    login(privateKey) {
        const walletAddress = getPublic(privateKey);
        if (!users.includes(walletAddress)) {
            return null;
        }
        return walletAddress;
    }

    getBalance(privateKey) {
        return this.blockchainRepo.getBalance(privateKey);
    }

    transfer(privateKey, receiverAddress, amount) {
        const newBlock = this.blockchainRepo.transfer(privateKey, receiverAddress, amount);
        return newBlock === null ? null : new DTOs.BlockDTO(newBlock);
    }

    historyTransaction(privateKey) {
        return this.blockchainRepo.historyTransaction(privateKey);
    }

    getBlockchain() {
        const chain = this.blockchainRepo.getBlockchain();
        const retVal=  chain.map(block => new DTOs.BlockDTO(block));
        return retVal;
    }

    getStake(privateKey) {
        return this.blockchainRepo.getStake(privateKey);
    }
}

module.exports = blockchainService;
