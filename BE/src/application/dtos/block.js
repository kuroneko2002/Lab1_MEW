class Block {
  constructor({ index, previousHash, timestamp, transactions, hash, validator }) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;  // Array of Transaction
    this.hash = hash;
    this.validator = validator;
  }
}

module.exports = Block;
