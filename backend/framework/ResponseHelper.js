/*jslint node:true*/
let translationKeys = {
    en: require("../enums/EnglishKeys.js")
};

function getIPAdress(request) {
    let retval = "",
        headers = 'headers',
        socket = 'socket',
        remoteAddress = 'remoteAddress';
    if (request[headers] && request[headers]["x-forwarded-for"]) {
        retval = request[headers]["x-forwarded-for"];
    } else if (request[socket] && request[socket][remoteAddress]) {
        retval = request[socket][remoteAddress];
    } else if (request[socket] && request[socket][socket] && request[socket][socket][remoteAddress]) {
        retval = request[socket][socket][remoteAddress];
    }
    return retval;
}

function getDeviceType(header) {
    let userAgent = 'user-agent';
    if (/(iPhone|iPad|iPod|iOS)/i.test(header[userAgent])) {
        return 'IOS';
    }
    if (/(Android)/i.test(header[userAgent])) {
        return 'Android';
    }
    return 'PCBrowser';
}

function contentTypeData(res, contentTypeHeader, contentTypeValue) {
    'use strict';
    res.set(contentTypeHeader, contentTypeValue);
}

function sendError(res, error, languageIndex) {
    'use strict';
    let str = error.toString(),
        mytranslationKeys = translationKeys.en;
    contentTypeData(res, 'Error', encodeURI(str));
    contentTypeData(res, 'Content-Type', 'text/html;charset=utf-8');
    res.send(mytranslationKeys && mytranslationKeys[str] || str);
}

function sendHtmlText(res, text) {
    contentTypeData(res, 'Content-Type', 'text/html;charset=utf-8');
    res.send(text);
}

function applyLanguagePaddingToNode(node) {
    if (node.en && typeof node.en === 'string' && !node.es) {
        node.es = node.en;
    }
    if (node.es && typeof node.es === 'string' && !node.en) {
        node.en = node.es;
    }
}

function padLanguageString(doc) {
    Object.keys(doc).forEach((key) => {
        let child = doc[key];
        if (child && typeof child === "object") {
            applyLanguagePaddingToNode(child);
            padLanguageString(child);
        }
    });
    return doc;
}

// eslint-disable-next-line max-params
function sendData(res, data, asIs, languageIndex) {
    'use strict';
    let mytranslationKeys = translationKeys[languageIndex] || translationKeys.en,
        obj;
    contentTypeData(res, 'Cache-Control', 'no-cache, must-revalidate');
    if (asIs) {
        res.send(data);
    } else if (typeof data === "string") {
        res.send({
            message: mytranslationKeys[data] || data
        });
    } else if (typeof data === "object") {
        obj = JSON.parse(JSON.stringify(data));
        if (obj && !obj.KeepLanguage) {
            padLanguageString(obj);
        }
        if (obj && obj._Headers) {
            Object.keys(obj._Headers).forEach((key) => {
                contentTypeData(res, key, obj._Headers[key]);
            });
            delete obj._Headers;
        }
        res.send({
            data: obj
        });
    } else {
        res.send({
            data: data
        });
    }
}

module.exports = {
    SendData: sendData,
    SendHtmlText: sendHtmlText,
    SendError: sendError,
    PadLanguageString: padLanguageString,
    GetIPAdress: getIPAdress,
    GetDeviceType: getDeviceType
};