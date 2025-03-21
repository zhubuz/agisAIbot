/*jslint node:true*/
let SchemaPack = require("../../framework/SchemaPack.js"),
    ActivityEnums = require("../../enums/ActivityEnums.js"),
    guid = require('uuid');

async function createActivity(params) {
    let activity = new SchemaPack.ChatActivity({
        btId: guid.v1(),
        Type: params.Type,
        Module: params.Module,
        BotUserId: params.BotUserId,
        TransactionType: params.TransactionType,
        ChatInstance: params.ChatInstance
    });
    await activity.save();
    return activity.toObject();
}

async function updateChatActivity(params) {
    let condition = {
        BotUserId: params.BotUserId,
        Status: ActivityEnums.Status.Pending
    },
    setObj = {},
    updatedFields = [
        "Step",
        "VideoUrl",
        "ImageUrl",
        "ResultUrl",
        "Prompt",
        "Status",
        "ErrorMessage"
    ];
    if (params.ActivityId) {
        condition = {btId: params.ActivityId};
    }
    if (params.ChatInstance) {
        condition.ChatInstance = params.ChatInstance;
    }
    updatedFields.forEach((updatedField) => {
        if (params[updatedField]) {
            setObj[updatedField] = params[updatedField];
        }
    });
    return await SchemaPack.ChatActivity.findOneAndUpdate(condition, {
        $set: setObj
    }, {
        new: true
    }).exec();
}

async function cancelPendingActivity(params) {
    let query = {
        BotUserId: params.BotUserId,
        Status: ActivityEnums.Status.Pending
    };
    if (params.ChatInstance) {
        query.ChatInstance = params.ChatInstance;
    }
    return await SchemaPack.ChatActivity.findOneAndUpdate(query, {
        $set: {Status: ActivityEnums.Status.Cancelled}
    }, {
        new: true
    }).exec();
}

async function getChatActivity(params) {
    'use strict';
    let condition = {
            BotUserId: params.BotUserId
        },
        activity;
    if (params.Step) {
        condition.Step = params.Step;
    }
    if (params.Status) {
        condition.Status = params.Status;
    }
    if (params.Module) {
        condition.Module = params.Module;
    }
    if (params.ChatInstance) {
        condition.ChatInstance = params.ChatInstance;
    }
    activity = await SchemaPack.ChatActivity.findOne(condition).sort({_id:-1});
    return activity;
}

async function createChatCozeActivity(params) {
    let activity = new SchemaPack.ChatCozeActivity({
        btId: guid.v1(),
        BotUserId: params.BotUserId,
        BotChatId: params.ChatId,
        CozeConversationId: params.ConversationId,
        CozeBotId: params.CozeBotId,
        Status: ActivityEnums.ChatStauts.InProgress
    });
    await activity.save();
    return activity.toObject();
}

async function getChatCozeActivity(params) {
    'use strict';
    let condition = {
            BotUserId: params.BotUserId,
            CozeConversationId: {$exists: true},
            Status: ActivityEnums.ChatStauts.InProgress
        },
        activity;
    if (params.Status) {
        condition.Status = params.Status;
    }
    activity = await SchemaPack.ChatCozeActivity.findOne(condition);
    return activity;
}

async function updateChatCozeActivity(params) {
    let condition = {
            BotUserId: params.BotUserId,
            CozeConversationId: {$exists: true},
            Status: ActivityEnums.ChatStauts.InProgress
        },
        activity,
        setObj = {},
        updatedFields = [
            "CozeBotId",
            "Status",
            "ErrorMessage"
        ];
    if (params.ActivityId) {
        condition = {btId: params.ActivityId};
    }
    activity = await SchemaPack.ChatCozeActivity.findOne(condition);
    if (!activity) {
        return "No InProgress conversation found";
    }
    updatedFields.forEach((updatedField) => {
        if (params[updatedField]) {
            setObj[updatedField] = params[updatedField];
        }
    });
    if (params.CozeResponse) {
        setObj.Records = [...activity.Records || [], {
            CozeChatId: params.CozeChatId,
            Question: params.Question,
            Response: params.CozeResponse,
            FollowUps: params.FollowUps
        }];
    }
    activity = await SchemaPack.ChatCozeActivity.findOneAndUpdate({
        btId: activity.btId
    }, {
        $set: setObj
    }, {
        new: true
    }).exec();
    return activity;
}

module.exports = {
    CreateActivity: createActivity,
    UpdateChatActivity: updateChatActivity,
    CancelPendingActivity: cancelPendingActivity,
    GetChatActivity: getChatActivity,
    CreateChatCozeActivity: createChatCozeActivity,
    GetChatCozeActivity: getChatCozeActivity,
    UpdateChatCozeActivity: updateChatCozeActivity
};
