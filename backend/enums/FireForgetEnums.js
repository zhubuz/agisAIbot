/*jslint node:true*/
let Enums = {
    FireFogetTypes: {
        TriggerDueJobs: {
            BllName: "Job",
            MethodName: "TriggerDueJobs",
            Timeout: 30//in seconds
        },
        PerformScheduledTasks: {
            BllName: "Schedule",
            MethodName: "PerformScheduledTasks",
            Timeout: 30//in seconds
        },
        DispatchEmails: {
            BllName: "Notification",
            MethodName: "DispatchEmails",
            Timeout: 30//in seconds
        },
        ProcessEventBusItems: {
            BllName: "EventBus",
            MethodName: "ProcessEventBusItems",
            Timeout: 30//in seconds
        },
        UnlockEventBusItems: {
            BllName: "EventBus",
            MethodName: "UnlockEventBusItems",
            Timeout: 30//in seconds
        },
        TwitterScraper: {
            BllName: "Scraper",
            MethodName: "TwitterScraper",
            Timeout: 90//in seconds
        },
        SendTwitter: {
            BllName: "Twitter",
            MethodName: "SendTwitter",
            Timeout: 90//in seconds
        }
    }
};
require('./EnumsBase.js').SetNames(Enums);
require('./EnumsBase.js').SetNames(Enums.FireFogetTypes, 'Name');

module.exports = Enums;