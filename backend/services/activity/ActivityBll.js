const ActivityProcessor = require("./ActivityProcessor.js"),
    ActivityEnums = require("../../enums/ActivityEnums.js"),
    CozeAgentHelper = require("../../helpers/CozeAgentHelper.js");

async function saveChatActivity(params) {
    let activity = await ActivityProcessor.CancelPendingActivity({
        BotUserId: params.BotUserId,
        ChatInstance: params.ChatInstance
    });
    activity = await ActivityProcessor.CreateActivity({
        BotUserId: params.BotUserId,
        ChatInstance: params.ChatInstance,
        TransactionType: params.TransactionType,
        Type: params.Type,
        Module: params.Module
    });
    return activity;
}

async function createCozeConversation(params) {
    let cozeResponse,
        activity;
    cozeResponse = await CozeAgentHelper.CreateConversation();
    if (!cozeResponse?.id) {
        console.log("Create conversation failed");
    }
    activity = await ActivityProcessor.CreateChatCozeActivity({
        BotUserId: params.BotUserId,
        BotChatId: params.BotChatId,
        ConversationId: cozeResponse?.id
    });
    return activity;
}

async function newMsgToCozeChat(params) {
    let cozeResponse,
        activity,
        result = "Something went wrong";
    cozeResponse = await CozeAgentHelper.CozeChatNonStream({
        ConversationId: params.ConversationId,
        UserId: params.BotUserId,
        Question: params.Question
    });
    console.log("newMsgToCozeChat cozeResponse", cozeResponse);
    if (cozeResponse.CozeResponse || cozeResponse.ErrorMessage) {
        activity = await ActivityProcessor.UpdateChatCozeActivity({
            ActivityId: params.ActivityId,
            BotUserId: params.BotUserId,
            CozeConversationId: params.CozeConversationId,
            CozeResponse: cozeResponse.CozeResponse,
            FollowUps: cozeResponse.FollowUps,
            CozeChatId: cozeResponse.CozeChatId,
            Question: params.Question,
            ErrorMessage: cozeResponse.ErrorMessage
        });
        return {
            Content: cozeResponse.CozeResponse || cozeResponse.ErrorMessage,
            FollowUps: cozeResponse.FollowUps
        };
    }
    return {
        Content: result
    };
}

async function closeChatConversation(params) {
    return await ActivityProcessor.UpdateChatCozeActivity({
        BotUserId: params.BotUserId,
        Status: ActivityEnums.ChatStauts.Closed
    });
}

module.exports = {
    SaveChatActivity: saveChatActivity,
    UpdateChatActivity: ActivityProcessor.UpdateChatActivity,
    GetChatActivity: ActivityProcessor.GetChatActivity,
    CreateCozeConversation: createCozeConversation,
    GetChatCozeActivity: ActivityProcessor.GetChatCozeActivity,
    NewMsgToCozeChat: newMsgToCozeChat,
    UpdateChatCozeActivity: ActivityProcessor.UpdateChatCozeActivity,
    CancelPendingActivity: ActivityProcessor.CancelPendingActivity,
    CloseChatConversation: closeChatConversation
}