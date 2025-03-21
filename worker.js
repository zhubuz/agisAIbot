/*jslint node:true*/
let keystore = require("./backend/configurations/keystore.js"),
    config = require("./backend/configurations/config.js"),
    clientkey = keystore.WorkerClientKey,
    protocol = config.protocol,
    request = require('request'),
    esbUrl = config.esbUrl,
    pingWorkerService = function (params) {
        "use strict";
        let url = esbUrl + 'esb/Worker/' + params.MethodName,
            headers = {appkey: clientkey},
            options = {
                url: url,
                headers: headers
            };
        console.log('url', url, headers);
        setInterval(function () {
            request(options, function (error, response, body) {
                if (error) {
                    console.log(error);
                    // require("./backend/business/NotificationBll.js").Notify({
                    //     Data: {
                    //         Error: 'Worker backend error' + err
                    //     },
                    //     NotificationType: "BackendException"
                    // });
                }
                if (!response || !body) {
                    console.log(response, body);
                }
            });
        }, params.NumSeconds * 1000);
    },
    dispatchEmailsFromQueue = function () {
        "use strict";
        pingWorkerService({
            MethodName: "DispatchEmails",
            NumSeconds: config.DispatchEmailInterval
        });
    },
    performScheduledTasks = function () {
        "use strict";
        pingWorkerService({
            MethodName: "PerformScheduledTasks",
            NumSeconds: config.PerformScheduledTasksInterval
        });
    },
    processEventBusItems = function () {
        "use strict";
        pingWorkerService({
            MethodName: "ProcessEventBusItems",
            NumSeconds: config.ProcessEventBusItemInterval
        });
    },
    // unlockEventBusItems = function () {
    //     "use strict";
    //     pingWorkerService({
    //         MethodName: "UnlockEventBusItems",
    //         NumSeconds: config.ProcessEventBusItemInterval
    //     });
    // },
    triggerDueJobs = function () {
        "use strict";
        pingWorkerService({
            MethodName: "TriggerDueJobs",
            NumSeconds: config.TriggerJobInterval
        });
    },
    twitterScraper = function () {
        "use strict";
        pingWorkerService({
            MethodName: "TwitterScraper",
            NumSeconds: 3600
        });
    };
    sendTwitter = function () {
        "use strict";
        pingWorkerService({
            MethodName: "SendTwitter",
            NumSeconds: 60
        });
    };


// triggerDueJobs();
// dispatchEmailsFromQueue();
// processEventBusItems();
// unlockEventBusItems();
performScheduledTasks();
twitterScraper()
// sendTwitter()

