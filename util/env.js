var process = require('process')
var file = require('./file')
var path = require('path')
var  setEnvs = (object) => {
    if(typeof object != 'object') {
        return 
    }
    let keys = Object.keys(object)
    for (var i in keys) {
        process.env[keys[i]] = object[keys[i]]
    }
}
var getEnv = (key) => {
    return process.env[key]
}
var setEnv = (key, value) => {
    process.env[key] = value
}

module.exports = {
    setEnvs, getEnv, setEnv,
    applyEnvFile : () => {
        let homePath = getEnv('HOME')
        if(homePath == undefined) {
            return {}
        }
        let object = file.readEnv(path.join(homePath, ".env"))
        setEnvs(object)
    }
}