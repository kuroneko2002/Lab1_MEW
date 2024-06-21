const { Transaction, TxIn, TxOut, UnspentTxOut } = require('./transaction');

module.exports = {
    BlockDTO: require('./block'),
    WalletDTO: require('./wallet'),
    BlockchainDTO: require('./blockchain'),
    TransactionDTO: Transaction,
    TxInDTO: TxIn,
    TxOutDTO: TxOut,
}
