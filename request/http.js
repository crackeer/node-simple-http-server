var http = require('http');

var request = async (url, params, method, headers) => {
    return new Promise((successCallback, errorCallback) => {
        let req = http.request(url, {
            method, headers
        }, (req) => {
            req.on('data', (data) => {
                successCallback(JSON.parse(data.toString()))
            })
        })
        if(typeof params == 'object') {
            req.write(JSON.stringify(params))
        } else if (typeof params == 'string' && params.length > 0) {
            req.write(params)
        }
        req.on('error', (message) => {
            errorCallback(message.message)
        })
        req.end()
    })
}
module.exports = {
    post: async (url, params, headers) => {
        let newHeader = {
            'Content-Type' : 'application/json'
        }
        if(typeof headers == 'object') {
            let keys = Object.keys(headers)
            for(var i in keys) {
                newHeader[keys[i]] = headers[keys[i]]
            }
        }
        return request(url, params, "POST", newHeader)
    }
}