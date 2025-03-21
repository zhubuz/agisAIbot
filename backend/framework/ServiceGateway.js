/* eslint-disable no-console */
/*jslint node:true*/
let auth = require('./Auth.js'),
    responseHelper = require("./ResponseHelper.js"),
    servicesByServerTypeMapping = {
        esb: require('./BackboneServices.js')
    };

async function processRequest(req, res, serverType) {
    'use strict';
    console.log(new Date(), req.params.ServiceName, req.params.MethodName, req.header("UserToken"));
    let currentuser;
    try {
        let services = servicesByServerTypeMapping[serverType],
            result;
        if (!services) {
            throw "Unsupported server type";
        }
        currentuser = await auth.AuthRequest({
            ServiceName: req.params.ServiceName,
            MethodName: req.params.MethodName,
            UserToken: req.header("UserToken"),
            ClientKey: req.header("appkey") || req.body.appkey
        });
        if (services[req.params.ServiceName] && services[req.params.ServiceName][req.params.MethodName] && typeof services[req.params.ServiceName][req.params.MethodName] === "function") {
            result = await services[req.params.ServiceName][req.params.MethodName]({
                currentuser: currentuser,
                req: req
            });
            if (result && result.SendHtmlText) {
                responseHelper.SendHtmlText(res, result.Text);
            } else {
                responseHelper.SendData(res, result, false);
            }
        } else {
            throw "Unsupported service or method";
        }
    } catch (error) {
        console.log(new Date(), req.params.ServiceName, req.params.MethodName, req.header("UserToken"), error, req.query, req.body);
        responseHelper.SendError(res, error);
    }
}

async function processConsumerRequest(req, res) {
    await processRequest(req, res, 'pcs');
}

async function processEsbRequest(req, res) {
    await processRequest(req, res, 'esb');
}

module.exports = {
    ProcessConsumerRequest: processConsumerRequest,
    ProcessEsbRequest: processEsbRequest
};
