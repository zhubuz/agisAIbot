/*jslint node:true*/
let SchemaPack = require("../../framework/SchemaPack.js"),
    PointEnums = require("../../enums/PointEnums.js"),
    guid = require('uuid');

async function updateAndGetAccount(params) {
    'use strict';
    let account = await SchemaPack.PointAccount.findOneAndUpdate({
        BotUserId: params.BotUserId,
        Status: PointEnums.AccountStatus.Active,
        PointType: params.PointType
    }, {
        $inc: {
            Balance: params.Point || 0
        },
        $setOnInsert: {
            btId: guid.v1(),
            BotUserId: params.BotUserId,
            Status: PointEnums.AccountStatus.Active,
            PointType: params.PointType
        }
    }, {
        upsert: true,
        new: true
    }).exec();
    return account;
}

async function getAccountByUserId(params) {
    'use strict';
    let account = await SchemaPack.PointAccount.findOne({
        BotUserId: params.BotUserId,
        Status: PointEnums.AccountStatus.Active,
        PointType: params.PointType
    });
    return account;
}

async function createTransaction(params) {
    let transaction = new SchemaPack.Transaction({
        btId: guid.v1(),
        BotUserId: params.BotUserId,
        AccountId: params.AccountId,
        Type: params.TransactionType,
        PointType: params.PointType,
        Balance: params.Balance,
        Point: params.Point,
        Status: PointEnums.TransactionStatus.Complete,
        Quantity: params.Quantity
    });
    await transaction.save();
    return transaction.toObject();
}

module.exports = {
    UpdateUserAccount: updateAndGetAccount,
    GetAccountByUserId: getAccountByUserId,
    CreateTransaction: createTransaction
};
