const PointProcessor = require("./PointProcessor.js"),
    PointEnums = require("../../enums/PointEnums.js");

function loadBll(bllName) {
    "use strict";
    return require("../" + bllName.toLowerCase() + "/" + bllName + "Bll.js");
}

async function getAccountByBotUserId(params) {
    let account = await PointProcessor.GetAccountByUserId({
        BotUserId: params.BotUserId,
        PointType: PointEnums.PointType.General
    });
    if (!account) {
        account = await PointProcessor.UpdateUserAccount({
            BotUserId: params.BotUserId,
            PointType: PointEnums.PointType.General,
            Point: PointEnums.TransactionType.CreateUser.Point
        });
    }
    return account;
}

async function getRewardAccountByBotUserId(params) {
    let account = await PointProcessor.GetAccountByUserId({
        BotUserId: params.BotUserId,
        PointType: PointEnums.PointType.Reward
    });
    if (!account) {
        account = await PointProcessor.UpdateUserAccount({
            BotUserId: params.BotUserId,
            PointType: PointEnums.PointType.Reward,
            Point: 0
        });
    }
    return account;
}

async function ceatePointTransaction(params) {
    let account,
        transaction,
        transctionType = PointEnums.TransactionType[params.TransactionType];

    if (!transctionType) {
        throw `Not support transaction type: ${params.TransactionType}`
    }

    account = await getAccountByBotUserId({
        BotUserId: params.BotUserId
    });
    if (account.Balance + transctionType.Point * (params.Quantity || 1) < 0) {
        transaction = await PointProcessor.CreateTransaction({
            BotUserId: params.BotUserId,
            AccountId: account.btId,
            TransactionType: params.TransactionType,
            Balance: account.Balance,
            PointType: account.PointType,
            Quantity: params.Quantity || 1,
            Status: PointEnums.TransactionStatus.Failed,
            Point: transctionType.Point,
            ErrorMessage: PointEnums.ErrorMessage.NotEnoughPoint
        });
        return transaction
    }
    transaction = await PointProcessor.CreateTransaction({
        BotUserId: params.BotUserId,
        AccountId: account.btId,
        TransactionType: params.TransactionType,
        Balance: account.Balance,
        PointType: account.PointType,
        Quantity: params.Quantity || 1,
        Status: PointEnums.TransactionStatus.Complete,
        Point: transctionType.Point
    });
    account = await PointProcessor.UpdateUserAccount({
        BotUserId: params.BotUserId,
        PointType: PointEnums.PointType.General,
        Point: transctionType.Point * (params.Quantity || 1) 
    });
    if (transctionType.MethodName && transctionType.ServiceName) {
        loadBll(transctionType.ServiceName)[transctionType.MethodName](params);
    }
    return {
        ...transaction,
        AccountBalance: account.Balance
    };
};

async function ceateRewardTransaction(params) {
    let account,
        transaction,
        transctionType = PointEnums.TransactionType[params.TransactionType];

    if (!transctionType) {
        throw `Not support transaction type: ${params.TransactionType}`
    }

    if (!transctionType.Reward) {
        return;
    }
    account = await getRewardAccountByBotUserId({
        BotUserId: params.BotUserId
    });
    if (account.Balance + transctionType.Reward * (params.Quantity || 1) < 0) {
        transaction = await PointProcessor.CreateTransaction({
            BotUserId: params.BotUserId,
            AccountId: account.btId,
            TransactionType: params.TransactionType,
            Balance: account.Balance,
            PointType: account.PointType,
            Quantity: params.Quantity || 1,
            Status: PointEnums.TransactionStatus.Failed,
            Point: transctionType.Reward,
            ErrorMessage: PointEnums.ErrorMessage.NotEnoughPoint
        });
        return transaction
    }
    transaction = await PointProcessor.CreateTransaction({
        BotUserId: params.BotUserId,
        AccountId: account.btId,
        TransactionType: params.TransactionType,
        Balance: account.Balance,
        PointType: account.PointType,
        Quantity: params.Quantity || 1,
        Status: PointEnums.TransactionStatus.Complete,
        Point: transctionType.Reward
    });
    account = await PointProcessor.UpdateUserAccount({
        BotUserId: params.BotUserId,
        PointType: PointEnums.PointType.Reward,
        Point: transctionType.Reward * (params.Quantity || 1) 
    });
    return {
        ...transaction,
        AccountBalance: account.Balance
    };
};

async function checkPoint(params) {
    let account = await getAccountByBotUserId({
            BotUserId: params.BotUserId
        }),
        transctionType = PointEnums.TransactionType[params.TransactionType];
    
    if (!transctionType) {
        return {PointEnough: true};
    }
    return {
        PointEnough: account.Balance + transctionType.Point * (params.Quantity || 1) >= 0,
        Balance: account.Balance
    };
}

module.exports = {
    CeatePointTransaction: ceatePointTransaction,
    CheckPoint: checkPoint,
    GetAccountByBotUserId: getAccountByBotUserId,
    GetRewardAccountByBotUserId: getRewardAccountByBotUserId,
    CeateRewardTransaction: ceateRewardTransaction
}