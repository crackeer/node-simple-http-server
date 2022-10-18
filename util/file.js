var fs = require('fs')

var  readString = (filePath) => {
    let raws = fs.readFileSync(filePath)
    return raws.toString()
}
module.exports = {
    readString,
    readJSON : (filePath) => {
        let raws = readString(filePath)
        if(raws.length < 1) {
            return null
        }
        return JSON.parse(raws)
    },
    readEnv : (filePath) => {
        let raws = readString(filePath)
        let lines = raws.split("\n")
        
        let response = {}
        for(var index in lines) {
            let parts = lines[index].trim().split('=')
            if(parts.length >= 2) {
                response[parts[0].trim()] = parts[1].trim()
            }
        }
        return response
    }
}