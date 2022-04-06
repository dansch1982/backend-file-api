const fs = require('fs')

const getFileName = require('../services/getFileName')
const incorrectEntry = require('../services/incorrectEntry')
const getRefArray = require('../services/getRefArray')

function get(res, parts) {

    const file = getFileName(parts);

    fs.readFile(file, (err, data) => {

        if (err) {

            return incorrectEntry(res);

        } else {

            const object = JSON.parse(data)
            const refArray = getRefArray(object, parts)
            if (refArray[refArray.length - 1]) {
                res.status(200).json(refArray[refArray.length - 1])
            } else {
                res.status(404).text("No data.")
            }
        }

    })
}
module.exports = get