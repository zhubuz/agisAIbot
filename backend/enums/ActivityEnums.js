/*jslint node:true*/
const { invokeService, Services } = require("../framework/Services");

let Enums = {
        Status: {
            Pending: 0,
            Complete: 0,
            Cancelled: 0,
            Failed: 0
        },
        ChatStauts: {
            InProgress: 0,
            Closed: 0,
            Cancelled: 0,
            Timeout: 0
        },
        Type: {
            ImageTemplate: 0,
            VideoTemplate: 0
        },
        ContentType: {
            photo: 'image/png',
            video: 'video/mp4'
        },
        Module: {
            LiveFace: 0,
            MemeMint: 0,
            PixelMorphAI: 0
        },
        Step: {
            Step1: {
                VideoTemplate: "Select the video you want to perform",
                ImageTemplate: "Select the celebrity for the performance",
                MethodName: "ShowTemplates",
                ServiceName: Services.Command.Name
            },
            Step2: {
                VideoTemplate: "Who created this iconic moment? 🤔 Elon? CZ? Nah, it's ME! 😎✨ Upload a pic of yourself recreating a legendary scene once owned by the stars! 🌟📸",
                ImageTemplate: "Upload a video with clear vocals and a visible face, and we’ll swap in a celebrity’s face for fun results!"
            },
            Step3: {
                VideoTemplate: "Generating with AI, please wait a few minutes",
                ImageTemplate: "Generating with AI, please wait a few minutes",
                MethodName: "HandleStep3",
                ServiceName: Services.Command.Name
            }
        },
        ImgHandler: {
            PixelMorphAI: {
                MethodName: "HandlePixelImage",
                ServiceName: Services.Command.Name
            },
            LiveFace: {
                VideoTemplate: "Generating with AI, please wait a few minutes",
                ImageTemplate: "Generating with AI, please wait a few minutes",
                MethodName: "HandleStep3",
                ServiceName: Services.Command.Name
            }
        }
    },
    util = require('./EnumsBase.js');
    
util.SetNames(Enums);
util.SetNames(Enums.Type, 'Name');
util.SetNames(Enums.Module, 'Name');
module.exports = Enums;