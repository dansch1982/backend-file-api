const fs = require('fs')
const path = require('path')

function incorrectEntry(res) {
    const files = fs.readdirSync(path.join(__dirname, "/../json"))

    for (let i = 0; i < files.length; i++) {
        files[i] = path.parse(files[i]).name
    }

    /* const entrypoints = {}
    files.forEach(file => {
        entrypoints[file] = "description"
    }) */

    res.status(200).text(`Incorrect entry point. Available entry points: ${files.join(', ')}.`)
}
module.exports = incorrectEntry