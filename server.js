const TelegramBot = require('node-telegram-bot-api'),
    MessageHandler = require('./backend/framework/MessageHandler.js'),
    PointEnums = require("./backend/enums/PointEnums.js"),
    CommandEnums = require("./backend/enums/CommandEnums.js"),
    DbConnections = require('./backend/framework/DbConnections.js');

// Replace 'YOUR_TOKEN' with your bot's API token
// const token = '7437386066:AAHZQdpWPvQrhs6NwYEHxmQ9c3J3TMVb5HY'; // @Quantum
// const token = '7899381805:AAGK1tgS39HUU9FSgjSMC5-vZBo92GMQIwA'; // @vv-test-bot
const token = '7577655992:AAF53Nsqo_sE4YHKEf1RQ9UMlI6a_tXt6zU'; // t.me/AltaTechDev_bot at aws ec2

function loadBll(bllName) {
    "use strict";
    return require("./backend/services/" + bllName.toLowerCase() + "/" + bllName + "Bll.js");
}
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });
// Listen for the /start command

const lang = "en";
// 设置命令菜单  
bot.setMyCommands(CommandEnums.CommandMenu).then(() => {  
    console.log('命令菜单已设置');  
}).catch(error => {
    console.error('设置命令菜单时出错:', error);  
});

bot.onText(/\/start/, async (msg) => {
    bot.sendPhoto(msg.chat.id, CommandEnums.BackgroudImgs.Start, { caption: CommandEnums.Commands.start[lang], parse_mode: "HTML" });
    let botUser = msg.from,
        userbll = loadBll("User");
    await userbll.CheckAndSaveUser(botUser);
});

bot.onText(/\/cryptobuzzer/, async (msg) => {
    const activityBll = loadBll("Activity"),
        pointBll = loadBll("Point");
    let pointInfo = await pointBll.CheckPoint({
            BotUserId: String(msg.from.id),
            TransactionType: PointEnums.TransactionType.CryptoBuzzer.Name
        }),
        activity;
    if (!pointInfo.PointEnough) {
        return bot.sendMessage(msg.chat.id, "You don't have sufficient points to do this");  
    }
    activity = await activityBll.CreateCozeConversation({
        BotUserId: String(msg.from.id),
        BotChatId: String(msg.chat.id)
    });
    if (activity?.CozeConversationId) {
        bot.sendMessage(msg.chat.id, "Welcome to Crypto Buzzer mode! 🚀 Got questions or looking for the latest buzz in the crypto world? Type your query or tell us what crypto info you’re after! 💡");
    } else {
        bot.sendMessage(msg.chat.id, "Create conversation failed");
    }
});

bot.onText(/\/generate/, async (msg) => {
    const pointBll = loadBll("Point");
    let pointAccount = await pointBll.GetAccountByBotUserId({
        BotUserId: String(msg.from.id)
    });
    bot.sendPhoto(msg.chat.id, CommandEnums.BackgroudImgs.Coming, { caption: `🎉 You currently have **${pointAccount.Balance} points**!`, "reply_markup": {
            inline_keyboard: CommandEnums.InlineKeyboards
        } });
});

bot.onText(/\/profile/, async (msg) => {
    const chatId = msg.chat.id;
    const pointBll = loadBll("Point");
    const userBll = loadBll("User")
    let pointAccount = await pointBll.GetAccountByBotUserId({
        BotUserId: String(msg.from.id)
    });
    let rewardAccount = await pointBll.GetRewardAccountByBotUserId({
        BotUserId: String(msg.from.id)
    });
    let checkInData = await userBll.GetCheckIn({BotUserId: String(msg.from.id)})
    bot.sendMessage(chatId, `🎉 Hello, ${msg.from.first_name} ${msg.from.last_name}!\n✨ Your Points: **${pointAccount.Balance}**\n🏅 Reward Points: ${rewardAccount.Balance}\n📅 You have ${checkInData.TodayCheckIn ? "" : "not"} checked in today!\n🔥 Consecutive Check-ins: **${checkInData.ContinuousCheckIn} days**`);
});

bot.onText(/\/checkin/, async (msg) => {
    const chatId = msg.chat.id;
    const pointBll = loadBll("Point");
    let transaction = await pointBll.CeatePointTransaction({
        BotUserId: String(msg.from.id),
        TransactionType: PointEnums.TransactionType.CheckIn.Name
    });
    bot.sendMessage(chatId, `Check in success! You currently have ${transaction.AccountBalance} points!`);
});

bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendVideo(chatId, "https://quantumbot-dev.s3.us-east-1.amazonaws.com/bot_help.mp4")
});

let isProcessing = false;
bot.on('callback_query', async (msg) => {  
    if (isProcessing) return;
    isProcessing = true;
    try {
        await MessageHandler.handleCallback(msg, bot);
    } finally {
        setTimeout(() => {
            isProcessing = false;  
        }, 10);
    }  
});

bot.on('message', async (msg) => MessageHandler.handleMessage(msg, bot));

const startBot = async () => {  
    DbConnections.init(); 
    console.log('Bot is running...');  
}; 

startBot().catch(error => console.error('Failed to start the bot:', error));