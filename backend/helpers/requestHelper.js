const teenyRequest = require('teeny-request').teenyRequest;
const request = require('retry-request')

async function retryRequest(params) {
    return new Promise((resolve, reject) => {
        request({url: params.Url, headers: params.Headers}, {request: teenyRequest, noResponseRetries: params.Retry || 1}, function (err, resp, body) {
            if (err) {
                return reject(err);
            }
            return resolve(body);
        });
    });
}

module.exports = {
    RetryRequest: retryRequest
}