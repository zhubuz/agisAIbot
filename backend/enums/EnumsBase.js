/*jslint node:true*/
let EnumsBase = {
    EMPTY_VALUE: '_empty_',
    SetNames: function (enums, propName) {
        'use strict';
        // use a POFL through Object.keys for best performance vs. a "for in" loop
        let keysA = Object.keys(enums),
            keysB,
            i,
            j,
            len = keysA.length,
            jlen,
            item,
            name;
        for (i = 0; i < len; i += 1) {
            item = keysA[i];
            keysB = typeof enums[item] === 'object'
                ? Object.keys(enums[item])
                : [];
            jlen = keysB.length;
            if (jlen) {
                for (j = 0; j < jlen; j += 1) {
                    name = keysB[j];
                    if (propName) {
                        // if a property name is sent in, set that property to the name
                        // eslint-disable-next-line max-depth
                        if (propName === '.') {
                            enums[item][name] = item + propName + name;
                        } else {
                            enums[item][propName] = item;
                        }
                    } else if (!enums[item][name]) {
                        // if enum property is defaulted to zero (0) - then set the value to the name
                        enums[item][name] = name;
                    } else if (enums[item][name] === this.EMPTY_VALUE) {
                        enums[item][name] = '';
                    }
                }
            } else if (!enums[item]) {
                enums[item] = item;
            } else if (enums[item] === this.EMPTY_VALUE) {
                enums[item] = '';
            }
        }
    },
    ReturnValues: function (enums) {
        'use strict';
        let keys = Object.keys(enums),
            i,
            len = keys.length,
            ret = [];
        for (i = 0; i < len; i += 1) {
            if (typeof enums[keys[i]] !== 'function') {
                ret.push(enums[keys[i]]);
            }
        }
        return ret;
    },
    GetByValue: function (enums, value) {
        'use strict';
        let keys = Object.keys(enums),
            len = keys.length,
            i,
            ret;

        for (i = 0; i < len; i += 1) {
            if (enums[keys[i]] === value) {
                ret = keys[i];
                break;
            }
        }

        return ret;
    }
};
module.exports = EnumsBase;
