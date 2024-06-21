const jwt = require('jsonwebtoken');
const Blockchain = require('../../domain/models/blockchain');
const Wallet = require('../../domain/models/wallet');

const newBlockchain = new Blockchain();
console.log("start send transaction");
const walletSecret1 = Wallet.initWallet(newBlockchain);
const walletAddress1 = Wallet.getPublicFromWallet(walletSecret1);
//console.log("walletAddress1:", walletAddress1);

const walletSecret2 = Wallet.initWallet(newBlockchain);
const walletAddress2 = Wallet.getPublicFromWallet(walletSecret2);
//console.log("walletAddress2:", walletAddress2);

newBlockchain.generateNextBlockWithTransactions(walletSecret1, walletAddress2, 1000);

console.log(Wallet.getBalance(newBlockchain.publicKey, newBlockchain.unspentTxOuts));
console.log(Wallet.getBalance(walletAddress1, newBlockchain.unspentTxOuts));
console.log(Wallet.getBalance(walletAddress2, newBlockchain.unspentTxOuts));

class User {
    constructor(username, password) {
        this.username = username;
        this.password = User.hashPassword(password);
    }

    static hashPassword(password) {
        return password;
    }

    static validatePassword(user, password) {
        return user.password === password;
    }
    
}

const secretKey = 'TNH_BLOCKCHAIN_LAB';

const users = [];
function register(req, res) {
    const { username, password } = req.body;
    if (users.find(user => user.username === username)) {
        return res.status(400).send('User already exists');
    }

    const user = new User(username, password);
    users.push(user);
    res.status(201).send('User registered successfully');
}

function login(req, res) {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username);

    if (!user || !User.validatePassword(user, password)) {
        return res.status(401).send('Invalid username or password');
    }

    const accessToken = jwt.sign({ username: user.username }, secretKey);
    res.json({ accessToken });
}

const userController = {
    register,
    login,
};

module.exports = userController;
