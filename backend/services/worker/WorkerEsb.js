/*jslint node:true*/
let FireForgetEnums = require("../../enums/FireForgetEnums.js");

async function dispatchEmails() {
    'use strict';
    await require("./WorkerBll.js").FireAndForget({
        TypeName: FireForgetEnums.FireFogetTypes.DispatchEmails.Name
    });
    return 'dispatchEmails';
}

function processEventBusItems() {
    'use strict';
    require("./WorkerBll.js").FireAndForget({
        TypeName: FireForgetEnums.FireFogetTypes.ProcessEventBusItems.Name
    });
    return 'processEventBusItems submitted';
}

function unlockEventBusItems() {
    'use strict';
    require("./WorkerBll.js").FireAndForget({
        TypeName: FireForgetEnums.FireFogetTypes.UnlockEventBusItems.Name
    });
    return "unlockEventBusItems submitted";
}

async function performScheduledTasks() {
    'use strict';
    await require("./WorkerBll.js").FireAndForget({
        TypeName: FireForgetEnums.FireFogetTypes.PerformScheduledTasks.Name
    });
    return "processScheduleTask submitted";
}

function triggerDueJobs() {
    'use strict';
    require("./WorkerBll.js").FireAndForget({
        TypeName: FireForgetEnums.FireFogetTypes.TriggerDueJobs.Name
    });
    return "triggerDueJobs submitted";
}

async function triggerGivenJob(params) {
    'use strict';
    await require("./WorkerBll.js").TriggerGivenJob({
        JobName: params.req.query.jn
    });
    return "triggerGivenJob done";
}

function twitterScraper() {
    'use strict';
    require("./WorkerBll.js").FireAndForget({
        TypeName: FireForgetEnums.FireFogetTypes.TwitterScraper.Name
    });
    return "triggerDueJobs submitted";
}

function sendTwitter() {
    'use strict';
    require("./WorkerBll.js").FireAndForget({
        TypeName: FireForgetEnums.FireFogetTypes.SendTwitter.Name
    });
    return "triggerDueJobs submitted";
}

module.exports = {
    DispatchEmails: dispatchEmails,
    ProcessEventBusItems: processEventBusItems,
    UnlockEventBusItems: unlockEventBusItems,
    PerformScheduledTasks: performScheduledTasks,
    TriggerDueJobs: triggerDueJobs,
    TriggerGivenJob: triggerGivenJob,
    TwitterScraper: twitterScraper,
    SendTwitter: sendTwitter
};