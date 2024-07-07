# ADD .ENV FILE AND MODIFY CONSTANT

```
./src/utils/const.js
```

# START SERVER

```
npm i
npm start
```

# APIs

### Register a wallet

[POST]
```
http://localhost:3000/user/register
```

### Login with private key

[POST]
```
http://localhost:3000/user/login
body: {
    "privateKey" : "abc"
}
```

### Get balance of wallet

[POST]
```
http://localhost:3000/user/balance
body: {
    "privateKey" : "abc"
}
```

### Send an amount to other wallet

[POST]
```
http://localhost:3000/user/send
body: {
    "privateKey" : "abc",
    "receiverAddress": "xyz",
    "amount": 100
}
```

### Get history of transactions

[POST]
```
http://localhost:3000/user/history
body: {
    "privateKey" : "abc"
}
```

### Get the blockchain

[GET]
```
http://localhost:3000/user/blockchain
```
