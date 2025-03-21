const fs = require('fs'),
    fileHelper = require("../helpers/FileHelper.js"),
    ActivityEnums = require("../enums/ActivityEnums.js"),
    PointEnums = require("../enums/PointEnums.js"),
    CommandEnums = require("../enums/CommandEnums.js"),
    TaskEnums = require("../enums/TaskEnums.js"),
    { invokeService } = require("./Services");

function loadBll(bllName) {
    "use strict";
    return require("../services/" + bllName.toLowerCase() + "/" + bllName + "Bll.js");
}

async function handleMessage(msg, bot) {
    console.log(msg);
    const activityBll = loadBll("Activity");
    try {
        if (msg.text && msg.text[0] === '/') {
            console.log("msg.text", msg.text);
            await activityBll.CloseChatConversation({BotUserId: String(msg.from.id)});
            await activityBll.CancelPendingActivity({
                BotUserId: String(msg.from.id)
            });
        }
        if (msg.forward_origin?.type === 'channel') {
            let authUsers = ["7345142336", "5453615063"];
            if (!authUsers.includes(String(msg.chat.id))) {
                return;
            }
            let userbll = loadBll("User"),
                users = await userbll.GetBotUsers();
            for (let user of users) {
                try {
                    let targetChatId = user.BotUserId;
                    console.log("Forward targetChatId", targetChatId);
                    if (msg.photo) {
                        let photoId = msg.photo[msg.photo.length - 1].file_id;  
                        // bot.forwardMessage(user.BotUserId, msg.chat.id, msg.message_id);
                        await bot.sendPhoto(targetChatId, photoId, { caption: msg.caption || '' });
                    }
                    if (msg.entities) {  
                        let messageContent = {  
                                text: msg.text,  
                                entities: msg.entities,  
                                link_preview_options: msg.link_preview_options
                            },
                            linkText,
                            formattedMessage = messageContent.text;
                        messageContent.entities.forEach(entity => {  
                            if (entity.type === 'bold') {  
                                formattedMessage = formattedMessage.slice(0, entity.offset) +  
                                    '*' + formattedMessage.slice(entity.offset, entity.offset + entity.length) + '*' +  
                                    formattedMessage.slice(entity.offset + entity.length);  
                            }
                            if (entity.type === 'text_link') {  
                                linkText = formattedMessage.substring(entity.offset, entity.offset + entity.length);  
                                formattedMessage = formattedMessage.replace(linkText, `<a href="${entity.url}">${linkText}</a>`);
                            }
                        });  
                        await bot.sendMessage(targetChatId, formattedMessage, { disable_web_page_preview: false, parse_mode: "HTML" }); 
                    }
                } catch (e) {
                    console.log(e.toString());
                }
            }
        } else if (msg.photo) {
            let photo = msg.photo[msg.photo.length - 1],
                fileUrl = await bot.getFileLink(photo.file_id),
                botUserId = String(msg.from.id),
                activity,
                loadMethod;
            activity = await invokeService({
                BotUserId: botUserId,
                Status: ActivityEnums.Status.Pending,
                ServiceName: "Activity",
                MethodName: "GetChatActivity"
            });
            loadMethod = ActivityEnums.ImgHandler[activity?.Module];
            if (!activity || !loadMethod?.MethodName) {
                return await bot.sendMessage(msg.chat.id, 'Image uploaded');
            }
            await invokeService({
                bot: bot,
                msgData: msg.data,
                FileUrl: fileUrl,
                FileType: "Image",
                ChatId: msg.chat.id,
                BotUserId: String(msg.from.id),
                ServiceName: loadMethod.ServiceName,
                MethodName: loadMethod.MethodName,
            });
        } else if (msg.video) {
            let video = msg.video,
                fileUrl = await bot.getFileLink(video.file_id),
                loadMethod = ActivityEnums.Step.Step3;
            bot.sendMessage(msg.chat.id, 'Video uploaded');
            await invokeService({
                bot: bot,
                msgData: msg.data,
                FileUrl: fileUrl,
                ChatId: msg.chat.id,
                FileType: "Video",
                BotUserId: String(msg.from.id),
                ServiceName: loadMethod.ServiceName,
                MethodName: loadMethod.MethodName,
            });
        } else if (msg.text) {
            await invokeService({
                bot: bot,
                msgData: msg.data,
                ChatId: msg.chat.id,
                Text: msg.text,
                BotUserId: String(msg.from.id),
                ServiceName: "Command",
                MethodName: "HandleActivityText",
            });
        }
        if (msg.from) {
            let botUser = msg.from,
                userbll = loadBll("User");
            await userbll.CheckAndSaveUser(botUser); 
        }
    } catch (e) {
        console.log(e.toString());
    }
} 

async function handleCallback(msg, bot) {
    console.log("handleCallback", msg);
    let loadMethod = CommandEnums.Generates[msg.data],
        pointInfo = {};
    if (!loadMethod) {
        loadMethod = CommandEnums.Generates.Other;
    }
    pointInfo = await invokeService({
        BotUserId: String(msg.from.id),
        TransactionType: loadMethod.TransactionType,
        ServiceName: "Point",
        MethodName: "CheckPoint"
    });
    if (!pointInfo.PointEnough) {
        return bot.sendMessage(msg.message.chat.id, "You don't have sufficient points to do this");  
    }
    try {
        await invokeService({
            bot: bot,
            msgData: msg.data,
            cbMessage: msg.message,
            ChatId: msg.message.chat.id,
            BotUserId: String(msg.from.id),
            ChatInstance: msg.chat_instance,
            Balance: pointInfo.Balance,
            TransactionType: loadMethod.TransactionType,
            Type: loadMethod.Type,
            Module: loadMethod.Module,
            ServiceName: loadMethod.ServiceName,
            MethodName: loadMethod.MethodName,
        });
    } catch (e) {
        console.log(e);
    }
}
module.exports = {  
    handleMessage,
    handleCallback
};