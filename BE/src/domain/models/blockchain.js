const _ = require('lodash');
const Block = require('./block');
const { isValidAddress, Transaction, TxIn, TxOut } = require('./transaction');
const TransactionPool = require('./transactionPool');
const Wallet = require('./wallet');

const BLOCK_GENERATION_INTERVAL = 10;
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;
const COINBASE_AMOUNT = 50;
const INIT_BC_BALANCE = 1000000;


// generate public and private key for headmaster account //
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const keyPair = ec.genKeyPair();
const publicKey = keyPair.getPublic().encode('hex');
const privateKey = keyPair.getPrivate().toString('hex');
// generate public and private key for headmaster account  //

const genesisTransaction = new Transaction(
    "",
    [new TxIn('', 0, "")],
    [new TxOut(publicKey, INIT_BC_BALANCE)]
)
genesisTransaction.id = Transaction.getTransactionId(genesisTransaction);

class Blockchain {
    constructor() {
        this.privateKey = privateKey;
        this.publicKey = publicKey;
        this.chain = [this.createGenesisBlock()];
        this.unspentTxOuts = Transaction.processTransactions(this.chain[0].transactions, [], 0);
    }

    createGenesisBlock() {
        const genesisBlock = Block.createBlock(0, '', [genesisTransaction], 0);
        return findBlock(0, genesisBlock.hash, genesisBlock.timestamp, genesisBlock.transactions, genesisBlock.difficulty);
    }

    getBlockchain() {
        return _.cloneDeep(this.chain);
    }

    getUnspentTxOuts() {
        return _.cloneDeep(this.unspentTxOuts);
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    isValidChain() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.computeHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }

    addBlockToChain(newBlock) {
        if (isValidNewBlock(newBlock, this.getLatestBlock())) {
            const retVal = Transaction.processTransactions(newBlock.transactions, this.getUnspentTxOuts(), newBlock.index);
            if (retVal === null) {
                console.log('block is not valid in terms of transactions');
                return false;
            } else {
                this.chain.push(newBlock);
                this.unspentTxOuts = retVal;
                TransactionPool.updateTransactionPool(this.unspentTxOuts);
                return true;
            }
        }
        return false;
    }

    generateRawNextBlock(transactions) {
        const previousBlock = this.getLatestBlock();
        const difficulty = getDifficulty(this.getBlockchain());
        const nextIndex = previousBlock.index + 1;
        const nextTimestamp = getCurrentTimestamp();
        const newBlock = findBlock(nextIndex, previousBlock.hash, nextTimestamp, transactions, difficulty);
        if (this.addBlockToChain(newBlock)) {
            return newBlock;
        } else {
            return null;
        }
    }

    getMyUnspentTransactionOutputs(privateKey) {
        return Wallet.findUnspentTxOuts(Wallet.getPublicFromWallet(privateKey), this.getUnspentTxOuts);
    }

    generateNextBlock(privateKey) {
        const coinbaseTx = Transaction.getCoinbaseTransaction(Wallet.getPublicFromWallet(privateKey), this.getLatestBlock().index + 1);
        const blockData = [coinbaseTx].concat(TransactionPool.getTransactionPool());
        return this.generateRawNextBlock(blockData);
    }

    generateNextBlockWithTransactions(privateKey, receiverAddress, amount) {
        if (!isValidAddress(receiverAddress)) {
            throw Error('invalid address');
        }
        if (typeof amount !== 'number') {
            throw Error('invalid amount');
        }
        const coinbaseTx = Transaction.getCoinbaseTransaction(publicKey, this.getLatestBlock().index + 1);
        const tx = Wallet.createTransaction(receiverAddress, amount, privateKey, this.getUnspentTxOuts(), TransactionPool.getTransactionPool());
        const blockData = [coinbaseTx, tx];
        return this.generateRawNextBlock(blockData);
    }

    getAccountBalance(privateKey) {
        return Wallet.getBalance(Wallet.getPublicFromWallet(privateKey), this.getUnspentTxOuts());
    }

    sendTransaction(privateKey, address, amount) {
        const tx = Wallet.createTransaction(address, amount, privateKey, this.getUnspentTxOuts(), TransactionPool.getTransactionPool());
        TransactionPool.addToTransactionPool(tx, this.getUnspentTxOuts());
        console.log(TransactionPool.getTransactionPool());
        return tx;
    }

    replaceChain(newBlocks) {
        const aUnspentTxOuts = isValidChain(newBlocks);
        const validChain = aUnspentTxOuts !== null;
        if (validChain && getAccumulatedDifficulty(newBlocks) > getAccumulatedDifficulty(this.getBlockchain())) {
            console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
            this.chain = newBlocks;
            this.unspentTxOuts = aUnspentTxOuts;
            TransactionPool.updateTransactionPool(this.unspentTxOuts);
        } else {
            console.log('Received blockchain invalid');
        }

    }
}

/// SUPPORT FUNCTIONS ///
const getAdjustedDifficulty = (latestBlock, aBlockchain) => {
    const prevAdjustmentBlock = aBlockchain[aBlockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
    const timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
    if (timeTaken < timeExpected / 2) {
        return prevAdjustmentBlock.difficulty + 1;
    } else if (timeTaken > timeExpected * 2) {
        return prevAdjustmentBlock.difficulty - 1;
    } else {
        return prevAdjustmentBlock.difficulty;
    }
};

const getDifficulty = (aBlockchain) => {
    const latestBlock = aBlockchain[aBlockchain.length - 1];
    if (latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0) {
        return getAdjustedDifficulty(latestBlock, aBlockchain);
    } else {
        return latestBlock.difficulty;
    }
};

const getCurrentTimestamp = () => Math.round(new Date().getTime() / 1000);

const findBlock = (index, previousHash, timestamp, transactions, difficulty) => {
    let nonce = 0;
    while (true) {
        const hash = Block.calculateHash(index, previousHash, timestamp, transactions, difficulty, nonce);
        if (Block.hashMatchesDifficulty(hash, difficulty)) {
            return new Block({ index, hash, previousHash, timestamp, transactions, difficulty, nonce });
        }
        nonce++;
    }
};

const isValidTimestamp = (newBlock, previousBlock) =>
    (previousBlock.timestamp - 60 < newBlock.timestamp) &&
    (newBlock.timestamp - 60 < getCurrentTimestamp());

const hasValidHash = (block) => {
    if (!Block.hashMatchesBlockContent(block)) {
        console.log('invalid hash, got:' + block.hash);
        return false;
    }
    if (!Block.hashMatchesDifficulty(block.hash, block.difficulty)) {
        console.log('block difficulty not satisfied. Expected: ' + block.difficulty + 'got: ' + block.hash);
        return false;
    }
    return true;
};

const isValidNewBlock = (newBlock, previousBlock) => {
    if (!Block.isValidBlockStructure(newBlock)) {
        console.log('invalid block structure: %s', JSON.stringify(newBlock));
        return false;
    }
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('invalid index');
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previoushash');
        return false;
    } else if (!isValidTimestamp(newBlock, previousBlock)) {
        console.log('invalid timestamp');
        return false;
    } else if (!hasValidHash(newBlock)) {
        return false;
    }
    return true;
};

const getAccumulatedDifficulty = (aBlockchain) => {
    return aBlockchain
        .map((block) => block.difficulty)
        .map((difficulty) => Math.pow(2, difficulty))
        .reduce((a, b) => a + b);
};


const isValidChain = (blockchainToValidate) => {
    const isValidGenesis = (block) =>
        JSON.stringify(block) === JSON.stringify(genesisBlock);

    if (!isValidGenesis(blockchainToValidate[0])) {
        return null;
    }
    let aUnspentTxOuts = [];

    for (let i = 0; i < blockchainToValidate.length; i++) {
        const currentBlock = blockchainToValidate[i];
        if (i !== 0 && !isValidNewBlock(currentBlock, blockchainToValidate[i - 1])) {
            return null;
        }
        aUnspentTxOuts = Transaction.processTransactions(currentBlock.transactions, aUnspentTxOuts, currentBlock.index);
        if (aUnspentTxOuts === null) {
            console.log('invalid transactions in blockchain');
            return null;
        }
    }
    return aUnspentTxOuts;
};

/// END SUPPORT FUNCTIONS ///

module.exports = Blockchain;
