const axios = require('axios').default;
const fetch = require('node-fetch'); 

const token = "pat_VG9hdfjcoN1D4MYcI4Rf5xTPbWh8BSQZCPirW6GN1AzYOLpQpMKnQGfNVGKyUahw";
    botId = "7385965742446968850",
    userId = "7448898191154250769",
    chatBotId = "7451506249843621895",
    url = {
        conversation: "https://api.coze.com/v1/conversation/create",
        chat: "https://api.coze.com/v3/chat",
        retrieve: "https://api.coze.com/v3/chat/retrieve",
        msglist: "https://api.coze.com/v3/chat/message/list"
    };

function parseEventString(eventString) {
    let events = eventString.trim().split('\n\n'),
        content = {
            "prompt": "",
            "negative_prompt": ""
        };
    events.forEach(event => {
        let lines = event.split('data:').map(line => line.trim()),
            inputString = lines[1],
            typeRegex = /"type":\s*"answer"/,
            start,
            end,
            contentStr,
            startIndex,
            endIndex,
            startIndex1,
            endIndex1,
            loraWeight,
            weightMatch,
            wKey,
            wValue,
            promptStr,
            negPromptStr;
        if (lines[0] === "event:conversation.message.completed" && typeRegex.test(inputString)) {
            start = inputString.indexOf('"content":');
            if (start === -1) {
                return content;
            }
            console.log("inputString", inputString);
            start += '"content":"'.length;
            end = inputString.indexOf('}', start) + 1;
            contentStr = inputString.substring(start, end).trim();

            weightMatch = contentStr.match(/<lora:(.*?):(\d*\.?\d+)>/);
            if (weightMatch) {  
                wKey = weightMatch[1];
                wValue = parseFloat(weightMatch[2]);
                loraWeight = { [wKey]: wValue }; 
            }

            startIndex = contentStr.indexOf('Prompt') + '"Prompt":'.length; 
            endIndex = contentStr.indexOf('<', startIndex) - 1;  
            promptStr = contentStr.substring(startIndex, endIndex);

            startIndex1 = contentStr.indexOf('negative prompt') + '"negative prompt":'.length; 
            endIndex1 = contentStr.indexOf('}', startIndex1) - 2;  
            negPromptStr = contentStr.substring(startIndex1, endIndex1);
            content = {
                "prompt": promptStr.replace(/\\|"/g, ''),
                "negative_prompt": negPromptStr.replace(/\\|"/g, ''),
                "lora_weight": loraWeight
            };
        }
    });
    return content;
}

async function cozeChatStream(params) {
    try {
        let response,
            chatResponse,
            errorResponse,
            body = {
                "bot_id": botId,
                "user_id": userId,
                "stream": true,
                "additional_messages": [
                  {
                    "content_type": "text",
                    "content": params.prompt || "Can you create a meme with a funny cat?",
                    "role": "user"
                  }
                ]
            },
            result;
        response = await fetch(url.chat, {  
            method: 'POST',
            headers: {  
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'  
            },  
            body: JSON.stringify(body) 
        });
        if (!response.ok) {  
            errorResponse = await response.text(); 
            console.log(`HTTP error! status: ${response.status}, message: ${errorResponse.message}`);  
        }  
        chatResponse = await response.text();
        result = parseEventString(chatResponse);
        console.log("result", result);
        return result;
    } catch (error) {
        console.error('postData failed:', error.toString());
        // throw error;
    }
}

async function createConversation(params) {
    let response,
        body = {
            "bot_id": chatBotId
        },
        result;
    try {
        response = await fetch(url.conversation, {  
            method: 'POST',
            headers: {  
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'  
            },  
            body: JSON.stringify(body) 
        });
        if (!response.ok) {  
            errorResponse = await response.json(); 
            console.log(`HTTP error! status: ${response.status}, message: ${errorResponse.message}`);  
        }  
        result = await response.json();
        console.log("result", result);
        return result.data;
    } catch (error) {
        console.error('postData failed:', error.toString());
        // throw error;
    }
}

async function cozeChatNonStream(params) {
    let response,
        chatResponse,
        errorResponse,
        header = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body = {
            "conversation_id": params.ConversationId,
            "bot_id": chatBotId,
            "user_id": params.UserId,
            "stream": false,
            "auto_save_history": true,
            "additional_messages": [
                {
                    "content_type": "text",
                    "content": params.Question,
                    "role": "user"
                }
            ]
        },
        chatStatusRes,
        chatStatusResData,
        chatResult,
        resContentData,
        resFollowData,
        result;
    try {
        response = await fetch(url.chat, {
            method: 'POST',
            headers: header,
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            errorResponse = await response.json();
            console.log(`HTTP error! status: ${response.status}, message: ${errorResponse.msg}`);
            return {
                ErrorMessage: errorResponse.msg,
                CozeConversationId: params.ConversationId,
                CozeBotId: chatBotId,
                BotUserId: params.UserId
            };
        }
        chatResponse = await response.json();
        console.log("chatResponse", chatResponse.data.id);
        while (true) {
            await new Promise(resolve => setTimeout(resolve, 1100));
            chatStatusRes = await fetch(`${url.retrieve}?conversation_id=${chatResponse.data.conversation_id}&chat_id=${chatResponse.data.id}`, {  
                method: 'GET',
                headers: header
            });
            chatStatusResData = await chatStatusRes.json();
            if (chatStatusResData.code !== 0) {
                throw new Error(`Chat status error: ${chatStatusResData.msg}`);
            }
            if (chatStatusResData.data.status === 'completed') {
                break;
            }
        }
        chatResult = await fetch(`${url.msglist}?conversation_id=${chatResponse.data.conversation_id}&chat_id=${chatResponse.data.id}`, {  
            method: 'GET',
            headers: header
        });
        result = await chatResult.json();
        console.log("result", result);
        if (result?.msg) {
            return {
                ErrorMessage: result.msg,
                CozeConversationId: params.ConversationId,
                CozeChatId: chatResponse.data.id,
                CozeBotId: chatBotId,
                BotUserId: params.UserId
            };
        }
        resContentData = result.data.find((dt) => dt.type === 'answer');
        resFollowData = result.data.filter(dt => dt.type === 'follow_up');
        return {
            Question: params.Question,
            CozeResponse: resContentData?.content,
            CozeConversationId: params.ConversationId,
            FollowUps: resFollowData.map(rf => rf.content),
            CozeChatId: chatResponse.data.id,
            CozeBotId: chatBotId,
            BotUserId: params.UserId
        };
    } catch (error) {
        console.error('postData failed:', error.toString());
        return {
            ErrorMessage: error.toString(),
            CozeConversationId: params.ConversationId,
            CozeChatId: chatResponse?.data?.id,
            CozeBotId: chatBotId,
            BotUserId: params.UserId
        };
        // throw error;
    }
}

module.exports = {
    CozeChat: cozeChatStream,
    CreateConversation: createConversation,
    CozeChatNonStream: cozeChatNonStream
};