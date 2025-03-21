let UserProcessor = require("./UserProcessor.js"),
    ConstantEnums = require('../../enums/ConstantEnums.js'),
    paramHelper = require("../../helpers/paramHelper");

async function checkAndSaveUser(botUser) {
    await UserProcessor.UpsertUser({
        BotUserId: botUser.id,
        IsBot: botUser.is_bot,
        FirstName: botUser.first_name,
        LastName: botUser.last_name,
        LanguageCode: botUser.language_code
    });
}

async function checkIn(params) {
    let user = await UserProcessor.GetUserByBotUserId({BotUserId: params.BotUserId}),
        dateNow = Date.now(),
        lastCheckInDayEnd,
        nextDayEnd;
    if (!user) {
        return;
    }
    if (!user.LastCheckInDate) {
        return await UserProcessor.CheckIn({
            BotUserId: params.BotUserId,
            LastCheckInDate: dateNow,
            ContinuousCheckIn: 1
        });
    }
    lastCheckInDayEnd = paramHelper.getDayStart({TimeStamp: user.LastCheckInDate, DayBefore: -1});
    nextDayEnd = lastCheckInDayEnd + ConstantEnums.MILLI_SECONDS_PER_DAY;
    if (dateNow <= lastCheckInDayEnd) {
        return await UserProcessor.CheckIn({
            BotUserId: params.BotUserId,
            LastCheckInDate: dateNow,
            ContinuousCheckIn: user.ContinuousCheckIn
        });
    }
    if (dateNow > lastCheckInDayEnd && dateNow <= nextDayEnd) {
        return await UserProcessor.CheckIn({
            BotUserId: params.BotUserId,
            LastCheckInDate: dateNow,
            ContinuousCheckIn: user.ContinuousCheckIn + 1
        });
    } 
    return await UserProcessor.CheckIn({
        BotUserId: params.BotUserId,
        LastCheckInDate: dateNow,
        ContinuousCheckIn: 1
    });
}

async function getCheckIn(params) {
    let user = await UserProcessor.GetUserByBotUserId({BotUserId: params.BotUserId}),
        todayCheckIn = false,
        dayStart,
        dayEnd;

    dayStart = paramHelper.getDayStart({TimeStamp: Date.now()});
    dayEnd = dayStart + ConstantEnums.MILLI_SECONDS_PER_DAY;
    if (user.LastCheckInDate && user.LastCheckInDate <= dayEnd && user.LastCheckInDate >= dayStart) {
        todayCheckIn = true;
    }
    return {
        TodayCheckIn: todayCheckIn,
        ContinuousCheckIn: user.ContinuousCheckIn || 0
    }
}

module.exports = {
    CheckAndSaveUser: checkAndSaveUser,
    CheckIn: checkIn,
    GetUserByBotUserId: UserProcessor.GetUserByBotUserId,
    GetCheckIn: getCheckIn,
    GetBotUsers: UserProcessor.GetBotUsers
};