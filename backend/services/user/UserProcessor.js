let SchemaPack = require("../../framework/SchemaPack.js"),
    guid = require('uuid');

async function upsertUser(params) {
    let user = await SchemaPack.User.findOneAndUpdate({
        BotUserId: params.BotUserId
    }, {
        $set: {
            IsBot: params.IsBot,
            FirstName: params.FirstName,
            LastName: params.LastName,
            UserName: params.UserName,
            LanguageCode: params.LanguageCode
        },
        $setOnInsert: {
            btId: guid.v1(),
            BotUserId: params.BotUserId
        }
    }, {
        upsert: true,
        new: true
    });
    return user;
}

async function checkIn(params) {
    let user = await SchemaPack.User.findOneAndUpdate({
        BotUserId: params.BotUserId
    }, {
        $set: {
            LastCheckInDate: params.LastCheckInDate,
            ContinuousCheckIn: params.ContinuousCheckIn
        }
    }, {
        new: true
    });
    return user;
}

async function getUserByBotUserId(params) {
    let user = await SchemaPack.User.findOneAndUpdate({
        BotUserId: params.BotUserId
    });
    return user;
}

async function getBotUsers() {
    let user = await SchemaPack.User.find({
        BotUserId: {$exists: true},
        IsBot: false
    });
    return user;
}

module.exports = {
    UpsertUser: upsertUser,
    GetUserByBotUserId: getUserByBotUserId,
    CheckIn: checkIn,
    GetBotUsers: getBotUsers
};