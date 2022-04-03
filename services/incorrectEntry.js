const fs = require('fs')
const path = require('path')

const Response = require('../services/Response')

function incorrectEntry(res) {
    const files = fs.readdirSync(path.join(__dirname, "/../json"))

    for (let i = 0; i < files.length; i++) {
        files[i] = path.parse(files[i]).name
    }

    res = new Response(res)
    res.status(404).json({"entrypoints" : files})
}
module.exports = incorrectEntry