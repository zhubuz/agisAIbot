/* eslint-disable consistent-return */
/* eslint-disable no-process-exit */
/* eslint-disable no-sync */
/* eslint-disable no-console */
/*jslint node:true*/
// to use:
// $ cd projects/hgapp
// $ node deploy/migrateEtl.js --env local --f releases/v1.200.0/etl.js

var fs = require('fs'),
    argsv = require('minimist')(process.argv.slice(2)),
    availableEnv = [
        'local',
        'testing'
    ];

function checkArgs() {
    'use strict';
    var result = true;
    if (!argsv.env) {
        console.log('Missing Required Env');
        result = false;
    }
    if (!argsv.f) {
        console.log('Missing Required ETL File');
        result = false;
    }
    if (argsv.env && availableEnv.indexOf(argsv.env) === -1) {
        console.log('Unknown Environment: ' + argsv.env);
        result = false;
    }
    if (argsv.f && !fs.existsSync([__dirname, '/', argsv.f].join(''))) {
        console.log('Data Migration Script Not found: ' + argsv.f);
        result = false;
    }
    return result;
}


function executeScript(callback) {
    'use strict';
    var DbConnections = require('../backend/framework/DbConnections.js');
    DbConnections.init(function () {
        //load script
        var fileLoad = require([__dirname, '/', argsv.f].join(''));
        //Execute Script
        fileLoad.Run(callback);
    });
}

if (!checkArgs()) {
    return process.exit(1);
}
console.log('| Running Data Migration Script! |');

//Set ENV Variable
process.env.BUILD_ENV = argsv.env;

//Run Script
executeScript(function (error) {
    'use strict';
    if (error) {
        console.log('| Houston we have a problem! |');
        console.log(error);
        process.exit(1);
    }
    console.log('| Data Migration Complete! |');
    process.exit(0);
});

