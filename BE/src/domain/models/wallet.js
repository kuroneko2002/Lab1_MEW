const { ec } = require('elliptic');
const fs = require('fs');
const _ = require('lodash');
const { getPublicKey, Transaction, TxIn, TxOut } = require('./transaction');

const EC = new ec('secp256k1');

class Wallet {
    static getPublicFromWallet(privateKey) {
        const key = EC.keyFromPrivate(privateKey, 'hex');
        return key.getPublic().encode('hex');
    };

    static generatePrivateKey() {
        const keyPair = EC.genKeyPair();
        const privateKey = keyPair.getPrivate();
        return privateKey.toString(16);
    };

    static initWallet(blockchain) {
        const newPrivateKey = this.generatePrivateKey();
        blockchain.generateNextBlockWithTransactions(blockchain.privateKey, this.getPublicFromWallet(newPrivateKey), 10000);
        return newPrivateKey;
    };

    static getBalance(address, unspentTxOuts) {
        return _(this.findUnspentTxOuts(address, unspentTxOuts))
            .map((uTxO) => uTxO.amount)
            .sum();
    };

    static findUnspentTxOuts(ownerAddress, unspentTxOuts) {
        return _.filter(unspentTxOuts, (uTxO) => uTxO.address === ownerAddress);
    };

    static createTransaction(receiverAddress, amount, privateKey, unspentTxOuts, txPool) {

        console.log('txPool: %s', JSON.stringify(txPool));
        const myAddress = getPublicKey(privateKey);
        const myUnspentTxOutsA = unspentTxOuts.filter((uTxO) => uTxO.address === myAddress);
        const myUnspentTxOuts = filterTxPoolTxs(myUnspentTxOutsA, txPool);

        // filter from unspentOutputs such inputs that are referenced in pool
        const { includedUnspentTxOuts, leftOverAmount } = findTxOutsForAmount(amount, myUnspentTxOuts);

        const toUnsignedTxIn = (unspentTxOut) => {
            const txIn = new TxIn();
            txIn.txOutId = unspentTxOut.txOutId;
            txIn.txOutIndex = unspentTxOut.txOutIndex;
            return txIn;
        };

        const unsignedTxIns = includedUnspentTxOuts.map(toUnsignedTxIn);

        const tx = new Transaction();
        tx.txIns = unsignedTxIns;
        tx.txOuts = createTxOuts(receiverAddress, myAddress, amount, leftOverAmount);
        tx.id = tx.getTransactionId();

        tx.txIns = tx.txIns.map((txIn, index) => {
            txIn.signature = Transaction.signTxIn(tx, index, privateKey, unspentTxOuts);
            return txIn;
        });

        return tx;
    };
}

/// SUPPORT FUNCTIONS
const findTxOutsForAmount = (amount, myUnspentTxOuts) => {
    let currentAmount = 0;
    const includedUnspentTxOuts = [];
    for (const myUnspentTxOut of myUnspentTxOuts) {
        includedUnspentTxOuts.push(myUnspentTxOut);
        currentAmount = currentAmount + myUnspentTxOut.amount;
        if (currentAmount >= amount) {
            const leftOverAmount = currentAmount - amount;
            return { includedUnspentTxOuts, leftOverAmount };
        }
    }

    const eMsg = 'Cannot create transaction from the available unspent transaction outputs.' +
        ' Required amount:' + amount + '. Available unspentTxOuts:' + JSON.stringify(myUnspentTxOuts);
    throw Error(eMsg);
};

const createTxOuts = (receiverAddress, myAddress, amount, leftOverAmount) => {
    const txOut1 = new TxOut(receiverAddress, amount);
    if (leftOverAmount === 0) {
        return [txOut1];
    } else {
        const leftOverTx = new TxOut(myAddress, leftOverAmount);
        return [txOut1, leftOverTx];
    }
};

const filterTxPoolTxs = (unspentTxOuts, transactionPool) => {
    const txIns = _(transactionPool)
        .map((tx) => tx.txIns)
        .flatten()
        .value();
    const removable = [];
    for (const unspentTxOut of unspentTxOuts) {
        const txIn = _.find(txIns, (aTxIn) => {
            return aTxIn.txOutIndex === unspentTxOut.txOutIndex && aTxIn.txOutId === unspentTxOut.txOutId;
        });

        if (txIn === undefined) {

        } else {
            removable.push(unspentTxOut);
        }
    }

    return _.without(unspentTxOuts, ...removable);
};
/// END SUPPORT FUNCTIONS

module.exports = Wallet;
