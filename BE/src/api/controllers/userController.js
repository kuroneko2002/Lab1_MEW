const jwt = require('jsonwebtoken');

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
