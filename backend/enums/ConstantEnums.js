/*jslint node:true*/
let Enums = {
    MILLI_SECONDS_PER_DAY: 86400000,
    MILLI_SECONDS_PER_MINUTE: 60000,
    MILLI_SECONDS_PER_HOUR: 3600000,
    SECONDS_IN_ONE_MINUTE: 60,
    NINETY_DAYS: 7776000000,
    THIRTY_DAYS: 2592000000,
    SEVEN_DAYS: 604800000,
    SECONDS_IN_ONE_HOUR: 3600,
    SECONDS_IN_TWENTY_FOUR_HOURS: 86400,
    SECONDS_IN_SEVEN_DAYS: 604800,
    SECONDS_THIRTY_DAYS: 2592000,
    REDIS_RETRY_TIME: 3600000,
    LAST_HOUR_OF_DAY: 23,
    LAST_MINUTE_OF_HOUR: 59,
    LAST_SECOND_OF_MINUTE: 59,
    LAST_MILISECOND_OF_SECOND: 999,
    REQUEST_CONTENT_LENGTH: 256000,
    DAYS_IN_WEEK: 7,
    DAYS_IN_YEAR: 365,
    THE_BEGINNING_OF_THE_EPOCH: new Date(0),
    DEFAULT_TIMEZONE: "America/Chicago",
    MILIS_IN_TWELEVE_HOURS: 3600 * 1000 * 12,
    PROVISION_USER_ID: "",
    GLOBAL_ADMIN_GROUP_ID: "5200fc6c-caef-4f4f-8d09-d1a14bf976a4",
    GLOBAL_ADMIN_GROUP_NAME: {
        en: "Activate Admin"
    },
    DefaultNoteRequestType: "Change Request",
    DefaultAdminHost: 'https://devportal.activate.dev',
    AdminHostByEnv: {
        dev: "https://devportal.activate.dev",
        uat: "https://uatportal.activate.dev",
        demo: "https://demoportal.activate.dev",
        prod: "https://portal.activate.dev"
    },
    LANGUAGES: {
        English: "English",
        Spanish: "Spanish"
    },
    MultiLanguageStringType: {
        en: {type: String},
        es: {type: String}
    },
    Languages: {
        es: 'es',
        en: 'en',
        Both: 'Both'
    },
    ALL_GROUPS: "All",
    NAMESPACE: {
        Activate: "Activate"
    },
    TRUE: 'true',
    FALSE: 'false',
    EmptyValue: "EmptyValue",
    DateUnit: {
        Forever: "Forever",
        Day: "Day",
        Month: "Month",
        Week: "Week",
        Season: "Season",
        Quarter: "Quarter",
        Year: "Year"
    },
    TimeUnit: {
        YearToDate: "YearToDate",
        WTD: "WTD",
        MTD: "MTD",
        Today: "Today"
    },
    SortOrder: {
        ASC: 1,
        DES: -1,
        DESC: -1
    },
    DayOfWeek: {
        Sunday: "Sunday",
        Monday: "Monday",
        Tuesday: "Tuesday",
        Wednesday: "Wednesday",
        Thursday: "Thursday",
        Friday: "Friday",
        Saturday: "Saturday"
    },
    Months: {
        January: 1,
        February: 2,
        March: 3,
        April: 4,
        May: 5,
        June: 6,
        July: 7,
        August: 8,
        September: 9,
        October: 10,
        November: 11,
        December: 12
    },
    Period: {
        Day: "Day",
        Week: "Week",
        Month: "Month",
        Quarter: "Quarter",
        Year: "Year"
    }
};
module.exports = Enums;