class Wallet {
    constructor({ privateKey, publicKey }) {
        this.privateKey = privateKey;
        this.publicKey = publicKey;
    }
}

module.exports = Wallet;
