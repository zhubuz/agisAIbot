/*jslint node:true*/
let AuthorizationLevel = require('../enums/AuthorizationLevel.js'),
    InvokeProtocol = {
        Local: "Local",
        Http: "Http", //this includes http as well
    },
    Services = {
        Activity: {
            Description: 'Activity',
        },
        User: {
            Description: 'User',
        },
        Task: {
            Description: 'Task',
        },
        Command: {
            Description: 'Command'
        },
        Point: {
            Description: 'Point'
        },
        Worker: {
            AuthorizeLevel: AuthorizationLevel.Client,
            Description: 'Client'
        },
        Scraper: {
            AuthorizeLevel: AuthorizationLevel.User,
            Description: 'Scraper'
        },
        Twitter: {
            AuthorizeLevel: AuthorizationLevel.User,
            Description: 'Twitter'
        },
        OpenAI: {
            AuthorizeLevel: AuthorizationLevel.User,
            Description: 'OpenAI'
        },
        Schedule: {
            AuthorizeLevel: AuthorizationLevel.User,
            Description: 'Schedule'
        }
    },
    util = require('../enums/EnumsBase.js');

util.SetNames(Services, 'Name');

function loadBll(bllName) {
    "use strict";
    return require("../services/" + bllName.toLowerCase() + "/" + bllName + "Bll.js");
}

async function invokeLocal(params) {
    let methodName = params.MethodName,
        bll = loadBll(params.ServiceName),
        result;
    if (!bll) {
        throw "Bll module does not exist";
    }
    if (typeof bll[methodName] !== 'function') {
        throw methodName + " method does not exist";
    }
    result = await bll[methodName](params);
    return result;
}

async function invokeService(params) {
    let service = Services[params.ServiceName],
        invokeProtocol;
    if (!service) {
        throw "Service not exist";
    }
    invokeProtocol = service.Invoke
        ? service.Invoke.Protocol
        : InvokeProtocol.Local;
    if (invokeProtocol === InvokeProtocol.Local) {
        return await invokeLocal(params);
    }
    throw "This Protocol has not been implemented: " + invokeProtocol;
}
module.exports = {
    Services: Services,
    invokeService: invokeService
};
