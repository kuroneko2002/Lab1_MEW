const _ = require('lodash');
const { Transaction } = require('./transaction');

class TransactionPool {
    static transactionPool = [];

    static getTransactionPool() {
        return _.cloneDeep(this.transactionPool);
    }

    static addToTransactionPool(tx, unspentTxOuts) {
        if (!Transaction.validateTransaction(tx, unspentTxOuts)) {
            throw new Error('Trying to add invalid tx to pool');
        }

        if (!isValidTxForPool(tx, this.transactionPool)) {
            throw new Error('Trying to add invalid tx to pool');
        }
        console.log('adding to txPool: %s', JSON.stringify(tx));
        this.transactionPool.push(tx);
    }

    static updateTransactionPool(unspentTxOuts) {
        const invalidTxs = [];
        for (const tx of this.transactionPool) {
            for (const txIn of tx.txIns) {
                if (!hasTxIn(txIn, unspentTxOuts)) {
                    invalidTxs.push(tx);
                    break;
                }
            }
        }
        if (invalidTxs.length > 0) {
            console.log('removing the following transactions from txPool: %s', JSON.stringify(invalidTxs));
            this.transactionPool = _.without(this.transactionPool, ...invalidTxs);
        }
    }
}

/// SUPPORTED FUNCTIONS
const hasTxIn = (txIn, unspentTxOuts) => {
    const foundTxIn = unspentTxOuts.find((uTxO) => {
        return uTxO.txOutId === txIn.txOutId && uTxO.txOutIndex === txIn.txOutIndex;
    });
    return foundTxIn !== undefined;
}

const getTxPoolIns = (aTransactionPool) => {
    return _(aTransactionPool)
        .map((tx) => tx.txIns)
        .flatten()
        .value();
}

const isValidTxForPool = (tx, aTransactionPool) => {
    const _txPoolIns = getTxPoolIns(aTransactionPool);

    const containsTxIn = (txPoolIns, txIn) => {
        return _.find(txPoolIns, ((txPoolIn) => {
            return txIn.txOutIndex === txPoolIn.txOutIndex && txIn.txOutId === txPoolIn.txOutId;
        }));
    };

    for (const txIn of tx.txIns) {
        if (containsTxIn(_txPoolIns, txIn)) {
            console.log('txIn already found in the txPool');
            return false;
        }
    }
    return true;
}
/// END SUPPORTED FUNCTIONS

module.exports = TransactionPool;