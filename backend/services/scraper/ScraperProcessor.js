/*jslint node:true*/
let SchemaPack = require("../../framework/SchemaPack.js"),
    guid = require('uuid');

async function saveApifyTwitter(params) {
    let res = await SchemaPack.ApifyTwitter.findOneAndUpdate({
        id: params.id
    }, {
        $set: params,
        $setOnInsert: {
            btId: guid.v1()
        }
    }, {
        new: true,
        upsert: true
    });
    return res;
}

async function getLastTwitter(params) {
    let twitter = await SchemaPack.ApifyTwitter.findOne({
        fullText: {$exists: true},
        IsSended: {$ne: true}
    }).sort({_id: -1});
    return twitter;
}

async function setSendTwitter(params) {
    let twitter = await SchemaPack.ApifyTwitter.findOneAndUpdate({
        id: params.id
    }, {
        $set: {
            TwitterText: params.TwitterText,
            IsSended: true
        }
    });
    return twitter;
}

module.exports = {
    SaveApifyTwitter: saveApifyTwitter,
    GetLastTwitter: getLastTwitter,
    SetSendTwitter: setSendTwitter
};
