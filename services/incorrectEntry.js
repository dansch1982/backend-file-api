const fs = require('fs')
const path = require('path')
const error = require('../services/error')
const resolve = require('../services/resolve')


function incorrectEntry(res) {
    const files = fs.readdirSync(path.join(__dirname, "/../json"))

    for (let i = 0; i < files.length; i++) {
        files[i] = path.parse(files[i]).name
    }
    const response = error(`Available entry points: ${files.join(', ')}.`)

    resolve(res, response, "application/json");
}
module.exports = incorrectEntry