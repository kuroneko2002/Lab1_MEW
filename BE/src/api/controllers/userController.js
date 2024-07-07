const { SetResponse } = require('../../utils/success-response');
const { STATUS_CODES } = require('../../utils/app-errors');
const BlockchainService = require('../../application/services');

const bcService = new BlockchainService();

function register(req, res) {
    const privateKey = bcService.register();
    SetResponse(res, STATUS_CODES.OK, privateKey, "Create new wallet successfully!", null);
}

function login(req, res) {
    try {
        const privateKey = req.body.privateKey;
        const walletAddress = bcService.login(privateKey);
        if (walletAddress === null) {
            SetResponse(res, STATUS_CODES.UNAUTHORIZED, null, "Login failed!", null);
            return;
        }
        SetResponse(res, STATUS_CODES.OK, walletAddress, "Login successfully!", null);
    } catch (error) {
        SetResponse(res, STATUS_CODES.INTERNAL_SERVER_ERROR, null, "Login failed!", null);

    }
}

function getBalance(req, res) {
    const balance = bcService.getBalance(req.body.privateKey);
    SetResponse(res, STATUS_CODES.OK, balance, "Get balance successfully!", null);
}

function transfer(req, res) {
    try {
        const { privateKey, receiverAddress, amount } = req.body;
        const transferBlock = bcService.transfer(privateKey, receiverAddress, amount);
        if (transferBlock === null) {
            SetResponse(res, STATUS_CODES.BAD_REQUEST, null, "Transfer failed!", null);
            return;
        }
        SetResponse(res, STATUS_CODES.OK, transferBlock, "Transfer successfully!", null);
    } catch (error) {
        SetResponse(res, STATUS_CODES.BAD_REQUEST, null, "Transfer failed: " + error.message, null);
    }
}

function historyTransaction(req, res) {
    const history = bcService.historyTransaction(req.body.privateKey);
    SetResponse(res, STATUS_CODES.OK, history, "Get history transaction successfully!", null);
}

function getBlockchain(req, res) {
    const chain = bcService.getBlockchain();
    SetResponse(res, STATUS_CODES.OK, chain, "Get blockchain successfully!", null);
}

const userController = {
    register,
    login,
    getBalance,
    transfer,
    historyTransaction,
    getBlockchain
};

module.exports = userController;
