/*jslint node:true*/
let BotSchema = require('../../framework/BotSchema.js'),
    PointEnums = require("../../enums/PointEnums.js"),
    ConstantEnums = require('../../enums/ConstantEnums.js'),
    DbConnections = require('../../framework/DbConnections.js'),
    props = {
        BotUserId: {type: String},
        Balance: {type: Number, default: 0},
        Status: {type: String, enum: Object.keys(PointEnums.AccountStatus)},
        PointType: {type: String, enum: Object.keys(PointEnums.PointType)}
    },
    transactionProps = {
        BotUserId: {type: String},
        AccountId: {type: String}, //btId of PointAccount
        Type: {type: String, enum: Object.keys(PointEnums.TransactionType)},
        PointType: {type: String, enum: Object.keys(PointEnums.PointType)},
        Balance: {type: Number, default: 0},
        ErrorMessage: {type: String},
        Point: {type: Number},
        Status: {type: String, enum: Object.keys(PointEnums.TransactionStatus)},
        DateBucket: {type: String},
        Quantity: {type: Number},
        SourceFiles: [{
            Type: String,
            Url: String
        }],
        OutputFiles: [{
            Type: String,
            Url: String
        }]
    },
    PointAccount = new BotSchema(props),
    Transaction = new BotSchema(transactionProps);
exports.PointAccount = DbConnections.quantum_common.model('PointAccount', PointAccount, 'PointAccount');
exports.Transaction = DbConnections.quantum_common.model('Transaction', Transaction, 'Transaction');