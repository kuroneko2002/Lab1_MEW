const _ = require('lodash');
const Block = require('./block');
const { Transaction, TxIn, TxOut } = require('./transaction');
const TransactionPool = require('./transactionPool');
const Wallet = require('./wallet');
const isValidAddress = require('../../utils/is-valid-address');

const { INIT_BC_BALANCE, COINBASE_AMOUNT } = require('../../utils/const');


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
        this.stakeMap = {};
        this.stakeMap[this.publicKey] = INIT_BC_BALANCE;
    }

    createGenesisBlock() {
        const genesisBlock = Block.createBlock(0, '', [genesisTransaction], this.publicKey);
        genesisBlock.hash = genesisBlock.computeHash();
        return genesisBlock;
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
                this.updateStakeMap(newBlock.transactions);
                return true;
            }
        }
        return false;
    }

    generateRawNextBlock(transactions, validator) {
        const previousBlock = this.getLatestBlock();
        const nextIndex = previousBlock.index + 1;
        const nextTimestamp = getCurrentTimestamp();
        const newBlock = new Block({
            index: nextIndex,
            previousHash: previousBlock.hash,
            timestamp: nextTimestamp,
            transactions: transactions,
            validator: validator,
        })
        newBlock.hash = newBlock.computeHash();
        if (this.addBlockToChain(newBlock)) {
            return newBlock;
        } else {
            return null;
        }
    }

    selectValidator() {
        const stakeMapClone = _.cloneDeep(this.stakeMap);
        if (Object.keys(stakeMapClone).length > 2) {
            // remove the headmaster account
            delete stakeMapClone[this.publicKey];
        }
        const totalStake = Object.values(stakeMapClone).reduce((acc, stake) => acc + stake, 0);
        const rand = Math.random() * totalStake;
        let sum = 0;
        for (let [validator, stake] of Object.entries(stakeMapClone)) {
            sum += stake;
            if (rand < sum) {
                return validator;
            }
        }
    }

    updateStakeMap(transactions) {
        transactions.forEach((tx, index) => {
            if (index === 0) {  // coinbase transaction
                this.stakeMap[tx.txOuts[0].address] += COINBASE_AMOUNT;
            }
            else {
                this.stakeMap[tx.txOuts[0].address] += tx.txOuts[0].amount;
                this.stakeMap[tx.txOuts[1].address] -= tx.txOuts[0].amount;
            }
        });
    }

    getMyStake(privateKey) {
        return this.stakeMap[Wallet.getPublicFromWallet(privateKey)];
    }

    getMyUnspentTransactionOutputs(privateKey) {
        return Wallet.findUnspentTxOuts(Wallet.getPublicFromWallet(privateKey), this.getUnspentTxOuts);
    }

    generateNextBlock(privateKey) {
        const validator = this.selectValidator();
        const coinbaseTx = Transaction.getCoinbaseTransaction(validator, this.getLatestBlock().index + 1);
        const blockData = [coinbaseTx].concat(TransactionPool.getTransactionPool());
        return this.generateRawNextBlock(blockData, validator);
    }

    generateNextBlockWithTransactions(privateKey, receiverAddress, amount) {
        if (!isValidAddress(receiverAddress)) {
            throw Error('invalid address');
        }
        if (typeof amount !== 'number') {
            throw Error('invalid amount');
        }
        if (this.stakeMap[receiverAddress] === undefined || this.stakeMap[receiverAddress] === null) {
            this.stakeMap[receiverAddress] = 0;
        }
        const validator = this.selectValidator();
        const coinbaseTx = Transaction.getCoinbaseTransaction(validator, this.getLatestBlock().index + 1);
        const tx = Wallet.createTransaction(receiverAddress, amount, privateKey, this.getUnspentTxOuts(), TransactionPool.getTransactionPool());
        const blockData = [coinbaseTx, tx];
        return this.generateRawNextBlock(blockData, validator);
    }

    getAccountBalance(privateKey) {
        return Wallet.getBalance(Wallet.getPublicFromWallet(privateKey), this.getUnspentTxOuts());
    }

    sendTransaction(privateKey, address, amount) {
        const tx = Wallet.createTransaction(address, amount, privateKey, this.getUnspentTxOuts(), TransactionPool.getTransactionPool());
        TransactionPool.addToTransactionPool(tx, this.getUnspentTxOuts());
        return tx;
    }

    replaceChain(newBlocks) {
        const aUnspentTxOuts = isValidChain(newBlocks);
        const validChain = aUnspentTxOuts !== null;
        if (validChain) {
            console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
            this.chain = newBlocks;
            this.unspentTxOuts = aUnspentTxOuts;
            TransactionPool.updateTransactionPool(this.unspentTxOuts);
        } else {
            console.log('Received blockchain invalid');
        }

    }

    getHistoryTransaction(privateKey) {
        const walletAddress = Wallet.getPublicFromWallet(privateKey);
        /// find the transactions that related to this wallet address
        const history = {
            receive: [],
            transfer: []
        };
        this.chain.forEach(block => {
            block.transactions.forEach(transaction => {
                const key = ec.keyFromPrivate(privateKey, 'hex');
                const txInSignature = toHexString(key.sign(transaction.id).toDER());
                if (transaction.txIns.find(txIn => txIn.signature === txInSignature)) {
                    history.transfer.push(transaction);
                }
                else {
                    if (transaction.txOuts.find(txOut => txOut.address === walletAddress)) {
                        history.receive.push(transaction);
                    }
                }
            });
        });
        history.receive = history.receive.slice(1);
        return history;
    }
}

/// SUPPORT FUNCTIONS ///
const toHexString = byteArray => Array.from(byteArray, byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');

const getCurrentTimestamp = () => Math.round(new Date().getTime() / 1000);

const isValidTimestamp = (newBlock, previousBlock) =>
    (previousBlock.timestamp - 60 < newBlock.timestamp) &&
    (newBlock.timestamp - 60 < getCurrentTimestamp());

const hasValidHash = (block) => {
    if (!Block.hashMatchesBlockContent(block)) {
        console.log('invalid hash, got:' + block.hash);
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
