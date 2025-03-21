/*jslint node:true*/
let fs = require('fs'),
    htmlHelper = require('../helpers/htmlHelper.js'),
    htmlSnips = {
        FontFamily: "font-family:'Helvetica Neue',Helvetica,Arial,'Lucida Grande',sans-serif",
        FontFamilyBookAntiquaPalatino: "font-family:'Book Antiqua','Palatino',sans-serif"
    };
require.extensions['.html'] = function (module, filename) {
    module.exports = htmlHelper.replaceTokens(
        // eslint-disable-next-line no-sync
        fs.readFileSync(filename, 'utf8').
            replace(/\r?\n|\r|\t/g, '').
            replace(/\s{2,}/g, ' ').
            replace(/> </g, '><'),
        htmlSnips
    );
};