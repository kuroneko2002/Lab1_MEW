const { ec } = require('elliptic');
const EC = new ec('secp256k1');

module.exports = getPublic = (privateKey) => {
    const key = EC.keyFromPrivate(privateKey, 'hex');
    return key.getPublic().encode('hex');
};