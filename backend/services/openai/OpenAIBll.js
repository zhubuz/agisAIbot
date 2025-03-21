const { OpenAI } = require("openai"),
    keystore = require("../../../backend/configurations/keystore.js");

// const HttpProxyAgent = require('https-proxy-agent').HttpsProxyAgent;
// const proxy = process.env.HTTP_PROXY || 'http://127.0.0.1:10887';
// const httpAgent = new HttpProxyAgent(proxy);

const GPT_MODELS = {
    THREE_POINT_FIVE: "gpt-3.5-turbo",
    FOUR: "gpt-4-turbo",
    FOUR_O: "gpt-4o"
};

const openai = new OpenAI({
    apiKey: keystore.OpenAIKey,
    // httpAgent: httpAgent
});

function resolveModel(params) {
    // return GPT_MODELS.FOUR;
    return GPT_MODELS.FOUR_O;
    // return params.GenerateJSON ? GPT_MODELS.THREE_POINT_FIVE : GPT_MODELS.FOUR;
}

async function digestTwitter(params) {
    let prompt = params.Prompt,
        response,
        model = resolveModel(params);
    response = await openai.chat.completions.create({
        model: model,
        // model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: prompt,
          }
        ],
        temperature: 1,
        max_tokens: 4096,
    });
    return response?.choices[0]?.message.content;
}

module.exports = {
    DigestTwitter: digestTwitter
};
