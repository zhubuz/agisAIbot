/* eslint-disable no-console */
/*jslint node:true*/
let redis = require('redis'),
    config = require('../configurations/config'),
    CacheEnums = require("../enums/CacheEnums.js"),
    ConstantEnums = require("../enums/ConstantEnums.js"),
    client,
    RedisConnection = {},
    redisPublisher,
    keysAsync,
    getAsync,
    mgetAsync,
    setexAsync;
const {promisify} = require('util');
// const getAsync = promisify(client.get).bind(client);

async function init() {
    if (!client) {
        client = await redis.createClient(config.Redis.Connection);
        redisPublisher = client.duplicate();
        if (config.Redis.Connection.password) {
            client.auth(config.Redis.Connection.password, function() {
                console.log('Redis client connected');
            });
        }
        getAsync = promisify(client.get).bind(client);
        mgetAsync = promisify(client.mget).bind(client);
        setexAsync = promisify(client.setex).bind(client);
        keysAsync = promisify(client.keys).bind(client);
        client.on('ready', function (err) {
            if (err) {
                console.error(err);
            }
        });
        client.on('error', function (err) {
            console.error(err);
        });
    }
}

function checkSetParams(params) {
    let cacheType;
    if (!params.CacheType || !params.Value) {
        throw "Invalid params for setting Redis cache";
    }
    cacheType = CacheEnums.CacheTypes[params.CacheType];
    if (!cacheType) {
        throw "Invalid cacheType";
    }
    if (typeof params.Value !== cacheType.ValueType) {
        throw "Invalid cache value";
    }
    if (!cacheType.IdLess && !params.Id) {
        throw "Missing Id";
    }
}

function checkGetParameter(params) {
    let cacheType;
    if (!params.CacheType) {
        throw "Invalid params for getting Redis cache";
    }
    cacheType = CacheEnums.CacheTypes[params.CacheType];
    if (!cacheType) {
        throw "Invalid cacheType";
    }
    if (!cacheType.IdLess && !params.Id) {
        throw "Missing Id";
    }
}

function checkDeleteParams(params) {
    let cacheType;
    if (!params.CacheType) {
        throw "Invalid params for deleting Redis cache";
    }
    cacheType = CacheEnums.CacheTypes[params.CacheType];
    if (!cacheType) {
        throw "Invalid cacheType";
    }
    if (!cacheType.IdLess && !params.Id) {
        throw "Missing Id";
    }
}

function checkGetKeysParams(params) {
    let cacheType;
    if (!params.CacheType) {
        throw "Invalid params Redis cache";
    }
    cacheType = CacheEnums.CacheTypes[params.CacheType];
    if (!cacheType) {
        throw "Invalid cacheType";
    }
}

function buildId(params) {
    let cacheType = CacheEnums.CacheTypes[params.CacheType];
    return cacheType.IdLess
        ? cacheType.Name
        : cacheType.Name + "-" + params.Id;
}

function buildNamespace(name, type) {
    return `${ConstantEnums.NAMESPACE.Care}-${name}-${type}`;
}
function deleteZsetAndValue(keys, namespace) {
    if (keys.length) {
        const multi = client.multi().
            zrem(namespace, keys).
            del(keys);
        return promisify(multi.exec).bind(multi)();
    }
    return Promise.resolve();
}

async function globalGet(params) {
    try {
        let result,
            key,
            cacheType;
        checkGetParameter(params);
        cacheType = CacheEnums.CacheTypes[params.CacheType];
        key = buildId(params);
        result = await getAsync(key);
        if (!result) {
            return {
                Data: null
            };
        }
        if (cacheType.ValueType === CacheEnums.ValueType.Object) {
            result = JSON.parse(result);
        }
        return {
            Data: result
        };
    } catch (error) {
        console.log(error);
        return {
            Error: error
        };
    }
}

function globalSet(params) {
    try {
        let stringifiedVal,
            lifetime,
            cacheType,
            key;
        checkSetParams(params);
        cacheType = CacheEnums.CacheTypes[params.CacheType];
        lifetime = cacheType.Lifetime || ConstantEnums.SECONDS_IN_TWENTY_FOUR_HOURS;
        if (cacheType.ValueType === CacheEnums.ValueType.Object) {
            stringifiedVal = JSON.stringify(params.Value);
        }
        key = buildId(params);
        setexAsync(key, lifetime, stringifiedVal || params.Value);
        return {
            Success: true
        };
    } catch (error) {
        return {
            Error: error
        };
    }
}

function globalDelete(params) {
    try {
        let key;
        checkDeleteParams(params);
        key = buildId(params);
        client.del(key);
        return {
            Success: true
        };
    } catch (error) {
        return {
            Error: error
        };
    }
}

function bulkDel(params) {
    if (!params.CacheType || !params.Keys || !params.Keys.length) {
        return;
    }
    let multi = client.multi();
    params.Keys.forEach((key) => {
        multi.del(key);
    });
    multi.exec();
}

function bulkIncr(params) {
    if (!params.CacheType || !params.Keys || !params.Keys.length) {
        return;
    }
    let cacheType = CacheEnums.CacheTypes[params.CacheType],
        multi = client.multi();

    params.Keys.forEach((key) => {
        let lifetime = cacheType.Lifetime || ConstantEnums.SECONDS_IN_TWENTY_FOUR_HOURS,
            id = buildId({
                CacheType: params.CacheType,
                Id: key
            });
        multi.incr(id);
        multi.expire(id, lifetime);
    });
    multi.exec();
}

async function getKeys(params) {
    try {
        checkGetKeysParams(params);
        let result = await keysAsync(buildId({
            CacheType: params.CacheType,
            Id: ""
        }) + "*");
        return {
            Data: result
        };
    } catch (error) {
        return {
            Error: error
        };
    }
}

async function bulkGet(keys) {
    try {
        if (!keys || !keys.length) {
            throw "Missing keys for bulk get.";
        }
        let result = await mgetAsync(keys);
        return {
            Data: result
        };
    } catch (error) {
        return {
            Error: error
        };
    }
}

async function lruGet(params) {
    let namespace,
        key,
        score = -1 * Date.now(),
        cacheType,
        multi,
        result = [];
    checkGetParameter(params);
    cacheType = CacheEnums.CacheTypes[params.CacheType];
    namespace = buildNamespace(cacheType.Name, 'LRU-ZSET');
    key = buildId(params);
    multi = client.multi().
        get(key).
        zadd(namespace, 'XX', 'CH', score, key);
    result = await promisify(multi.exec).bind(multi)();
    return JSON.parse(result[0]);
}

async function lruSet(params) {
    checkSetParams(params);
    const cacheType = CacheEnums.CacheTypes[params.CacheType],
        namespace = buildNamespace(cacheType.Name, 'LRU-ZSET'),
        key = buildId(params),
        score = -1 * Date.now(),
        value = JSON.stringify(params.Value),
        multi = client.multi();
    let results;
    if (cacheType.Lifetime) {
        multi.set(key, value, 'EX', cacheType.Lifetime);
    } else {
        multi.set(key, value);
    }
    multi.zadd(namespace, score, key);
    multi.zrange(namespace, cacheType.MAX, -1);
    results = await promisify(multi.exec).bind(multi)();
    if (results[2].length) {
        await deleteZsetAndValue(results[2], namespace);
    }
    return params.Value;
}

async function lruReset(params) {
    let cacheType,
        namespace,
        keys = [],
        results = [];
    checkGetKeysParams(params);
    cacheType = CacheEnums.CacheTypes[params.CacheType];
    namespace = buildNamespace(cacheType.Name, 'LRU-ZSET');
    keys = await promisify(client.zrange).bind(client)(namespace, 0, -1);
    results = await deleteZsetAndValue(keys, namespace);
    return results;
}

function quit() {
    if (client) {
        client.quit();
    }
}

function publish(channel, message) {
    // console.log('Pushlish ', message)
    redisPublisher.publish(channel, message);
}


RedisConnection.init = init;
RedisConnection.quit = quit;
RedisConnection.GlobalSet = globalSet;
RedisConnection.GlobalGet = globalGet;
RedisConnection.GlobalDelete = globalDelete;
RedisConnection.BulkIncr = bulkIncr;
RedisConnection.GetKeys = getKeys;
RedisConnection.BulkGet = bulkGet;
RedisConnection.BulkDel = bulkDel;
RedisConnection.LruGet = lruGet;
RedisConnection.LruSet = lruSet;
RedisConnection.LruReset = lruReset;
RedisConnection.Publish = publish;

// RedisConnection.init();

module.exports = RedisConnection;
