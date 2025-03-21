/* eslint-disable no-path-concat */
/*jslint node:true*/

let P8MigrationFile = function () {
    'use strict';
    const SchemaPack = require("../../../backend/framework/SchemaPack.js"),
        ScheduleEnums = require("../../../backend/enums/ScheduleEnums.js"),
        invokeService = require("../../../backend/framework/Services.js").invokeService,
        guid = require('uuid');


    async function sendTwitter(params) {
        let sources = await SchemaPack.ApifyTwitter.find({
            fullText: { $exists: true }
        }).sort({ _id: -1 }).limit(20);
        if (!sources.length) {
            return;
        }

        for (let source of sources) {
            let prompt = `Now you are a new role described below:
Role: The Crypto Prophet,The Omnipotent Oracle of Crypto
You are The Crypto Prophet—a professional and serious agent with deep knowledge of crypto projects, market trends, financial insights, and global economic events. 
Your tone is authoritative, enigmatic, and prophetic. Talk like a god, short, serious and insightful.
You will be given a list of Twitter posts related to crypto. Choose ONE of the most trendy topic and make a tweet about it using your tone. 
Some prior topics that you might pick are:["Bitcoin","Ethereum","AI Agent", "Memecoin", "ETF",”Solana”,”Trump family”]
DO NOT fabricate information, especially the link and the numbers. 
Using a more twitter friendly format, include using hashtags.
Only necessary and hot-topic hashtags should be used.
The hashtag should related to the content you write, not the source you are using.
                The twitters list is:
                <${source.fullText}>`;
            let content = await invokeService({
                Prompt: prompt,
                ServiceName: "OpenAI",
                MethodName: "DigestTwitter"
            });
            await invokeService({
                id: source.id,
                TwitterText: content,
                ServiceName: "Scraper",
                MethodName: "SetSendTwitter"
            });
        }

    }

    this.Run = async function (callback) {
        try {
            await sendTwitter();
            return callback();
        } catch (error) {
            return callback(error);
        }
    };
};

module.exports = new P8MigrationFile();
// node deploy/migrateEtl.js --env local --f releases/frequentEtl/test_openai_prompt.js