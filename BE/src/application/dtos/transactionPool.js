const { Transaction } = require('./transaction');

class TransactionPool {
    constructor(transactions = []) {
        this.transactions = transactions.forEach((tx) => {
            return new Transaction(tx.id, tx.txIns, tx.txOuts);
        });
    }
}

module.exports = TransactionPool;
