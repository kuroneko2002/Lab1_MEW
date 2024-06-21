class UnspentTxOut {
    constructor(txOutId, txOutIndex, address, amount) {
        this.txOutId = txOutId;
        this.txOutIndex = txOutIndex;
        this.address = address;
        this.amount = amount;
    }
}

class Transaction {
    constructor(id, txIns, txOuts) {
        this.id = id;
        this.txIns = JSON.parse(JSON.stringify(txIns));
        this.txOuts = JSON.parse(JSON.stringify(txOuts));
    }
}

module.exports = {
    UnspentTxOut,
    Transaction,
};
