/*jslint node:true*/
let SchemaPack = require("../../framework/SchemaPack.js"),
    ScheduleEnums = require('../../enums/ScheduleEnums.js'),
    enumUtil = require('../../enums/EnumsBase.js'),
    guid = require('uuid');

function resolveNextTriggerDate(params) {
    let nextTriggerDate = params.NextTriggerDate,
        dateObject = new Date(nextTriggerDate);
    if (!params.PeriodType || enumUtil.ReturnValues(ScheduleEnums.RecurrencePeriod).indexOf(params.PeriodType) === -1 || params.PeriodType === ScheduleEnums.RecurrencePeriod.Once) {
        return 0;
    }
    if (!nextTriggerDate) {
        //has not invoked for the first time
        //Same as recurrence.PeriodType = Once
        nextTriggerDate = params.FirstTriggerDate;
        return nextTriggerDate;
    }
    switch (params.PeriodType) {
    case ScheduleEnums.RecurrencePeriod.Minutely:
        nextTriggerDate += 60 * 1000 * (params.NumPeriod || 1);
        break;
    case ScheduleEnums.RecurrencePeriod.Daily:
        nextTriggerDate += 24 * 3600 * 1000;
        break;
    case ScheduleEnums.RecurrencePeriod.Weekly:
        nextTriggerDate += 7 * 24 * 3600 * 1000 * (params.NumPeriod || 1);
        // nextTriggerDate += 300 * 1000 * (params.NumPeriod || 1);
        break;
    case ScheduleEnums.RecurrencePeriod.Monthly:
        dateObject.setMonth(dateObject.getMonth() + (params.NumPeriod || 1));
        nextTriggerDate = dateObject.getTime();
        break;
    case ScheduleEnums.RecurrencePeriod.Quarterly:
        dateObject.setMonth(dateObject.getMonth() + 3);
        nextTriggerDate = dateObject.getTime();
        break;
    case ScheduleEnums.RecurrencePeriod.SemiAnnual:
        dateObject.setMonth(dateObject.getMonth() + 6);
        nextTriggerDate = dateObject.getTime();
        break;
    case ScheduleEnums.RecurrencePeriod.Yearly:
        dateObject.setYear(dateObject.getFullYear() + 1);
        nextTriggerDate = dateObject.getTime();
        break;
    default:
        dateObject.setYear(dateObject.getFullYear() + 1);
        nextTriggerDate = dateObject.getTime();
        break;
    }
    return nextTriggerDate;
}

async function getDueSchedules(params) {
    'use strict';
    let schedules = await SchemaPack.Schedule.find({
        Status: ScheduleEnums.Status.Active,
        NextTriggerDate: {
            $lte: params.NowStamp
        }
    }).
        limit(100).
        exec();
    await SchemaPack.Schedule.updateMany({
        btId: schedules.map((s) => s.btId)
    }, {
        $set: {
            Status: ScheduleEnums.Status.InProgress
        }
    }).exec();
    return schedules;
}

async function postExecution(params) {
    let schedule = params.Schedule,
        latestTriggerDate = schedule.NextTriggerDate,
        nextTriggerDate = resolveNextTriggerDate(schedule),
        status;
    if (params.ExecutionStatus === ScheduleEnums.ExecutionStatus.Success) {
        status = schedule.PeriodType === ScheduleEnums.RecurrencePeriod.Once
            ? ScheduleEnums.Status.Archived
            : ScheduleEnums.Status.Active;
    } else {
        status = ScheduleEnums.Status.Archived;
    }
    await SchemaPack.Schedule.updateOne({
        btId: schedule.btId,
        Status: {
            $in:[ScheduleEnums.Status.Active, ScheduleEnums.Status.InProgress]
        }
    }, {
        $set: {
            CurrentRoundId: params.RoundId,
            NextTriggerDate: nextTriggerDate,
            LatestTriggerDate: latestTriggerDate,
            Status: status
        },
        $push: {
            History: {
                $each: [
                    {
                        OccurDate: Date.now(),
                        RoundId: params.RoundId,
                        Status: params.ExecutionStatus,
                        EntityId: schedule.EntityId,
                        Error: params.Error
                    }
                ],
                $slice: -100
            }
        }
    }).exec();
}

async function createSchedule(params) {
    'use strict';
    let now = Date.now(),
        schedule;
    if (!params.FirstTriggerDate) {
        throw "schl.mft";
    }
    if (params.FirstTriggerDate > now) { //hasn't triggerred for the first time
        params.NextTriggerDate = params.FirstTriggerDate;
    } else {
        params.LatestTriggerDate = params.FirstTriggerDate;
        params.NextTriggerDate = resolveNextTriggerDate(params);
    }
    params.CurrentRoundId = guid.v1();
    params.History = [
        {
            RecDate: now,
            RoundId: params.CurrentRoundId
        }
    ];
    schedule = new SchemaPack.Schedule(params);
    schedule.btId = guid.v1();
    schedule.CreatedBy = params.UserId;
    schedule.ModifiedBy = params.UserId;
    schedule.GroupId = params.GroupId;
    await schedule.save();
    return schedule.toObject();
}

async function createSchedules(params) {
    await Promise.all(params.Schedules.map(async (schedule) => {
        await createSchedule(schedule);
    }));
}

async function cancelSchedule(params) {
    'use strict';
    let condition = {
        EntityId: params.EntityId,
        Status: {
            $in:[ScheduleEnums.Status.Active, ScheduleEnums.Status.InProgress]
        }
    };
    if (params.ScheduleType) {
        condition.ScheduleType = params.ScheduleType;
    }
    await SchemaPack.Schedule.updateMany(condition, {
        $set: {
            Status: ScheduleEnums.Status.Archived
        }
    }).exec();
}

async function cancelSchedules(params) {
    await Promise.all(params.EntityIds.map(async (entityId) => {
        await cancelSchedule({
            EntityId: entityId,
            ScheduleType: params.ScheduleType
        });
    }));
}


module.exports = {
    CreateSchedule: createSchedule,
    CreateSchedules: createSchedules,
    CancelSchedule: cancelSchedule,
    CancelSchedules: cancelSchedules,
    GetDueSchedules: getDueSchedules,
    PostExecution: postExecution
};