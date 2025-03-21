const { invokeService, Services } = require("../../framework/Services"),
    fs = require('fs'),
    fileHelper = require("../../helpers/FileHelper.js"),
    ActivityEnums = require("../../enums/ActivityEnums.js"),
    CommandEnums = require("../../enums/CommandEnums.js"),
    ConstantEnums = require("../../enums/ConstantEnums.js"),
    PointEnums = require("../../enums/PointEnums.js"),
    TaskEnums = require("../../enums/TaskEnums.js");

const videoTemplates = CommandEnums.VideoTemplate,
    imageTemplates = CommandEnums.ImageTemplate; 
let UserTimer = {};

// 显示视频模板的函数  
async function showTemplates(chatId, bot, type) {
    let templates = CommandEnums[type] || videoTemplates,
        replyMarkup;
    replyMarkup = {  
        inline_keyboard: templates.map(template => [{  
            text: template.description,  
            callback_data: `SelectTemplate_${template.id}`  
        }])
    };
    await bot.sendMessage(chatId, `${ActivityEnums.Step.Step1[type]}\n`, {  
        reply_markup: replyMarkup  
    });
    for (let template of templates) {
        if (type === "VideoTemplate") {
            await bot.sendVideo(chatId, template.Url, { caption: `${template.description} (ID: ${template.id})` });
        } else {
            await bot.sendPhoto(chatId, template.Url, { caption: `${template.description} (ID: ${template.id})` });
        }
    }
}

async function generateLiveFaceChain(params) {
    let activity,
        bot = params.bot;
   
    activity = await invokeService({
        BotUserId: params.BotUserId,
        ChatInstance: params.ChatInstance,
        Type: params.Type,
        Module: params.Module,
        TransactionType: params.TransactionType,
        ServiceName: "Activity",
        MethodName: "SaveChatActivity"
    });
    await showTemplates(params.ChatId, bot, params.Type);
}

async function handleMemeMintChain(params) {
    let bot = params.bot;
    await invokeService({
        BotUserId: params.BotUserId,
        ChatInstance: params.ChatInstance,
        Type: params.Type,
        Module: params.Module,
        TransactionType: params.TransactionType,
        ServiceName: "Activity",
        MethodName: "SaveChatActivity"
    });
    bot.sendMessage(params.ChatId, "🤖 What meme is in your mind now? \n ✍ Write it down and send to the chat to bring it to life! 🤠🤠 ");
}

async function handleImgToImgChain(params) {
    let bot = params.bot,
        msg = `🎨 Welcome to PixelMorph AI – the ultimate Image Content Editor!
 Transform your images with the power of AI. Upload your image, provide a prompt, and let us work magic on your content!
⚠️ 40 Points will be deducted for each transformation. Upon completion, you’ll earn 15 reward points!
 Let’s get started – upload the image you want to edit now!`;
    await invokeService({
        BotUserId: params.BotUserId,
        ChatInstance: params.ChatInstance,
        Type: params.Type,
        Module: params.Module,
        TransactionType: params.TransactionType,
        ServiceName: "Activity",
        MethodName: "SaveChatActivity"
    });
    bot.sendMessage(params.ChatId, msg);
}

async function handlePixelImage(params) {
    let bot = params.bot,
        activity,
        s3Url,
        msg = `✅ Your image has been uploaded successfully! Now, please tell me how you want your image content to change. Examples:

"Add a futuristic city in the background"
"Make the character look like a superhero"
"Replace the tree with a glowing neon sign"
 Be as creative as you like – we’ll make your vision come to life!
`,
        filename = params.FileUrl.replace(/^.*\/([^\/]+)$/, '$1');
    s3Url = await fileHelper.RequestUrlAndUploadToS3({
        Url: params.FileUrl,
        FileName: params.BotUserId + '/ImgtoImg/' + filename
    });
    activity = await invokeService({
        BotUserId: params.BotUserId,
        ImageUrl: s3Url,
        Step: 2,
        ServiceName: "Activity",
        MethodName: "UpdateChatActivity"
    });
    bot.sendMessage(params.ChatId, msg);
}

async function handleCommands(params) {
    let bot = params.bot,
        msgData = params.msgData.split('_'),
        selectedTemplateId,
        activity,
        template,
        templates,
        step,
        paramObj = {};
    if (msgData && msgData[0] === "SelectTemplate") {
        activity = await invokeService({
            BotUserId: params.BotUserId,
            ChatInstance: params.ChatInstance,
            Status: ActivityEnums.Status.Pending,
            ServiceName: "Activity",
            MethodName: "GetChatActivity"
        });
        templates = CommandEnums[activity.Type] || videoTemplates;
        selectedTemplateId = msgData[1];
        template = templates.find(tp => tp.id === Number(selectedTemplateId));
        paramObj = {
            BotUserId: params.BotUserId,
            ChatInstance: params.ChatInstance,
            Step: 2,
            ServiceName: "Activity",
            MethodName: "UpdateChatActivity"
        };
        if (activity.Type === ActivityEnums.Type.VideoTemplate) {
            paramObj.VideoUrl = template.Url;
        } else if (activity.Type === ActivityEnums.Type.ImageTemplate) {
            paramObj.ImageUrl = template.Url;
        }
        activity = await invokeService(paramObj);
        if (!activity) {
            return;
        }
        step = ActivityEnums.Step[`Step${activity.Step}`];
        bot.sendMessage(params.ChatId, step[activity.Type]);
    }
    if (msgData && msgData[0] === "Level2Coming") {
        let notes = {
                MemeTalk: "Your favorite meme brings you the latest crypto insights 🎤💎",
                CryptoReels: "Generate interactive crypto-themed comics or short video clips with just a few prompts! 🎬🚀",
                MemeMint: "Instantly create hilarious crypto memes for endless fun! 😂💰",
                DeSci: "Catch up with the newest DeSci trending. You won’t miss out any chance from it!"
            },
            urls = {
                MemeTalk: "https://quantumbot-dev.s3.us-east-1.amazonaws.com/Options/MemeTalk.mp4",
                CryptoReels: "https://quantumbot-dev.s3.us-east-1.amazonaws.com/Options/CryptoReels.mp4",
                MemeMint: "https://quantumbot-dev.s3.us-east-1.amazonaws.com/Options/MemeMint.jpg",
                DeSci: "https://quantumbot-dev.s3.us-east-1.amazonaws.com/ImageTemplates/einstein.gif"
            };
        if (msgData[1] === "MemeMint") {
            await bot.sendPhoto(params.ChatId, urls[msgData[1]], { caption: notes[msgData[1]] });
        } else if (urls[msgData[1]]){
            await bot.sendVideo(params.ChatId, urls[msgData[1]], { caption: notes[msgData[1]] });
        }
    }
    if (msgData && msgData[0] === "CozeFollowUp") {
        selectedTemplateId = msgData[1];
        activity = await handleActivityText({
            bot,
            BotUserId: params.BotUserId,
            ChatId: params.ChatId,
            FollowupIndex: selectedTemplateId
        });
        if (!activity) {
            bot.sendMessage(params.ChatId, 'The conversation mode has ended. If you need to use the Financial Reporter feature again, please re-enter the command.');
        }
    }
}

async function handleStep3(params) {
    let bot = params.bot,
        activity,
        s3Url,
        paramObj = {},
        step,
        filename = params.FileUrl.replace(/^.*\/([^\/]+)$/, '$1');
    activity = await invokeService({
        BotUserId: params.BotUserId,
        Step: 2,
        Status: ActivityEnums.Status.Pending,
        ServiceName: "Activity",
        MethodName: "GetChatActivity"
    });
    if (!activity) {
        return;
    }
    if (activity.Type === ActivityEnums.Type.VideoTemplate && params.FileType !== "Image") {
        bot.sendMessage(params.ChatId, 'Error file, Upload an image of the person to perform');
        return;
    }
    if (activity.Type === ActivityEnums.Type.ImageTemplate && params.FileType !== "Video") {
        bot.sendMessage(params.ChatId, 'Error file, Upload a vocal video');
        return;
    }
    s3Url = await fileHelper.RequestUrlAndUploadToS3({
        Url: params.FileUrl,
        FileName: params.BotUserId + '/' + filename
    });
    paramObj = {
        BotUserId: params.BotUserId,
        ChatInstance: activity.ChatInstance,
        Step: 3,
        ServiceName: "Activity",
        MethodName: "UpdateChatActivity"
    };
    if (activity.Type === ActivityEnums.Type.VideoTemplate) {
        paramObj.ImageUrl = s3Url;
    } else if (activity.Type === ActivityEnums.Type.ImageTemplate) {
        paramObj.VideoUrl = s3Url;
    }
    activity = await invokeService(paramObj);
    step = ActivityEnums.Step[`Step${activity.Step}`];
    bot.sendMessage(params.ChatId, step[activity.Type]);
    result = await TaskEnums.Tools.LiveFace({
        ImageUrl: activity.ImageUrl,
        VideoUrl: activity.VideoUrl
    });
    if (result.ErrorMsg) {
        bot.sendMessage(params.ChatId, 'Task Failed');
        activity = await invokeService({
            BotUserId: params.BotUserId,
            ChatInstance: activity.ChatInstance,
            ErrorMessage: result.ErrorMsg,
            Status: ActivityEnums.Status.Failed,
            ServiceName: "Activity",
            MethodName: "UpdateChatActivity"
        });
    }
    if (result?.resultPath) {
        handleResult({
            bot: bot,
            ChatId: params.ChatId,
            TransactionType: activity.TransactionType,
            BotUserId: params.BotUserId,
            Result: result,
            ChatInstance: activity.ChatInstance
        });
    }
    return;
}
async function resetTimeout(bot, chatId) {
    if (UserTimer[chatId]) {
        clearTimeout(UserTimer[chatId]);
    }
    UserTimer[chatId] = setTimeout(() => {
        invokeService({
            BotUserId: chatId,
            ServiceName: "Activity",
            MethodName: "CloseChatConversation"
        });
        bot.sendMessage(chatId, 'Since you haven’t responded for a while, the conversation mode has ended. If you need to use the Financial Reporter feature again, please re-enter the command.');
    }, ConstantEnums.MILLI_SECONDS_PER_MINUTE * 3);
}
async function handleActivityText(params) {
    let bot = params.bot,
        activity,
        cozeActivity,
        record,
        question = params.Text,
        caption,
        pointInfo,
        result,
        msg = {};
    [activity, cozeActivity] = await Promise.all([
        invokeService({
            BotUserId: params.BotUserId,
            Status: ActivityEnums.Status.Pending,
            ServiceName: "Activity",
            MethodName: "GetChatActivity"
        }),
        invokeService({
            BotUserId: params.BotUserId,
            ServiceName: "Activity",
            MethodName: "GetChatCozeActivity"
        })
    ]);
    if (!activity && !cozeActivity) {
        return;
    }
    if (cozeActivity) {
        if (!params.Text && params.FollowupIndex) {
            record = cozeActivity.Records[cozeActivity.Records.length-1];
            question = record.FollowUps[params.FollowupIndex];
        }
        pointInfo = await invokeService({
            BotUserId: params.BotUserId,
            TransactionType: PointEnums.TransactionType.CryptoBuzzer.Name,
            ServiceName: "Point",
            MethodName: "CheckPoint"
        });
        if (!pointInfo.PointEnough) {
            return bot.sendMessage(params.ChatId, "You don't have sufficient points to do this");  
        }
        msg = await invokeService({
            BotUserId: params.BotUserId,
            ConversationId: cozeActivity.CozeConversationId,
            UserId: params.BotUserId,
            Question: question,
            ServiceName: "Activity",
            MethodName: "NewMsgToCozeChat"
        });
        await invokeService({
            BotUserId: params.BotUserId,
            TransactionType: PointEnums.TransactionType.CryptoBuzzer.Name,
            ServiceName: "Point",
            MethodName: "CeatePointTransaction"
        });
        await invokeService({
            BotUserId: params.BotUserId,
            TransactionType: PointEnums.TransactionType.CryptoBuzzer.Name,
            ServiceName: "Point",
            MethodName: "CeateRewardTransaction"
        });
        await bot.sendMessage(params.ChatId, msg.Content, {parse_mode: "Markdown"});
        if (msg.FollowUps?.length) {
            let responseText = '✨ Choose a related question to continue, or type your own to explore more:\n\n',
                replyMarkup,
                indexIcons = ['1️⃣','2️⃣','3️⃣'];
            msg.FollowUps.forEach((text, index) => {
                responseText += `${indexIcons[index]} ${text}\n`;
            });
            replyMarkup = {
                inline_keyboard: msg.FollowUps.map((fp, index) => [{
                    text: `Choose ${index + 1}`,
                    callback_data: `CozeFollowUp_${index}`
                }])
            }; 
            responseText += '\n💬 Reply with the number of your choice or type a new question to proceed!';
            await bot.sendMessage(params.ChatId, responseText, {  
                reply_markup: replyMarkup  
            });
        }
        await resetTimeout(bot, params.ChatId);
        return cozeActivity;
    }
    if (activity.Step === 1 && activity.Module === "MemeMint") {
        activity = await invokeService({
            BotUserId: params.BotUserId,
            Step: 2,
            ChatInstance: activity.ChatInstance,
            Prompt: params.Text,
            ServiceName: "Activity",
            MethodName: "UpdateChatActivity"
        });
        await bot.sendMessage(params.ChatId, 'Hold on, your Meme is on the way!⌛️');
        result = await TaskEnums.Tools.MemeMint({
            prompt: activity.Prompt,
            ...CommandEnums.StableDiffusion
        });
    }
    if (activity.Module === "PixelMorphAI") {
        if (!activity.ImageUrl) {
            return await bot.sendMessage(params.ChatId,'⚠️ Oops! You haven’t uploaded an image yet. Please upload your image to proceed.');
        }
        activity = await invokeService({
            BotUserId: params.BotUserId,
            Step: 3,
            ImageUrl: activity.ImageUrl,
            Prompt: params.Text,
            ServiceName: "Activity",
            MethodName: "UpdateChatActivity"
        });
        await bot.sendMessage(params.ChatId, `📝 Got it! Your idea has been received, I am editing your image.
 💡 This may take a few seconds, but rest assured, the results will be worth the wait. We’ll notify you once it’s ready!`);
        result = await TaskEnums.Tools.PixelMorphAI({
            Prompt: params.Text,
            ImageUrl: activity.ImageUrl
        });
        caption = `🌟 Your PixelMorph AI edit is complete! Check out your transformed image:
 🏆 You’ve earned 15 reward points!
 🎁 Ready to try more edits? Let your creativity run wild!`;
    }
    if (result?.ErrorMsg) {
        bot.sendMessage(params.ChatId, 'Task Failed');
        activity = await invokeService({
            ActivityId: activity.btId,
            ErrorMessage: result.ErrorMsg,
            Status: ActivityEnums.Status.Failed,
            ServiceName: "Activity",
            MethodName: "UpdateChatActivity"
        });
    }
    if (result?.resultPath) {
        handleResult({
            bot: bot,
            ChatId: params.ChatId,
            TransactionType: activity.TransactionType,
            BotUserId: params.BotUserId,
            Result: result,
            Caption: caption,
            ChatInstance: activity.ChatInstance
        });
    }
    return;
}

async function handleResult(params) {
    let resultUrl,
        activity,
        bot = params.bot,
        result = params.Result;
        rewardAccount = await invokeService({
            BotUserId: params.ChatId,
            ServiceName: "Point",
            MethodName: "GetRewardAccountByBotUserId"
        }),
        reward = PointEnums.TransactionType[params.TransactionType].Reward,
        caption = params.Caption || `🎨 Here’s your creation! \n🏆 Rewards Earned: ${reward} \n🌟 Total Rewards: ${rewardAccount.Balance + reward}`;
    if (result.contentType === ActivityEnums.ContentType.photo) {
        bot.sendPhoto(params.ChatId, result.resultPath, { caption });
    } else if (result.contentType === ActivityEnums.ContentType.video) {
        bot.sendVideo(params.ChatId, result.resultPath, { caption });
    }
    resultUrl = await fileHelper.ReadFileAndUploadToS3({
        FilePath: result.resultPath,
        FileName: params.BotUserId + '/' + result.filename,
        FileType: result.contentType
    });
    activity = await invokeService({
        BotUserId: params.BotUserId,
        ChatInstance: params.ChatInstance,
        ResultUrl: resultUrl,
        Status: ActivityEnums.Status.Complete,
        ServiceName: "Activity",
        MethodName: "UpdateChatActivity"
    });
    if (activity.TransactionType) {
        await invokeService({
            BotUserId: params.BotUserId,
            TransactionType: activity.TransactionType,
            ServiceName: "Point",
            MethodName: "CeatePointTransaction"
        });
        await invokeService({
            BotUserId: params.BotUserId,
            TransactionType: activity.TransactionType,
            ServiceName: "Point",
            MethodName: "CeateRewardTransaction"
        });
    }
   
    fs.unlinkSync(result.resultPath);
    return;
}

async function handleLevel1Trynow(params) {
    params.bot.sendMessage(params.ChatId, `You currently have ${params.Balance} points!`, {
        "reply_markup": {
            inline_keyboard: [
                [{
                    text: "CelebSwap",
                    callback_data: "GenerateLiveFaceBaseImage"
                }],
                [{
                    text: "I made that!",
                    callback_data: "GenerateLiveFace"
                }]
            ]
        }
    });
}

async function handleLevel1Coming(params) {
    params.bot.sendMessage(params.ChatId, `You currently have ${params.Balance} points!`, {
        "reply_markup": {
            inline_keyboard: [
                [{
                    text: "Meme Talk",
                    callback_data: "Level2Coming_MemeTalk"
                }],
                [{
                    text: "CryptoReels",
                    callback_data: "Level2Coming_CryptoReels"
                }],
                [{
                    text: "MemeMint",
                    callback_data: "Level2Coming_MemeMint"
                }],
                [{
                    text: "DeSci Capture",
                    callback_data: "Level2Coming_DeSci"
                }]
            ]
        }
    });
}

module.exports = {
    GenerateLiveFaceChain: generateLiveFaceChain,
    HandleMemeMintChain: handleMemeMintChain,
    HandleImgToImgChain: handleImgToImgChain,
    HandlePixelImage: handlePixelImage,
    ShowTemplates: showTemplates,
    HandleCommands: handleCommands,
    HandleStep3: handleStep3,
    HandleActivityText: handleActivityText,
    HandleLevel1Trynow: handleLevel1Trynow,
    HandleLevel1Coming: handleLevel1Coming
};