/* eslint-disable no-console */
/*jslint node:true*/
const { invokeService, Services } = require("../../framework/Services");

let scheduleProcessor = require("./ScheduleProcessor.js"),
    ScheduleEnums = require('../../enums/ScheduleEnums.js'),
    guid = require('uuid');

async function performOneScheduledTask(schedule) {
    "use strict";
    let scheduleType = ScheduleEnums.ScheduleTypes[schedule.ScheduleType],
        roundId = guid.v1();
    try {
        schedule.CurrentRoundId = guid.v1();
        if (!scheduleType || !scheduleType.ServiceName || !scheduleType.MethodName) {
            throw 'Invalid schedule type: ' + schedule.ScheduleType;
        }
        await invokeService({
            ServiceName: scheduleType.ServiceName,
            MethodName: scheduleType.MethodName,
            Schedule: schedule
        });
        await scheduleProcessor.PostExecution({
            Schedule: schedule,
            ExecutionStatus: ScheduleEnums.ExecutionStatus.Success,
            RoundId: roundId
        });
    } catch (error) {
        console.log(error);
        await scheduleProcessor.PostExecution({
            Schedule: schedule,
            ExecutionStatus: ScheduleEnums.ExecutionStatus.Failed,
            Error: error,
            RoundId: roundId
        });
        throw error;
    }
}

async function performScheduledTasks() {
    "use strict";
    let schedules = await scheduleProcessor.GetDueSchedules({
        NowStamp: process.env.FORCE_DATE
            ? new Date(process.env.FORCE_DATE).getTime()
            : Date.now()
    });
    await Promise.all(schedules.map(async (schedule) => {
        await performOneScheduledTask(schedule);
    }));
}

module.exports = {
    CreateSchedule: scheduleProcessor.CreateSchedule,
    CreateSchedules: scheduleProcessor.CreateSchedules,
    CancelSchedule: scheduleProcessor.CancelSchedule,
    CancelSchedules: scheduleProcessor.CancelSchedules,
    PerformScheduledTasks: performScheduledTasks
};