module.exports = isValidAddress = (address) => {
    if (address.length !== 130) {
        console.log('Invalid public key length');
        return false;
    } else if (address.match('^[a-fA-F0-9]+$') === null) {
        console.log('Public key must contain only hex characters');
        return false;
    } else if (!address.startsWith('04')) {
        console.log('Public key must start with 04');
        return false;
    } else {
        return true;
    }
};
