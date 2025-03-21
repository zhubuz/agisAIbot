/*jslint node:true*/
/*jslint regexp: true */
'use strict';

let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?\^_`{|}~.\-]+@[a-z0-9]([a-z0-9\-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9\-]*[a-z0-9])?)*$/i,
    PHONE_REGEXP = /^[1][1,2,3,4,5,6,7,8,9][0-9]{9}$/,
    ///^([\w\.%\+\-\']+)@([\w\-]+\.)+([\w]{2,})$/i,
    USERNAME_REGEXP = /^['\/+-_@.a-zA-Z0-9]*$/,
    ALPHABET_DOT_SPACE_DASH = /^([a-zA-Z\ \_\-\:\.]+)$/,
    NUMERIC = /^[0-9]+$/,
    moment = require('moment-timezone'),
    ConstantEnums = require('../enums/ConstantEnums.js');

function getLastDigits(number, digits) {
    let numberString = number.toString();
    return numberString.substr(numberString.length - digits);
}

function isString(obj) {
    return Reflect.apply(toString, obj, []) === '[object String]';
}
function isInteger(obj) {
    return obj === parseInt(obj, 10);
}
function isNumeric(obj) {
    return NUMERIC.test(obj);
}
function isPositiveNumber(obj) {
    if (!obj) {
        return false;
    }
    // technically 0 is not a positive number, but this method is currently used for numbers greater than 0
    return !(obj && (!isNumeric(obj) || obj < 0));
}
function IsFunction(param) {
    return param && param instanceof Function;
}
function isValidUserName(params) {
    return new RegExp(USERNAME_REGEXP).test(params);
}
function isValidEmail(params) {
    return new RegExp(EMAIL_REGEXP).test(params);
}
function isValidPhoneNumber(number) {
    return new RegExp(PHONE_REGEXP).test(number);
}
function hidePhoneNumber(number) {
    if (!new RegExp(PHONE_REGEXP).test(number)) {
        return number;
    }
    return number.substr(0,3) + "********";
}
function isValidDate(params) {
    let testDate = new Date(params);
    if (!params || params === '') {
        return false;
    }
    return testDate.toString().indexOf('Invalid Date') === -1 && Reflect.apply(toString, testDate, []) === '[object Date]';
}
function isLeapYear(params) {
    let year = new Date(params).GetFullYear();
    return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
}
function capitalizeFirstLetter(value) {
    return value && value !== ''
        ? value.charAt(0).toUpperCase() + value.slice(1)
        : '';
}
function lowercaseObjectKey(object) {
    var newObject = {};
    Object.keys(object).forEach(function (item) {
        newObject[item.toLowerCase()] = object[item];
    });
    return newObject;
}
function getDaysInMonth(iMonth, iYear) {
    return 32 - new Date(iYear, iMonth, 32).getDate();
}

function escapeBadChars(text) {
    let st = String(text).replace(new RegExp('[\\\\+?~\\[\\^\\]$(){}\/=!<>’|:]', 'g'), '');
    return st.replace(/\*/g, "\\*");
}

function formatDate(x, y) {
    var z = {
            M: x.getMonth() + 1,
            d: x.getDate(),
            h: x.getHours(),
            m: x.getMinutes(),
            s: x.getSeconds()
        },
        y1;
    y1 = y.replace(/(M+|d+|h+|m+|s+)/g, function (v) {
        return ((v.length > 1
            ? "0"
            : "") + z[v.slice(-1)]).slice(-2);
    });
    return y1.replace(/(y1+)/g, function (v) {
        return x.getFullYear().toString().
            slice(-v.length);
    });
}
// '1920-3-03' to '-03-03'
function dateTransform(date) {
    let dateArray = date.split('-');
    if (dateArray.length < 3) {
        return null;
    }
    for (let i = 1; i < 3; i += 1) {
        if (dateArray[i].length < 2) {
            dateArray[i] = '0' + dateArray[i];
        }
    }

    return '-' + dateArray[1] + '-' + dateArray[2];
}

function generateRandomPassword() {
    return Math.random().toString(36).
        slice(-12);
}

function calculateQuartile(quartValue, array) {
    var len,
        v;
    if (!array.length) {
        return 0;
    }
    len = array.length - 1;
    v = [
        Math.floor(len * quartValue),
        Math.ceil(len * quartValue)
    ];
    return (array[v[0]] + array[v[1]]) / 2;
}
function removeEOF(value) {
    return value
        // eslint-disable-next-line no-control-regex
        ? value.replace(/\u001a/g, '')
        : '';
}
function getFileExtension(filePath) {
    var filePathArray, fileName;
    if (!filePath) {
        return "";
    }
    filePathArray = filePath.split("/");
    fileName = filePathArray[filePathArray.length - 1].split(".");
    return fileName.length === 2
        ? fileName[1]
        : '';
}

function formatFileExtension(suffix) {
    if (!suffix) {
        return "eps";
    }
    let suf = suffix.replace(".",""),
        extension = suf.toLowerCase();
    return extension.trim();
}

function getSearchField(value, includeReverse) {
    let deconstructValue = function (parameter) {
            let i = 0,
                s = "",
                v = [],
                len;
            if (!parameter) {
                return [];
            }
            len = parameter.length;
            for (i; i < len; i += 1) {
                s += parameter[i];
                if (s.length > 1) {
                    v.push(s);
                }
            }
            return v;
        },
        reverseWordArray = [],
        reverseWord,
        value1 = value.toLowerCase();
    if (includeReverse) {
        reverseWordArray = value1.split(" ");
        if (reverseWordArray.length > 1) {
            reverseWordArray = reverseWordArray.reverse();
            reverseWord = reverseWordArray.join(" ");
        }
    }
    return includeReverse
        ? Array.prototype.concat(deconstructValue(value), deconstructValue(reverseWord))
        : deconstructValue(value);
}
function getUserSearchField(fullName, preferredName, includeReverse) {
    return preferredName
        ? Array.prototype.concat(getSearchField(fullName, includeReverse), getSearchField(preferredName))
        : getSearchField(fullName);
}
function hmsToSeconds(hms) {
    let a = hms.split(':');
    return Number(a[0]) * 60 * 60 + Number(a[1]) * 60 + Number(a[2]);
}

function parseArray(stArray) {
    if (!stArray || !stArray.length) {
        return [];
    }
    return JSON.parse(stArray);
}

function fetchFromObject(obj, prop) {
    if (typeof obj === 'undefined') {
        return false;
    }
    // eslint-disable-next-line no-underscore-dangle
    let _index = prop.indexOf('.');
    if (_index > -1) {
        return fetchFromObject(obj[prop.substring(0, _index)], prop.substr(_index + 1));
    }
    return obj[prop];
}
function caseInsensitiveRegex(str) {
    let cleanStr = str
        ? str
        : "";
    return new RegExp('^' + cleanStr.trim() + '$', "i");
}
function fuzzy(str) {
    let fuzzyStr = str;
    if (str.length) {
        fuzzyStr = str.replace(/~/g, '').split("").
            reduce(function (a, b) {
                return a + '[^' + b + ']*' + b;
            });
    }
    return fuzzyStr;
}

function getDayAHourMinute(params) {
    let timestamp = params.TimeStamp || Date.now(),
        timezone = params.TimeZone || ConstantEnums.DEFAULT_TIMEZONE,
        momentTime,
        year,
        month,
        date,
        dayStart;
    moment.tz.setDefault(timezone);
    momentTime = moment(timestamp);
    year = momentTime.year();
    month = momentTime.month();
    date = momentTime.date();
    dayStart = moment([year, month, date, params.Hour || 0, params.Minute || 0]).valueOf();
    if (params.DayBefore) {
        dayStart -= (parseInt(params.DayBefore, 10) - 1) * ConstantEnums.MILLI_SECONDS_PER_DAY;
    }
    return dayStart;
}

function getDayStart(params) {
    let timeStamp = params.TimeStamp || Date.now(),
        timeZone = params.TimeZone || ConstantEnums.DEFAULT_TIMEZONE,
        momentTime,
        year,
        month,
        date,
        dayStart;
    moment.tz.setDefault(timeZone);
    momentTime = moment(timeStamp);
    year = momentTime.year();
    month = momentTime.month();
    date = momentTime.date();
    dayStart = moment([year, month, date, 0]).valueOf();
    if (params.DayBefore) {
        dayStart -= (parseInt(params.DayBefore, 10) - 1) * ConstantEnums.MILLI_SECONDS_PER_DAY;
    }
    return dayStart;
}


function getDateBucket(timeStamp, offset, format) {
    let timeZone = ConstantEnums.DEFAULT_TIMEZONE,
        offsetTime = timeStamp,
        momentTime,
        year,
        month,
        date,
        strDate;
    if (offset) {
        offsetTime += ConstantEnums.MILLI_SECONDS_PER_DAY * offset;
    }
    moment.tz.setDefault(timeZone);
    momentTime = moment(offsetTime);
    year = momentTime.year();
    month = momentTime.month() + 1;
    date = momentTime.date();
    if (format) {
        strDate = year.toString();
        strDate = month < 10
            ? `${strDate}-0${month}`
            : `${strDate}-${month}`;
        strDate = date < 10
            ? `${strDate}-0${date}`
            : `${strDate}-${date}`;
        return strDate;
    }
    strDate = year.toString() + "-" + month.toString() + "-" + date.toString();
    return strDate;
}

function getWeekDateBucket(params) {
    let timeZone = ConstantEnums.DEFAULT_TIMEZONE,
        momentTime,
        year,
        month,
        date,
        dayOfWeek,
        strDate,
        weekstartTs;
    moment.tz.setDefault(timeZone);
    momentTime = moment(params.TimeStamp);
    dayOfWeek = momentTime.day();
    if (dayOfWeek) {
        weekstartTs = params.TimeStamp - ConstantEnums.MILLI_SECONDS_PER_DAY * (dayOfWeek - 1 - params.Offset * 7);
    } else {
        weekstartTs = params.TimeStamp - ConstantEnums.MILLI_SECONDS_PER_DAY * (6 - params.Offset * 7);
    }
    momentTime = moment(weekstartTs);
    year = momentTime.year();
    month = momentTime.month();
    date = momentTime.date();
    strDate = year.toString() + "-" + (month + 1).toString() + "-" + date.toString();
    return strDate;
}

function getMonthDateBucket(params) {
    let timeZone = ConstantEnums.DEFAULT_TIMEZONE,
        momentTime,
        year,
        month,
        strDate,
        offsetDate = new Date(params.TimeStamp),
        timeStamp;
    if (params.Offset) {
        month = offsetDate.getMonth() + params.Offset;
        offsetDate.setMonth(month);
    }
    timeStamp = offsetDate.getTime();
    moment.tz.setDefault(timeZone);
    momentTime = moment(timeStamp);
    year = momentTime.year();
    month = momentTime.month();
    strDate = year.toString() + "-" + (month + 1).toString();
    return strDate;
}

function getQuarterDateBucket(params) {
    let timeZone = params.Timezone || ConstantEnums.DEFAULT_TIMEZONE,
        momentTime,
        year,
        month,
        strDate,
        offsetDate = new Date(params.TimeStamp),
        timeStamp,
        quarter;
    if (params.Offset) {
        month = offsetDate.getMonth() + (params.Offset * 3);
        offsetDate.setMonth(month);
    }
    timeStamp = offsetDate.getTime();
    moment.tz.setDefault(timeZone);
    momentTime = moment(timeStamp);
    year = momentTime.year();
    month = momentTime.month();
    quarter = Math.floor(month / 3) + 1;
    strDate = `Q${quarter.toString()} ${year.toString()}`;
    return strDate;
}

function getYearDateBucket(params) {
    let timeZone = ConstantEnums.DEFAULT_TIMEZONE,
        momentTime,
        year,
        month,
        strDate,
        offsetDate = new Date(params.TimeStamp),
        timeStamp;
    if (params.Offset) {
        month = offsetDate.getMonth() + params.Offset;
        offsetDate.setMonth(month);
    }
    timeStamp = offsetDate.getTime();
    moment.tz.setDefault(timeZone);
    momentTime = moment(timeStamp);
    year = momentTime.year();
    month = momentTime.month();
    strDate = year.toString();
    return strDate;
}

function getDateBucketByType(params) {
    let offset = params.Offset || 0,
        timeStamp = params.TimeStamp || Date.now(),
        dateBucketType = params.DateBucketType || "Day";
    if (dateBucketType === "Day") {
        return getDateBucket(timeStamp, offset);
    } else if (dateBucketType === "Week") {
        return getWeekDateBucket({
            TimeStamp: timeStamp,
            Offset: offset
        });
    } else if (dateBucketType === "Month") {
        return getMonthDateBucket({
            TimeStamp: timeStamp,
            Offset: offset
        });
    } else if (dateBucketType === "Quarter") {
        return getQuarterDateBucket({
            TimeStamp: timeStamp,
            Offset: offset
        });
    } else if (dateBucketType === "Year") {
        return getYearDateBucket({
            TimeStamp: timeStamp,
            Offset: offset
        });
    }
    return '';
}

function getDateString(timeStamp, timeZone) {
    let tz = timeZone || ConstantEnums.DEFAULT_TIMEZONE,
        momentTime,
        year,
        month,
        date,
        hour,
        minute,
        second,
        strDate;
    moment.tz.setDefault(tz);
    momentTime = moment(timeStamp);
    year = momentTime.year();
    month = momentTime.month();
    date = momentTime.date();
    hour = momentTime.hour();
    minute = momentTime.minute();
    second = momentTime.second();
    strDate = `${year.toString()}-${(month + 1).toString()}-${date.toString()} ${hour.toString()}:${minute.toString()}:${second.toString()}`;
    return strDate;
}

function numberToString(number) {
    if (number < 10) {
        return `0${number.toString()}`;
    }
    return number.toString();
}

function getWxDateString(timeStamp, timeZone) {
    let tz = timeZone || ConstantEnums.DEFAULT_TIMEZONE,
        momentTime,
        year,
        month,
        date,
        hour,
        minute,
        strDate;
    moment.tz.setDefault(tz);
    momentTime = moment(timeStamp);
    year = momentTime.year();
    month = momentTime.month();
    date = momentTime.date();
    hour = momentTime.hour();
    minute = momentTime.minute();
    strDate = `${numberToString(year)}-${numberToString(month + 1)}-${numberToString(date)} ${numberToString(hour)}:${numberToString(minute)}`;
    return strDate;
}

function resolvePromise(term, fn, params) {
    if (term) {
        return fn(params);
    }
    return Promise.resolve();
}

function groupBy(array, key) {
    return array.reduce((r, a) => {
        r[a[key]] = [...r[a[key]] || [], a];
        return r;
    }, {});
}

function buildSerialNumber(friendlyId, timestamp, timeZone) {
    const NUMBER_LENGTH = 10,
        headStr = '0000000000';
    let tz = timeZone || ConstantEnums.DEFAULT_TIMEZONE,
        momentTime,
        year,
        month,
        date,
        strDate,
        numStr;
    moment.tz.setDefault(tz);
    momentTime = moment(timestamp || Date.now());
    year = momentTime.year();
    month = momentTime.month();
    date = momentTime.date();
    strDate = `${year}${numberToString(month + 1)}${numberToString(date)}`;
    numStr = friendlyId.toString();
    numStr = `${headStr}${numStr}`.slice(-NUMBER_LENGTH);
    return strDate + '01' + numStr;
}

function handleWechatNoticeString(str) {
    if (typeof str !== 'string') {
        return '';
    }
    if (str.length <= 20) {
        return str;
    }
    return str.slice(0, 17) + '...';
}

function handSortNum(strArray, baseNum) {
    if (!Array.isArray(strArray)) {
        return -1;
    }
    let i = strArray.length - 1,
        result = 0,
        base = 1;
    while (i >= 0) {
        // eslint-disable-next-line radix
        result += parseInt(strArray[i]) * base;
        i -= 1;
        base *= baseNum;
    }
    return result;
}

function moneySetter (value) {
    return Math.round(value * 100) / 100;
}

function createDateBuckets(params) {
    let result = [],
        timestamp = Date.now();
    for (let i = 0; i < params.Day; i += 1) {
        result.push(getDateBucket(timestamp));
        timestamp -= ConstantEnums.MILLI_SECONDS_PER_DAY;
    }
    if (params.Reverse) {
        return result.reverse();
    }
    return result;
}

function setTimeOnDefaultTimezone(timestamp, timeArray) {
    let timeStamp = timestamp,
        timeZone = ConstantEnums.DEFAULT_TIMEZONE,
        momentTime,
        year,
        month,
        date,
        result;
    if (!timestamp) {
        return null;
    }
    moment.tz.setDefault(timeZone);
    momentTime = moment(timeStamp);
    if (!timeArray) {
        return momentTime.valueOf();
    }
    year = momentTime.year();
    month = momentTime.month();
    date = momentTime.date();
    result = moment([year, month, date].concat(timeArray)).valueOf();
    return result;
}

function getDateOnDefaultTimezone(timestamp) {
    let timeStamp = timestamp,
        timeZone = ConstantEnums.DEFAULT_TIMEZONE,
        momentTime;
    moment.tz.setDefault(timeZone);
    momentTime = moment(timeStamp);
    return {
        year: momentTime.year(),
        month: momentTime.month(),
        date: momentTime.date(),
        hour: momentTime.hour(),
        minute: momentTime.minute()
    };
}

function getScheduleDateTimestamp(params) {
    let timeZone = ConstantEnums.DEFAULT_TIMEZONE,
        dateArray,
        timeArray,
        momentTime;
    moment.tz.setDefault(timeZone);
    dateArray = params.DateString.split('-').map((d) => parseInt(d, 10));
    dateArray[1] -= 1;
    timeArray = params.Time.split(':').map((t) => parseInt(t, 10));
    momentTime = moment([...dateArray, ...timeArray]);
    return momentTime.valueOf();
}

function getDateTimestamp(params) {
    let timeZone = params.TimeZone || ConstantEnums.DEFAULT_TIMEZONE,
        momentTime;
    moment.tz.setDefault(timeZone);
    momentTime = moment(params.DateString);
    return momentTime.valueOf();
}

function formatScheduleDateString(scheduleDate) {
    let dateArr = scheduleDate.DateString.split("-");
    dateArr = dateArr.map((d) => parseInt(d, 10));
    return `${dateArr[0]}年${dateArr[1]}月${dateArr[2]}日 ${scheduleDate.Start}-${scheduleDate.End}`;
}

function formatLogisticsDateString(timestamp) {
    let timeStamp = timestamp,
        timeZone = ConstantEnums.DEFAULT_TIMEZONE,
        momentTime,
        year,
        month,
        date,
        hour,
        minute,
        second;
    moment.tz.setDefault(timeZone);
    momentTime = moment(timeStamp);

    year =  momentTime.year();
    month =  momentTime.month() + 1;
    date = momentTime.date();
    hour = momentTime.hour();
    minute = momentTime.minute();
    second = momentTime.second();
    return `${("0" + month).slice(-2)}/${("0" + date).slice(-2)}/${year} ${("0" + hour).slice(-2)}:${("0" + minute).slice(-2)}:${("0" + second).slice(-2)}`;
}

function formatAngusDateString(timestamp) {
    let timeStamp = timestamp,
        timeZone = ConstantEnums.DEFAULT_TIMEZONE,
        momentTime,
        year,
        month,
        date,
        hour,
        minute,
        second;
    moment.tz.setDefault(timeZone);
    momentTime = moment(timeStamp);

    year =  momentTime.year();
    month =  momentTime.month() + 1;
    date = momentTime.date();
    hour = momentTime.hour();
    minute = momentTime.minute();
    second = momentTime.second();
    return `${year}-${("0" + month).slice(-2)}-${("0" + date).slice(-2)} ${("0" + hour).slice(-2)}:${("0" + minute).slice(-2)}:${("0" + second).slice(-2)}`;
}

function formatActivateDateString(timestamp, timezone) {
    let timeStamp = timestamp,
        timeZone = timezone || ConstantEnums.DEFAULT_TIMEZONE,
        momentTime,
        year,
        month,
        date,
        hour,
        minute,
        second;
    moment.tz.setDefault(timeZone);
    momentTime = moment(timeStamp);

    year =  momentTime.year();
    month =  momentTime.month() + 1;
    date = momentTime.date();
    // hour = momentTime.hour();
    // minute = momentTime.minute();
    // second = momentTime.second();
    return `${("0" + month).slice(-2)}/${("0" + date).slice(-2)}/${year}`;
}

function buildQrEventKey(id, sceneId, code) {
    return id + '$' + (sceneId + parseInt(code, 10));
}

function parseQrEventKey(key) {
    let res = key.split('$');
    if (res.length === 2) {
        res[1] = parseInt(res[1], 10);
    }
    return res;
}

function handPatientAge(timestamp) {
    if (typeof timestamp !== 'number') {
        return null;
    }
    let now = new Date(),
        birthdate = new Date(timestamp),
        age = 0;
    age = now.getFullYear() - birthdate.getFullYear() - 1;
    if (now.getMonth() < birthdate.getMonth()) {
        return age;
    }
    if (now.getMonth() === birthdate.getMonth() && now.getDay < birthdate.getDay()) {
        return age;
    }
    return age + 1;
}

function resolveTimeUnit(number, dateUnit) {
    let duration;
    if (dateUnit === ConstantEnums.DateUnit.Day) {
        return ConstantEnums.MILLI_SECONDS_PER_DAY * number;
    }
    if (dateUnit === ConstantEnums.DateUnit.Week) {
        duration = ConstantEnums.MILLI_SECONDS_PER_DAY * number * 7;
    }
    if (dateUnit === ConstantEnums.DateUnit.Month) {
        duration = ConstantEnums.THIRTY_DAYS * number;
    }
    if (dateUnit === ConstantEnums.DateUnit.Season) {
        duration = ConstantEnums.THIRTY_DAYS * number * 3;
    }
    if (dateUnit === ConstantEnums.DateUnit.Year) {
        duration = ConstantEnums.MILLI_SECONDS_PER_DAY * ConstantEnums.DAYS_IN_YEAR * number;
    }
    return duration
}

function resolveStrTimeUnit(tu, timestamp) {
    if (!tu) {
        return 0
    }
    if (tu === ConstantEnums.TimeUnit.YearToDate) {
        return Date.now() - getYearStartDate(timestamp);
    }
    if (tu === ConstantEnums.TimeUnit.MTD) {
        return Date.now() - getMonthStartDate(timestamp);
    }
    if (tu === ConstantEnums.TimeUnit.WTD) {
        return Date.now() - getWeekStartDate(timestamp);
    }
    if (tu === ConstantEnums.TimeUnit.Today) {
        return Date.now() - getDayStartDate(timestamp);
    }
    let [number, dateUnit] = tu.split('-');
    if (!number || !dateUnit) {
        return 0;
    }
    return resolveTimeUnit(parseInt(number, 10), dateUnit);
}

function resolveDateFilter(params) {
    if (params.StartDate && params.EndDate) {
        return {
            StartDate: params.StartDate,
            EndDate: params.EndDate
        }
    }
    let dateRange = resolveStrTimeUnit(params.TimeUnit);
    return {
        StartDate: Date.now() - dateRange,
        EndDate: Date.now()
    }
}

function dateRangeUtil(period, timestamp){
    let tz = ConstantEnums.DEFAULT_TIMEZONE,
        timeStamp = timestamp || Date.now(),
        momentTime,
        startTime,
        year,
        month,
        day,
        dayOfWeek,
        jd;
    moment.tz.setDefault(tz);
    momentTime = moment(timeStamp);
    year = momentTime.year();
    month = momentTime.month();
    day = momentTime.date();
    dayOfWeek = momentTime.day();
    jd = Math.ceil((month + 1) / 3);
    switch (period) {
        case "Day":
            startTime = moment([year, month, day, 0]).valueOf();
            break;
        case "Week":
            startTime = moment([year, month, day - dayOfWeek, 0]).valueOf();
            break;
        case "Month":
            startTime = moment([year, month, 1, 0 ]).valueOf();
            break;
        case "Quarter":
            startTime = moment([year, (jd-1)*3, 1, 0]).valueOf();
            break
        case "Year":
            startTime = moment([year, 0, 1, 0]).valueOf();
            break
        default:
            startTime = moment([year, month, day, 0]).valueOf();
            break;
    }
    return startTime;
}

function getDueDateByPeriod(timestamp, period){
    let tz = ConstantEnums.DEFAULT_TIMEZONE,
        momentTime,
        dueDate,
        year,
        month,
        day,
        hour,
        daysInMonth,
        jd;
    moment.tz.setDefault(tz);
    momentTime = moment(timestamp);
    year = momentTime.year();
    month = momentTime.month();
    day = momentTime.date();
    hour = momentTime.hour();
    switch (period) {
        case "Day":
            dueDate = timestamp + ConstantEnums.MILLI_SECONDS_PER_DAY;
            break;
        case "Week":
            dueDate = timestamp + 7 * ConstantEnums.MILLI_SECONDS_PER_DAY;
            break;
        case "Month":
            month = month + 1;
            break;
        case "Quarter":
            month = month + 3;
            break
        case "Year":
            year = year + 1;
            break
        default:
            month = month + 1;
            break;
    }
    if (dueDate) {
        return dueDate;
    }
    if (month >= 12) {
        year = year + 1;
        month = month - 1
    }
    daysInMonth = getDaysInMonth(month, year);
    if (day > daysInMonth) {
        day = daysInMonth;
    }
    dueDate = moment([year, month, day, hour]).valueOf();
    return dueDate;
}

function getDateRangeByDateBucket(params) {
    let tz = params.Timezone || ConstantEnums.DEFAULT_TIMEZONE,
        timeStamp = Date.now(),
        momentTime,
        startTime,
        endTime,
        year,
        month,
        day,
        dayOfWeek,
        jd;
    moment.tz.setDefault(tz);
    momentTime = moment(timeStamp);
    year = momentTime.year();
    month = momentTime.month();
    day = momentTime.date();
    if (params.DateBucket && params.Type === "Day") {
        [year, month, day] = params.DateBucket.split("-").map((d) => parseInt(d, 10));
        month -= 1;
    }
    if (params.DateBucket && params.Type === "Month") {
        [year, month] = params.DateBucket.split("-").map((d) => parseInt(d, 10));
        month -= 1;
    }
    dayOfWeek = momentTime.day();
    jd = Math.ceil((month + 1) / 3);
    switch (params.Type) {
        case "Day":
            startTime = moment([year, month, day, 0]).valueOf();
            endTime = startTime + ConstantEnums.MILLI_SECONDS_PER_DAY;
            break;
        case "Week":
            startTime = moment([year, month, day - dayOfWeek, 0]).valueOf();
            endTime = moment([year, month, day - dayOfWeek + 7, 0]).valueOf();
            break;
        case "Month":
            startTime = moment([year, month, 1, 0 ]).valueOf();
            endTime = moment([year, month + 1, 1, 0 ]).valueOf();
            break;
        case "Quarter":
            startTime = moment([year, (jd-1) * 3, 1, 0]).valueOf();
            endTime = moment([year, jd * 3, 1, 0]).valueOf();
            break
        case "Year":
            startTime = moment([year, 0, 1, 0]).valueOf();
            endTime = moment([year + 1, 0, 1, 0]).valueOf();
            break
        default:
            startTime = moment([year, month, day, 0]).valueOf();
            endTime = moment([year, month, day + 1, 0]).valueOf();
            break;
    }
    return {
        StartTime: startTime,
        EndTime: endTime - 1
    };
}

function getQuarterTimestamps(params) {
    let quarterString = params.DateBucket || getQuarterDateBucket({TimeStamp: Date.now(), Timezone: params.Timezone}),
        [quarter, yearstr] = quarterString.split(" "),
        quarterToMonth = {
            Q1: 0,
            Q2: 3,
            Q3: 6,
            Q4: 9,
        },
        year = Number(yearstr),
        startMonth = quarterToMonth[quarter],
        endMonth = startMonth + 2,
        startTime,
        endTime = Date.now(),
        tz = params.Timezone || ConstantEnums.DEFAULT_TIMEZONE;
    moment.tz.setDefault(tz);
    startTime = moment([year, startMonth, 1, 0]).valueOf();
    if (quarter === "Q4") {
        endTime = moment([year + 1, 0, 1, 0]).valueOf() - 1;
    } else {
        endTime = moment([year, endMonth + 1, 1, 0]).valueOf() - 1;
    }
    return {
        StartTime: startTime,
        EndTime: endTime
    };
}

function getDatePeriod(time) {
    let tz = ConstantEnums.DEFAULT_TIMEZONE,
        timeStamp = time || Date.now(),
        nextTime = timeStamp + ConstantEnums.MILLI_SECONDS_PER_DAY,
        momentTime,
        periods = ["Day"],
        year,
        month,
        day,
        dayOfWeek,
        jd,
        nextMonth,
        jd1;
    moment.tz.setDefault(tz);
    momentTime = moment(timeStamp);
    year = momentTime.year();
    month = momentTime.month();
    day = momentTime.date();
    dayOfWeek = momentTime.day();
    nextMonth = moment(nextTime).month();
    jd = Math.ceil((month + 1) / 3);
    jd1 = Math.ceil((nextMonth + 1) / 3);
    if (dayOfWeek === 7) {
        periods.push("Week");
    }
    if (moment(nextTime).date() === 1) {
        periods.push("Month");
        if (jd1 > jd) {
            periods.push("Quarter");
        }
    }
    if (moment(nextTime).year() > year) {
        periods.push("Year");
    }
    return periods;
}

async function ipToLocation(ip) {
    if (!ip) {
        return '';
    }
    let location = await ipLocation(ip);
    return location.region.name;
}

function safeParseObj(str) {
    let result = {};
    if (!str) {
        return result;
    }
    try {
        result = JSON.parse(str);
    } catch (err) {
        result = {}
    }
    return result;
}

function safeParseArr(str) {
    let result = [];
    if (!str) {
        return result;
    }
    try {
        result = JSON.parse(str);
    } catch (err) {
        result = []
    }
    return result;
}

function generateCode(params) {
    let strArr = [];
    if (params.GroupCode) {
        strArr.push(params.GroupCode.toUpperCase());
    }
    if (params.EntityType) {
        strArr.push(params.EntityType.toUpperCase());
    }
    if (params.ItemName) {
        strArr.push(params.ItemName.toUpperCase());
    }
    if (!params.Id) {
        strArr.push(Math.floor(Math.random() * 1000));
    } else {
        strArr.push(params.Id)
    }
    return strArr.join("-");
}

function getYearStartDate(timestamp) {
    let timeStamp = timestamp || Date.now(),
        timeZone = ConstantEnums.DEFAULT_TIMEZONE,
        momentTime;
    moment.tz.setDefault(timeZone);
    momentTime = moment(timeStamp);
    return moment([momentTime.year(), 0, 1, 0]).valueOf();
}

function getMonthStartDate(timestamp) {
    let timeStamp = timestamp || Date.now(),
        timeZone = ConstantEnums.DEFAULT_TIMEZONE,
        momentTime;
    moment.tz.setDefault(timeZone);
    momentTime = moment(timeStamp);
    return moment([momentTime.year(), momentTime.month(), 1, 0]).valueOf();
}

function getDayStartDate(timestamp) {
    let timeStamp = timestamp || Date.now(),
        timeZone = ConstantEnums.DEFAULT_TIMEZONE,
        momentTime;
    moment.tz.setDefault(timeZone);
    momentTime = moment(timeStamp);
    return moment([momentTime.year(), momentTime.month(), momentTime.date(), 0]).valueOf();
}

function getDayEndDate(timestamp) {
    let timeStamp = timestamp || Date.now(),
        timeZone = ConstantEnums.DEFAULT_TIMEZONE,
        momentTime;
    moment.tz.setDefault(timeZone);
    momentTime = moment(timeStamp);
    return moment([momentTime.year(), momentTime.month(), momentTime.date(), 23, 59, 59, 999]).valueOf();
}

function getWeekStartDate(timestamp) {
    let timeStamp = timestamp || Date.now(),
        timeZone = ConstantEnums.DEFAULT_TIMEZONE,
        day,
        momentTime;
    moment.tz.setDefault(timeZone);
    momentTime = moment(timeStamp);

    return getDayStartDate(timeStamp) - momentTime.day() * ConstantEnums.MILLI_SECONDS_PER_DAY;
}

function resolveTimeDurationByFrequency(frequency, date) {
    let timeStamp = date || Date.now(),
        timeZone = ConstantEnums.DEFAULT_TIMEZONE,
        momentTime,
        startDate,
        endDate;
    moment.tz.setDefault(timeZone);
    momentTime = moment(timeStamp);
    momentTime.hour(0);
    momentTime.minute(0);
    momentTime.second(0);
    momentTime.millisecond(0);
    endDate = momentTime.valueOf() - 1;
    if (frequency === "Daily") {
        startDate = momentTime.add(-1, "days").valueOf();
    } else if(frequency === "Weekly") {
        startDate = momentTime.add(-7, "days").valueOf();
    } else if(frequency === "Monthly") {
        startDate = momentTime.add(-1, "months").valueOf();
    } else if(frequency === "Quarterly") {
        startDate = momentTime.add(-3, "months").valueOf();
    } else if(frequency === "Yearly") {
        startDate = momentTime.add(-1, "years").valueOf();
    }
    return {
        StartDate: startDate,
        EndDate: endDate
    }
}

function transform12HourTimeString(params) {
    let [time, system] = params.TimeString.split(" "),
        [hour, minite] = time.split(":");
    hour = parseInt(hour);
    if (hour === 12) {
        hour = 0;
    }
    if (system === "PM" || system === "pm") {
        hour = hour + 12;
    }
    minite = parseInt(minite);
    return {
        Hour: hour,
        Minite: minite
    }
}

function checkNotifyRuleSchedule(params) {
    let timestamp = params.Timestamp || Date.now(),
        timezone = params.Timezone || ConstantEnums.DEFAULT_TIMEZONE,
        day,
        dayOfWeek,
        hour,
        minite,
        startTime,
        endTime,
        result = false,
        momentTime;
    if (!Array.isArray(params.Schedule) || params.Schedule.length ===0 ) {
        return true;
    }
    moment.tz.setDefault(timezone);
    momentTime = moment(timestamp);
    day = momentTime.day();
    hour = momentTime.hour();
    minite = momentTime.minute();
    dayOfWeek = Object.keys(ConstantEnums.DayOfWeek)[day];
    params.Schedule.forEach((s) => {
        if (!s.Days?.length || !s.StartTimeString || !s.EndTimeString) {
            result = true;
            return;
        }
        if (!s.Days?.includes(dayOfWeek)) {
            return;
        }
        startTime = transform12HourTimeString({TimeString: s.StartTimeString});
        endTime = transform12HourTimeString({TimeString: s.EndTimeString});
        if (hour * 60 + minite >= startTime.Hour * 60 + startTime.Minite && hour * 60 + minite <= endTime.Hour * 60 + endTime.Minite) {
            result = true;
        }
    });
    return result;
}

function convertTimeStringToDecimal(timeString) {
    if (!timeString) {
        return 0;
    }
    let decimalValue = 0,
        hours = 0,
        hoursIndex,
        minutes = 0,
        minutesIndex;
    if (typeof timeString === 'number') {
        return timeString;
    }
    timeString = timeString.replace(/\s/g, '');
    if (timeString.includes('hr')) {
        hoursIndex = timeString.indexOf('hr');
        hours = parseFloat(timeString.slice(0, hoursIndex));
    } else if (timeString.includes('h')) { // For Mac Numbers
        hoursIndex = timeString.indexOf('h');
        hours = parseFloat(timeString.slice(0, hoursIndex));
    }
    if (timeString.includes('min')) {
        minutesIndex = timeString.indexOf('min');
        minutes = parseFloat(timeString.slice(hoursIndex + 2, minutesIndex));
    } else if (timeString.includes('m')) { // For Mac Numbers
        minutesIndex = timeString.indexOf('m');
        minutes = parseFloat(timeString.slice(hoursIndex + 1 || 0, minutesIndex));
    }
    decimalValue = hours + minutes / 60;
    return decimalValue;
}

function resolveDateSerialNumber(number) {
    if (!number || !isInteger(number)) {
        return;
    }
    return (number - 25569) * ConstantEnums.MILLI_SECONDS_PER_DAY;
}   

function getDateAndTimeFromTimestamp(params) {
    let timestamp = params.Timestamp || Date.now(),
        timezone = params.Timezone || ConstantEnums.DEFAULT_TIMEZONE,
        year,
        month,
        day,
        hour,
        minite,
        miniteString,
        dateString,
        timeString,
        momentTime;
    moment.tz.setDefault(timezone);
    momentTime = moment(timestamp);
    year = momentTime.year();
    month = momentTime.month() + 1,
    day = momentTime.date();
    hour = momentTime.hour();
    minite = momentTime.minute();
    miniteString = minite < 10 ? `0${minite}` : `${minite}`;
    dateString = `${month}/${day}/${year}`;
    timeString = `${hour % 12}:${miniteString} `;
    hour < 12 ? timeString = timeString + "am" : timeString = timeString + "pm";
    return {
        Date: dateString,
        Time: timeString
    }
}

function resolveTimeUnitDisplayText(tu) {
    if (!tu) {
        return "N/A"
    }
    let [number, dateUnit] = tu.split('-');
    if (tu === ConstantEnums.TimeUnit.YearToDate) {
        return "YTD";
    }
    if (number === "1" && dateUnit === "Year") {
        return "Last 12 Months";
    }
    if (!number || !dateUnit) {
        return "N/A";
    }
    return `Last ${number} ${dateUnit}s`;
}

function solveQueryDate(params) {
    if (params.DateBucketType === ConstantEnums.DateUnit.Quarter) {
        return getQuarterTimestamps({
            DateBucket: params.DateBucket,
            Type: params.DateBucketType,
            Timezone: params.Timezone
        });
    } else {
        return getDateRangeByDateBucket({
            DateBucket: params.DateBucket,
            Type: params.DateBucketType,
            Timezone: params.Timezone
        });
    }
}

// 03/06/2024
function parseDateString(params) {
    let timeZone = ConstantEnums.DEFAULT_TIMEZONE,
        dateArray,
        momentTime;
    moment.tz.setDefault(timeZone);
    dateArray = params.DateString.split('/').map((d) => parseInt(d, 10));
    dateArray[0] -= 1;
    momentTime = moment([dateArray[2], dateArray[0], dateArray[1]]);
    return momentTime.valueOf();
}

function getMonthString(params) {
        let timestamp = params.Timestamp,
        timezone = params.Timezone || ConstantEnums.DEFAULT_TIMEZONE,
        month,
        momentTime,
        monthStrArr = Object.keys(ConstantEnums.Months),
        day;
    moment.tz.setDefault(timezone);
    momentTime = moment(timestamp);
    month = momentTime.month(),
    day = momentTime.date();
    return {
        Month: monthStrArr[month],
        Day: day
    }
}

function getLastMonths(params) {
    let timestamp = params.Timestamp,
        timezone = params.Timezone || ConstantEnums.DEFAULT_TIMEZONE,
        month,
        momentTime,
        year,
        months = [];
    moment.tz.setDefault(timezone);
    momentTime = moment(timestamp);
    month = momentTime.month();
    year = momentTime.year();
    for (let i = 0; i < params.Number; i++) {
        momentTime.year(year);
        momentTime.month(month - i);
        const curMonth = momentTime.toISOString().slice(0, 7);
        months.push(curMonth);
    }
    return months;
}

function getAbbreviation(str) {
    if (!str) {
        return;
    }
    return str.replace(/\s/g, "");
}

function getUTCString(timestamp) {
    let date = new Date(timestamp);
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")} ${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")} UTC` ;
}

module.exports.getAbbreviation = getAbbreviation;
module.exports.getDayStart = getDayStart;
module.exports.getDayAHourMinute = getDayAHourMinute;
module.exports.parseArray = parseArray;
module.exports.fuzzy = fuzzy;
module.exports.caseInsensitiveRegex = caseInsensitiveRegex;
module.exports.hmsToSeconds = hmsToSeconds;
module.exports.IsFunction = IsFunction;
module.exports.IsString = isString;
module.exports.IsInteger = isInteger;
module.exports.IsPositiveNumber = isPositiveNumber;
module.exports.lowercaseObjectKey = lowercaseObjectKey;
module.exports.IsValidEmail = isValidEmail;
module.exports.IsValidPhoneNumber = isValidPhoneNumber;
module.exports.HidePhoneNumber = hidePhoneNumber;
module.exports.IsValidDate = isValidDate;
module.exports.IsLeapYear = isLeapYear;
module.exports.CapitalizeFirstLetter = capitalizeFirstLetter;
module.exports.GetDaysInMonth = getDaysInMonth;
module.exports.EscapeBadChars = escapeBadChars;
module.exports.IsValidUserName = isValidUserName;
module.exports.formatDate = formatDate;
module.exports.EMAIL_REGEXP = EMAIL_REGEXP;
module.exports.USERNAME_REGEXP = USERNAME_REGEXP;
module.exports.ALPHABET_DOT_SPACE_DASH = ALPHABET_DOT_SPACE_DASH;
module.exports.GenerateRandomPassword = generateRandomPassword;
module.exports.IsNumeric = isNumeric;
module.exports.CalculateQuartile = calculateQuartile;
module.exports.removeEOF = removeEOF;
module.exports.GetFileExtension = getFileExtension;
module.exports.formatFileExtension = formatFileExtension;
module.exports.GetSearchField = getSearchField;
module.exports.GetUserSearchField = getUserSearchField;
module.exports.FetchFromObject = fetchFromObject;
module.exports.getDateBucket = getDateBucket;
module.exports.getWeekDateBucket = getWeekDateBucket;
module.exports.getMonthDateBucket = getMonthDateBucket;
module.exports.dateTransform = dateTransform;
module.exports.resolvePromise = resolvePromise;
module.exports.groupBy = groupBy;
module.exports.getDateString = getDateString;
module.exports.getWxDateString = getWxDateString;
module.exports.buildSerialNumber = buildSerialNumber;
module.exports.handleWechatNoticeString = handleWechatNoticeString;
module.exports.handSortNum = handSortNum;
module.exports.moneySetter = moneySetter;
module.exports.createDateBuckets = createDateBuckets;
module.exports.setTimeOnDefaultTimezone = setTimeOnDefaultTimezone;
module.exports.getScheduleDateTimestamp = getScheduleDateTimestamp;
module.exports.formatScheduleDateString = formatScheduleDateString;
module.exports.buildQrEventKey = buildQrEventKey;
module.exports.parseQrEventKey = parseQrEventKey;
module.exports.handPatientAge = handPatientAge;
module.exports.getDateOnDefaultTimezone = getDateOnDefaultTimezone;
module.exports.formatLogisticsDateString = formatLogisticsDateString;
module.exports.resolveTimeUnit = resolveTimeUnit;
module.exports.resolveDateFilter = resolveDateFilter;
module.exports.resolveStrTimeUnit = resolveStrTimeUnit;
module.exports.DateRangeUtil = dateRangeUtil;
module.exports.IpToLocation = ipToLocation;
module.exports.getDateTimestamp = getDateTimestamp;
module.exports.safeParseObj = safeParseObj;
module.exports.safeParseArr = safeParseArr;
module.exports.generateCode = generateCode;
module.exports.getYearStartoDate = getYearStartDate;
module.exports.getMonthStartoDate = getMonthStartDate;
module.exports.getWeekStartoDate = getWeekStartDate;
module.exports.getDayStartDate = getDayStartDate;
module.exports.getDayPeriod = getDatePeriod;
module.exports.getDateBucketByType = getDateBucketByType;
module.exports.getDateRangeByDateBucket = getDateRangeByDateBucket;
module.exports.getQuarterTimestamps = getQuarterTimestamps;
module.exports.resolveTimeDurationByFrequency = resolveTimeDurationByFrequency;
module.exports.formatActivateDateString = formatActivateDateString;
module.exports.getLastDigits = getLastDigits;
module.exports.transform12HourTimeString = transform12HourTimeString;
module.exports.checkNotifyRuleSchedule = checkNotifyRuleSchedule;
module.exports.convertTimeStringToDecimal = convertTimeStringToDecimal;
module.exports.getDueDateByPeriod = getDueDateByPeriod;
module.exports.resolveDateSerialNumber = resolveDateSerialNumber;
module.exports.getDateAndTimeFromTimestamp = getDateAndTimeFromTimestamp;
module.exports.resolveTimeUnitDisplayText = resolveTimeUnitDisplayText;
module.exports.solveQueryDate = solveQueryDate;
module.exports.formatAngusDateString = formatAngusDateString;
module.exports.parseDateString = parseDateString;
module.exports.getMonthString = getMonthString;
module.exports.getLastMonths = getLastMonths;
module.exports.getDayEndDate = getDayEndDate;
module.exports.getUTCString = getUTCString;

