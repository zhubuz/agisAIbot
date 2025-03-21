/*jslint node:true*/
let BotSchema = require('../../framework/BotSchema.js'),
    ActivityEnums = require("../../enums/ActivityEnums.js"),
    DbConnections = require('../../framework/DbConnections.js'),
    props = {
        BotUserId: {type: String},
        ChatInstance: {type: String},
        Step: {type: Number, default: 1},
        Type: {type: String},
        Module: {type: String},
        Status: {type: String, enum: Object.keys(ActivityEnums.Status), default: ActivityEnums.Status.Pending},
        ErrorMessage: {type: String},
        TransactionType: {type: String},
        Prompt: {type: String},
        VideoUrl: {type: String},
        ImageUrl: {type: String},
        ResultUrl: {type: String}
    },
    chatCozeProps = {
        BotUserId: {type: String},
        BotChatId: {type: String},
        CozeConversationId: {type: String},
        CozeBotId: {type: String},
        Records: [{
            CozeChatId: {type: String},
            Question: {type: String},
            Response: {type: String},
            FollowUps: [{type: String}],
            _id: false
        }],
        Status: {type: String, enum: Object.keys(ActivityEnums.ChatStauts), default: ActivityEnums.ChatStauts.InProgress},
        ErrorMessage: {type: String}
    },
    ChatActivity = new BotSchema(props),
    ChatCozeActivity = new BotSchema(chatCozeProps);
exports.ChatActivity = DbConnections.quantum_common.model('ChatActivity', ChatActivity, 'ChatActivity');
exports.ChatCozeActivity = DbConnections.quantum_common.model('ChatCozeActivity', ChatCozeActivity, 'ChatCozeActivity');
