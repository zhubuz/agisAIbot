/*jslint node:true*/
let Enums = {
    Status: {
        Active: 0,
        Locked: 0,
        InProgress: 0,
        Archived: 0
    },
    ExecutionStatus: {
        Failed: 0,
        Success: 0
    },
    RecurrencePeriod: {
        Once: 0,
        Minutely: 0,
        Daily: 0,
        Weekly: 0,
        Monthly: 0,
        Quarterly: 0,
        SemiAnnual: 0,
        Yearly: 0,
        Anniversary: 0
    },
    ScheduleTypes: {
        GenerateTwitterSchedule: {
            ServiceName: "Twitter",
            MethodName: "GenerateTwitterSchedule"
        },
        SendSymbolTwitter: {
            ServiceName: "Twitter",
            MethodName: "SendSymbolTwitter"
        },
        FetchAndSendTwitter: {
            ServiceName: "Twitter",
            MethodName: "FetchAndSendTwitter"
        }
    }
},
util = require('./EnumsBase.js');
util.SetNames(Enums);
util.SetNames(Enums.ScheduleTypes, 'Name');

module.exports = Enums;