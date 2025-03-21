/*jslint node:true*/
const { invokeService, Services } = require("../framework/Services");

let Enums = {
    Tools: {
        Face: async (params) => {
            let result = await invokeService({
                ...params,
                MethodName: "GenerateFace",
                ServiceName: Services.Task.Name
            });
            return result;
        },
        LiveFace: async (params) => {
            let result = await invokeService({
                ...params,
                MethodName: "GenerateLiveface",
                ServiceName: Services.Task.Name
            });
            return result;
        },
        MemeMint: async (params) => {
            let result = await invokeService({
                ...params,
                MethodName: "ToStableDiffusion",
                ServiceName: Services.Task.Name
            });
            return result;
        },
        PixelMorphAI: async (params) => {
            let result = await invokeService({
                ...params,
                MethodName: "GenerateImgtoimg",
                ServiceName: Services.Task.Name
            });
            return result;
        }
    }
};
require('./EnumsBase.js').SetNames(Enums);

module.exports = Enums;