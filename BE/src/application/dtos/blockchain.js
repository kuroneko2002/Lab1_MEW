const Block = require('./block');
const { UnspentTxOut } = require('./transaction');

class Blockchain {
    constructor(chain, unspentTxOuts) {
        this.chain = chain.forEach((block) => {
            return new Block(block.index, block.previousHash, block.timestamp, block.transactions, block.hash, block.difficulty, block.nonce);
        });
        this.unspentTxOuts = unspentTxOuts.forEach((unspentTxOut) => {
            return new UnspentTxOut(unspentTxOut.txOutId, unspentTxOut.txOutIndex, unspentTxOut.address, unspentTxOut.amount);
        });
    }
}

module.exports = Blockchain;
