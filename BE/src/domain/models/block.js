const CryptoJS = require('crypto-js');
const hexToBinary = require('../../utils/hexToBinary');

const { defaultDifficulty } = require('../../utils/const');;

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
      timestamp: Math.round(new Date().getTime() / 1000),
      transactions,
      hash: null,
      difficulty: difficulty || defaultDifficulty,
    });
  }

  computeHash() {
    return CryptoJS.SHA256(this.index + this.previousHash + this.timestamp + this.transactions + this.difficulty + this.nonce).toString();
  }

  static calculateHash(index, previousHash, timestamp, transactions, difficulty, nonce) {
    return CryptoJS.SHA256(index + previousHash + timestamp + transactions + difficulty + nonce).toString();
  }

  static hashMatchesDifficulty(hash, difficulty) {
    const hashInBinary = hexToBinary(hash);
    const requiredPrefix = '0'.repeat(difficulty);
    return hashInBinary.startsWith(requiredPrefix);
  }

  static isValidBlockStructure(block) {
    return typeof block.index === 'number' &&
      typeof block.hash === 'string' &&
      typeof block.previousHash === 'string' &&
      typeof block.timestamp === 'number' &&
      Array.isArray(block.transactions);
  }

  static hashMatchesBlockContent(block) {
    const blockHash = block.computeHash();
    return blockHash === block.hash;
  }

}

module.exports = Block;
