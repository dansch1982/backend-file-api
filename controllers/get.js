const fs = require('fs')

const getFileName = require('../services/getFileName')
const incorrectEntry = require('../services/incorrectEntry')
const getRefArray = require('../services/getRefArray')
const resolve = require('../services/resolve')
const error = require('../services/error')

function get(res, parts) {

    const file = getFileName(parts);

    fs.readFile(file, (err, data) => {

        if (err) {

            return incorrectEntry(res);

        } else {

            const object = JSON.parse(data)
            const refArray = getRefArray(object, parts)
            const response = refArray[refArray.length - 1] || error("No such data.")
            resolve(res, response, "application/json");

        }

    })
}
module.exports = get