const crypto = require('crypto');
const defaultDifficulty = 2;

class Block {
  constructor({ index, previousHash, timestamp, transactions, hash, difficulty, nonce = 0 }) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;  // Array of Transaction
    this.hash = hash;
    this.difficulty = difficulty;
    this.nonce = nonce;
  }

  static createBlock(index, previousHash, transactions, difficulty) {
    return new Block({
      index,
      previousHash,
      timestamp: Date.now(),
      transactions,
      hash: null,
      difficulty: difficulty || defaultDifficulty,
    });
  }

  computeHash() {
    return crypto.createHash('sha256')
                 .update(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.difficulty + this.nonce)
                 .digest('hex');
  }

  mineBlock() {
    this.hash = this.computeHash();
    while (!this.hash.startsWith('0'.repeat(this.difficulty))) {
      this.nonce++;
      this.hash = this.computeHash();
    }
  }
}

module.exports = Block;
