class Block {
  constructor({index, previousHash, timestamp, transactions, hash, difficulty, nonce = 0}) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = JSON.parse(JSON.stringify(transactions));
    this.hash = hash;
    this.difficulty = difficulty;
    this.nonce = nonce;
  }
}

module.exports = Block;
