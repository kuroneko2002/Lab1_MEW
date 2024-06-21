const CryptoJS = require('crypto-js');
const { ec: EC } = require('elliptic');
const _ = require('lodash');
const isValidAddress = require('../../utils/is-valid-address');
const getPublicKey = require('../../utils/get-public');

const ec = new EC('secp256k1');
const { COINBASE_AMOUNT } = require('../../utils/const');;

class UnspentTxOut {
    constructor(txOutId, txOutIndex, address, amount) {
        this.txOutId = txOutId;
        this.txOutIndex = txOutIndex;
        this.address = address;
        this.amount = amount;
    }
}

class TxIn {
    constructor(txOutId, txOutIndex, signature) {
        this.txOutId = txOutId;
        this.txOutIndex = txOutIndex;
        this.signature = signature;
    }
}

class TxOut {
    constructor(address, amount) {
        this.address = address;
        this.amount = amount;
    }
}

class Transaction {
    constructor(id, txIns, txOuts) {
        this.id = id;
        this.txIns = txIns;
        this.txOuts = txOuts;
    }

    getTransactionId() {
        const txInContent = this.txIns.map(txIn => txIn.txOutId + txIn.txOutIndex).reduce((a, b) => a + b, '');
        const txOutContent = this.txOuts.map(txOut => txOut.address + txOut.amount).reduce((a, b) => a + b, '');
        return CryptoJS.SHA256(txInContent + txOutContent).toString();
    }

    static getTransactionId(transaction) {
        const txInContent = transaction.txIns.map(txIn => txIn.txOutId + txIn.txOutIndex).reduce((a, b) => a + b, '');
        const txOutContent = transaction.txOuts.map(txOut => txOut.address + txOut.amount).reduce((a, b) => a + b, '');
        return CryptoJS.SHA256(txInContent + txOutContent).toString();
    }

    static validateTransaction(transaction, aUnspentTxOuts) {
        if (!isValidTransactionStructure(transaction)) return false;

        if (transaction.getTransactionId() !== transaction.id) {
            console.log(`Invalid tx id: ${transaction.id}`);
            return false;
        }

        const hasValidTxIns = transaction.txIns.every(txIn => validateTxIn(txIn, transaction, aUnspentTxOuts));
        if (!hasValidTxIns) {
            console.log(`Some of the txIns are invalid in tx: ${transaction.id}`);
            return false;
        }

        const totalTxInValues = transaction.txIns
            .map(txIn => getTxInAmount(txIn, aUnspentTxOuts))
            .reduce((a, b) => a + b, 0);

        const totalTxOutValues = transaction.txOuts
            .map(txOut => txOut.amount)
            .reduce((a, b) => a + b, 0);

        if (totalTxOutValues !== totalTxInValues) {
            console.log(`totalTxOutValues !== totalTxInValues in tx: ${transaction.id}`);
            return false;
        }

        return true;
    }

    static getCoinbaseTransaction(address, blockIndex) {
        const txIn = new TxIn('', blockIndex, '');
        const txOut = new TxOut(address, COINBASE_AMOUNT);
        const t = new Transaction('', [txIn], [txOut]);
        t.id = t.getTransactionId();
        return t;
    }

    static signTxIn(transaction, txInIndex, privateKey, aUnspentTxOuts) {
        const txIn = transaction.txIns[txInIndex];
        const dataToSign = transaction.id;
        const referencedUnspentTxOut = findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts);

        if (!referencedUnspentTxOut) {
            console.log('Could not find referenced txOut');
            throw new Error();
        }

        const referencedAddress = referencedUnspentTxOut.address;
        if (getPublicKey(privateKey) !== referencedAddress) {
            console.log('Trying to sign an input with private key that does not match the address that is referenced in txIn');
            throw new Error();
        }

        const key = ec.keyFromPrivate(privateKey, 'hex');
        return toHexString(key.sign(dataToSign).toDER());
    };

    static processTransactions(aTransactions, aUnspentTxOuts, blockIndex) {
        if (!validateBlockTransactions(aTransactions, aUnspentTxOuts, blockIndex)) {
            console.log('Invalid block transactions');
            return null;
        }
        return updateUnspentTxOuts(aTransactions, aUnspentTxOuts);
    };
}

/// SUPPORT FUNCTIONS ///
const toHexString = byteArray => Array.from(byteArray, byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');

const findUnspentTxOut = (transactionId, index, aUnspentTxOuts) => aUnspentTxOuts.find(uTxO => uTxO.txOutId === transactionId && uTxO.txOutIndex === index);

const isValidTxOutStructure = (txOut) => {
    if (!txOut) {
        console.log('txOut is null');
        return false;
    } else if (typeof txOut.address !== 'string') {
        console.log('Invalid address type in txOut');
        return false;
    } else if (!isValidAddress(txOut.address)) {
        console.log('Invalid TxOut address');
        return false;
    } else if (typeof txOut.amount !== 'number') {
        console.log('Invalid amount type in txOut');
        return false;
    } else {
        return true;
    }
};

const isValidTxInStructure = (txIn) => {
    if (!txIn) {
        console.log('txIn is null');
        return false;
    } else if (typeof txIn.signature !== 'string') {
        console.log('Invalid signature type in txIn');
        return false;
    } else if (typeof txIn.txOutId !== 'string') {
        console.log('Invalid txOutId type in txIn');
        return false;
    } else if (typeof txIn.txOutIndex !== 'number') {
        console.log('Invalid txOutIndex type in txIn');
        return false;
    } else {
        return true;
    }
};

const isValidTransactionStructure = (transaction) => {
    if (typeof transaction.id !== 'string') {
        console.log('Invalid transaction id type');
        return false;
    }

    if (!Array.isArray(transaction.txIns)) {
        console.log('Invalid txIns type in transaction');
        return false;
    }

    if (!transaction.txIns.every(isValidTxInStructure)) {
        return false;
    }

    if (!Array.isArray(transaction.txOuts)) {
        console.log('Invalid txOuts type in transaction');
        return false;
    }

    if (!transaction.txOuts.every(isValidTxOutStructure)) {
        return false;
    }

    return true;
};

const hasDuplicates = (txIns) => {
    const groups = _.countBy(txIns, txIn => txIn.txOutId + txIn.txOutIndex);
    return Object.values(groups).some(value => value > 1);
};

const validateCoinbaseTx = (transaction, blockIndex) => {
    if (!transaction) {
        console.log('The first transaction in the block must be coinbase transaction');
        return false;
    }

    if (Transaction.getTransactionId(transaction) !== transaction.id) {
        console.log(`Invalid coinbase tx id: ${transaction.id}`);
        return false;
    }

    if (transaction.txIns.length !== 1) {
        console.log('One txIn must be specified in the coinbase transaction');
        return false;
    }

    if (transaction.txIns[0].txOutIndex !== blockIndex) {
        console.log('The txIn signature in coinbase tx must be the block height');
        return false;
    }

    if (transaction.txOuts.length !== 1) {
        console.log('Invalid number of txOuts in coinbase transaction');
        return false;
    }

    if (transaction.txOuts[0].amount !== COINBASE_AMOUNT) {
        console.log('Invalid coinbase amount in coinbase transaction');
        return false;
    }

    return true;
};

const validateBlockTransactions = (aTransactions, aUnspentTxOuts, blockIndex) => {
    const coinbaseTx = aTransactions[0];
    if (blockIndex !== 0 && !validateCoinbaseTx(coinbaseTx, blockIndex)) {
        console.log(`Invalid coinbase transaction: ${JSON.stringify(coinbaseTx)}`);
        return false;
    }

    const txIns = _.flatten(aTransactions.map(tx => tx.txIns));
    if (hasDuplicates(txIns)) return false;

    const normalTransactions = aTransactions.slice(1);
    return normalTransactions.every(tx => Transaction.validateTransaction(tx, aUnspentTxOuts));
};

const validateTxIn = (txIn, transaction, aUnspentTxOuts) => {
    const referencedUTxOut = aUnspentTxOuts.find(uTxO => uTxO.txOutId === txIn.txOutId && uTxO.txOutIndex === txIn.txOutIndex);
    if (!referencedUTxOut) {
        console.log(`Referenced txOut not found: ${JSON.stringify(txIn)}`);
        return false;
    }

    const address = referencedUTxOut.address;
    const key = ec.keyFromPublic(address, 'hex');
    const validSignature = key.verify(transaction.id, txIn.signature);

    if (!validSignature) {
        console.log(`Invalid txIn signature: ${txIn.signature} txId: ${transaction.id} address: ${referencedUTxOut.address}`);
        return false;
    }

    return true;
};

const getTxInAmount = (txIn, aUnspentTxOuts) => findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts).amount;

const updateUnspentTxOuts = (aTransactions, aUnspentTxOuts) => {
    const newUnspentTxOuts = _.flatten(aTransactions.map(t =>
        t.txOuts.map((txOut, index) => new UnspentTxOut(t.id, index, txOut.address, txOut.amount))
    ));

    const consumedTxOuts = _.flatten(aTransactions.map(t => t.txIns))
        .map(txIn => new UnspentTxOut(txIn.txOutId, txIn.txOutIndex, '', 0));

    return aUnspentTxOuts
        .filter(uTxO => !findUnspentTxOut(uTxO.txOutId, uTxO.txOutIndex, consumedTxOuts))
        .concat(newUnspentTxOuts);
};
/// END SUPPORT FUNCTIONS ///
module.exports = {
    UnspentTxOut,
    TxIn,
    TxOut,
    Transaction
};
