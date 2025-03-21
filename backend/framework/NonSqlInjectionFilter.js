/* eslint-disable multiline-ternary */
/*jslint node:true*/

let envRegEx = process.env.NOSQL_INJECT_REGEX,
    sanitizer = require('sanitize-html'),
    sanitizerOptions = require('./SanitizerOptions'),
    HTTPMethodsEnums = require('../enums/HTTPMethodsEnums'),
    InjectionRegEx = new RegExp('((\\$eq)|(\\$gt)' +
        '|(\\$gte)|(\\$lt)|(\\$lte)' +
        '|(\\$ne)|(\\$in)|(\\$nin)' +
        '|(\\$or)|(\\$and)|(\\$not)' +
        '|(\\$nor)|(\\$exists)|(\\$type)' +
        '|(\\$mod)|(\\$regex)|(\\$text)' +
        '|(\\$where)|(\\$all)|(\\$elemMatch)' +
        '|(\\$size)|(\\$meta)|(\\$slice)' +
        '|(\\$bitsAllSet)|(\\$bitsAnySet)|(\\$bitsAllClear)' +
        '|(process\\.exit)|(process\\.kill)|(process\\.abort)' +
        '|\\bconsole\\.log\\b|\\bwhoami\\b|\\bonerror\\b|\\bonload\\b|\\=\\bcmd\\b\\|' +
        '|\\beval\\s*\\(|(RegExp)' + (envRegEx ? '|' + envRegEx : '') +
        '){1}?',
    'g'),
    whiteList = {
        '/svc/PostAdmin/SavePost': true,
        '/svc/CourseAdmin/Save': true,
        '/svc/MeetupAdmin/Save': true,
        '/svc/MedicineAdmin/SaveMedicine': true
    };

function filterRequest(req) {
    let payload = req.method === HTTPMethodsEnums.GET ? req.query : req.body,
        whitlisted = whiteList[req.url],
        match;
    payload = JSON.stringify(payload || null, function (key, value) {
        return typeof value === 'string' && !whitlisted ? sanitizer(value, sanitizerOptions) : value;
    });
    if (payload) {
        match = payload.match(InjectionRegEx);
        if (req.method === HTTPMethodsEnums.GET) {
            req.query = JSON.parse(payload);
        } else {
            req.body = JSON.parse(payload);
        }
        return match && match.length;
    }
    return false;
}

exports.FilterRequest = filterRequest;
