/*jslint node:true*/
let BotSchema = require('../../framework/BotSchema.js'),
    DbConnections = require('../../framework/DbConnections.js'),
    props = {
        BotUserId: {type: String},
        IsBot: {type: Boolean},
        FirstName: {type: String},
        LastName: {type: String},
        UserName: {type: String},
        LastCheckInDate: {type: Number},
        ContinuousCheckIn: {type: Number},
        LanguageCode: {type: String}
    },
    UserSchema = new BotSchema(props);
exports.User = DbConnections.quantum_common.model('User', UserSchema, 'User');