/*jslint node:true*/
let FireForgetEnums = require("../../enums/FireForgetEnums.js"),
    invokeService = require("../../framework/Services.js").invokeService,
    services = require("../../framework/Services.js").Services;

function loadBll(bllName) {
    "use strict";
    return require("../../services/" + bllName.toLowerCase() + "/" + bllName + "Bll.js");
}

async function fireAndForget(params) {
    let type = FireForgetEnums.FireFogetTypes[params.TypeName],
        methodName,
        bll;
    console.log(`==> Running job ${params.TypeName} ...`);
    try {
        if (!type || !type.BllName || !type.MethodName) {
            throw 'Invalid fireAndForget type: ' + params.TypeName;
        }
        methodName = type.MethodName;
        bll = loadBll(type.BllName);
        if (!bll) {
            throw "Bll module does not exist";
        }
        if (typeof bll[methodName] !== 'function') {
            throw "Bll method does not exist";
        }
        await bll[methodName]({});
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log("fireAndForget", error);
    }
}

async function triggerGivenJob(params) {
    return await invokeService({
        ...params,
        ServiceName: services.Job.Name,
        MethodName: "TriggerGivenJob"
    });
}

module.exports = {
    FireAndForget: fireAndForget,
    TriggerGivenJob: triggerGivenJob
};