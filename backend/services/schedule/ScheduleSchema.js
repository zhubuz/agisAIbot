let BotSchema = require('../../framework/BotSchema.js'),
    DbConnections = require('../../framework/DbConnections.js'),
    ScheduleEnums = require('../../enums/ScheduleEnums.js'),
    enumUtil = require('../../enums/EnumsBase.js'),
    props = {
        ScheduleType: {type: String, enum: Object.keys(ScheduleEnums.ScheduleTypes), required: true},
        PeriodType: {type: String, enum: enumUtil.ReturnValues(ScheduleEnums.RecurrencePeriod), required: true},
        NumPeriod: {type: Number, default: 1},
        Status: {type: String, enum: Object.keys(ScheduleEnums.Status), default: ScheduleEnums.Status.Active},
        FirstTriggerDate: {type: Number},
        LatestTriggerDate: {type: Number},
        NextTriggerDate: {type: Number},
        CurrentRoundId: {type: String},
        GroupId: {type: String},
        TurkId: {type: String},
        Payload: {},
        History: [
            {
                OccurDate: {type: Number},
                RoundId: {type: String},
                Status: {type: String, enum: Object.keys(ScheduleEnums.ExecutionStatus)},
                EntityId: {type: String},
                Error: {},
                '_id': false
            }
        ]
    },
    Schedule = new BotSchema(props);
exports.Schedule = DbConnections.quantum_common.model('Schedule', Schedule, 'Schedule');