/* eslint-disable no-path-concat */
/*jslint node:true*/

let P8MigrationFile = function () {
    'use strict';
    const SchemaPack = require("../../../backend/framework/SchemaPack.js"),
        ScheduleEnums = require("../../../backend/enums/ScheduleEnums.js"),
        invokeService = require("../../../backend/framework/Services.js").invokeService,
        guid = require('uuid');

    async function saveTwitter(params) {
        let items = require("/Users/oceandutt/Downloads/dataset_twitter-scraper-task_2025-01-19_15-04-09-602.json");
        await Promise.all(items.map(async (item) => {
            await SchemaPack.ApifyTwitter.findOneAndUpdate({
                id: item.id
            }, {
                $set: item,
                $setOnInsert: {
                    btId: guid.v1()
                }
            }, {
                new: true,
                upsert: true
            });
    }));
    }

    async function exportTwitter(params) {
        let twitters = await SchemaPack.ApifyTwitter.find({
            TwitterText: {$exists: true}
        }),
            res = ["Twitter, Source"]
        twitters.forEach(t => {
            res.push(`"${t.TwitterText}","${t.fullText}"`);
        });
        require("fs").writeFileSync("./test.csv", res.join("\n"));
    }

    async function setSchedule(params) {
        await invokeService({
            ScheduleType: ScheduleEnums.ScheduleTypes.GenerateTwitterSchedule.Name,
            PeriodType: ScheduleEnums.RecurrencePeriod.Once,
            FirstTriggerDate: Date.now() + 300000,
            NumPeriod: 1,
            UserId: "",
            ServiceName: "Schedule",
            MethodName: "CreateSchedule"
        });
    }
    
    this.Run = async function (callback) {
        try {
            // await saveTwitter();
            // await exportTwitter();
            await setSchedule();
            return callback();
        } catch (error) {
            return callback(error);
        }
    };
};

module.exports = new P8MigrationFile();
// node deploy/migrateEtl.js --env local --f releases/r1.0.0/etl.js