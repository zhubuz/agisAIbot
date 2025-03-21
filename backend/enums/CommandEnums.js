/*jslint node:true*/
const { invokeService, Services } = require("../framework/Services");

let Enums = {
    CommandMenu: [  
        { command: '/start', description: 'Get start' },
        { command: '/cryptobuzzer', description: 'Crypto Buzzer' },
        { command: '/generate', description: 'AI generation tools!' },
        { command: '/checkin', description: 'Check In for daily rewards' },
        { command: '/profile', description: 'User profile' },
        { command: '/help', description: 'More Info' }
    ],
    InlineKeyboards: [
        [{
            text: "CelebSwap (Cosume 30 points)",
            callback_data: "GenerateLiveFaceBaseImage"
        }],
        [{
            text: "I made that! (Cosume 30 points)",
            callback_data: "GenerateLiveFace"
        }],
        [{
            text: "MemeMint (Cosume 30 points)",
            callback_data: "HandleMemeMint"
        }],
        [{
            text: "PixelMorph AI (Cosume 40 points)",
            callback_data: "HandleImgToImg"
        }],
        [{
            text: "Meme Talk (Coming soon)",
            callback_data: "Level2Coming_MemeTalk"
        }],
        [{
            text: "CryptoReels (Coming soon)",
            callback_data: "Level2Coming_CryptoReels"
        }],
        [{
            text: "DeSci Capture (Coming soon)",
            callback_data: "Level2Coming_DeSci"
        }]
    ],
    Commands: {
        start: {
            en: "<b>Welcome to the Future of AI agentic layer!</b>\n" +
                "\nHere, your wildest imagination will come to life! With next-generation AI tools at your fingertips, anything you dream up – whether it’s fun GIFs, personalized AI meme avatars, or hilarious mini-shows – is yours to create. <b>You are the Director of the digital world.</b> \n" +
                "\nHere, your creativity will get paid off. Every contribution and interaction earns you points that can be converted into cryptocurrencies. Get rewarded for your ideas and watch your dreams turn into digital assets. <b>You make Money while you dream.</b>\n" +
                "\n<b>👉 Get Started:</b>\n" +
                "<u>AI Treasure Box:</u> Use the /generate command to choose your preferred tools to start creating and earning!\n" +
                "<u>User Reward:</u> Get 100 points every day with the /checkin command, and earn an extra 500 points for logging in 7 days in a row!\n" +
                "<u>User Level:</u> Use /profile anytime to view your account details, including points and privileged status.\n" +
                "\nIf you need help, type /help for more information. Come and Explore – can't wait to see your amazing creations! 🎉\n"
        }
    },
    BackgroudImgs: {
        Start: 'https://quantumbot-dev.s3.us-east-1.amazonaws.com/ImageTemplates/memeStart.jpg',
        Coming: 'https://quantumbot-dev.s3.us-east-1.amazonaws.com/ImageTemplates/memeSaving.jpg'
    },
    VideoTemplate: [  
        { id: 1, Url: 'https://quantumbot-dev.s3.us-east-1.amazonaws.com/VideoTemplates/d01.mp4', description: 'Template 1' },
        { id: 2, Url: 'https://quantumbot-dev.s3.us-east-1.amazonaws.com/VideoTemplates/d02.mp4', description: 'Template 2' },
        { id: 3, Url: 'https://quantumbot-dev.s3.us-east-1.amazonaws.com/VideoTemplates/d03.mp4', description: 'Template 3' },
        { id: 4, Url: 'https://quantumbot-dev.s3.us-east-1.amazonaws.com/VideoTemplates/d04.mp4', description: 'Template 4' }
    ],
    ImageTemplate: [
        { id: 1, Url: 'https://quantumbot-dev.s3.us-east-1.amazonaws.com/ImageTemplates/file_20.jpg', description: 'Template 1' },
        { id: 2, Url: 'https://quantumbot-dev.s3.us-east-1.amazonaws.com/ImageTemplates/file_21.jpg', description: 'Template 2' },
        { id: 3, Url: 'https://quantumbot-dev.s3.us-east-1.amazonaws.com/ImageTemplates/file_22.jpg', description: 'Template 3' },
        { id: 4, Url: 'https://quantumbot-dev.s3.us-east-1.amazonaws.com/ImageTemplates/file_24.jpg', description: 'Template 4' }
    ],
    StableDiffusion: {
        lora_weight: {"SDXL_MSPaint_Portrait": 0.8},
        mt: "sdxl",
        negative_prompt: "worst quality, text, watermark, logo, bane, extra digits, cropped, jpeg artifacts, signature, username, error, sketch, duplicate, ugly, more legs, bad arms, missing legs, missing arms,pory-drawn face,bad face, fused face, worst face, three crus, extra crus, fused crus, worst feet, three feet, fused feet, fused thigh, three thigh, fused thigh, extra thigh, worst thigh,  missing fingers, extra fingers, ugly fingers, realistic photo, extra eyes, huge eyes, amputation, disconnected limbs, 2girl, high quality,3d, depth, photograph"
    },
    Generates: {
        Level1Trynow: {
            MethodName: "HandleLevel1Trynow",
            ServiceName: Services.Command.Name
        },
        Level1Coming: {
            MethodName: "HandleLevel1Coming",
            ServiceName: Services.Command.Name
        },
        GenerateLiveFace: {
            TransactionType: "MaskFace",
            Type: "VideoTemplate",
            Module: "LiveFace",
            MethodName: "GenerateLiveFaceChain",
            ServiceName: Services.Command.Name
        },
        GenerateLiveFaceBaseImage: {
            TransactionType: "LiveFaceBaseImage",
            Type: "ImageTemplate",
            Module: "LiveFace",
            MethodName: "GenerateLiveFaceChain",
            ServiceName: Services.Command.Name
        },
        GenerateFace: {
            MethodName: "GenerateFaceChain",
            ServiceName: Services.Command.Name
        },
        HandleMemeMint: {
            TransactionType: "MemeMint",
            Module: "MemeMint",
            MethodName: "HandleMemeMintChain",
            ServiceName: Services.Command.Name
        },
        HandleImgToImg: {
            TransactionType: "PixelMorphAI",
            Module: "PixelMorphAI",
            MethodName: "HandleImgToImgChain",
            ServiceName: Services.Command.Name
        },
        Other: {
            MethodName: "HandleCommands",
            ServiceName: Services.Command.Name
        }
    }
};
require('./EnumsBase.js').SetNames(Enums);

module.exports = Enums;