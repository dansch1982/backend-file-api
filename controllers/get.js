const fs = require('fs')

const getFileName = require('../services/getFileName')
const incorrectEntry = require('../services/incorrectEntry')
const getRefArray = require('../services/getRefArray')

function get(req, res) {
    const file = getFileName(req.parts);

    fs.readFile(file, (error, data) => {

        if (error) {

            return incorrectEntry(res);

        } else {

            const object = JSON.parse(data)
            const refArray = getRefArray(object, req.parts)
            if (refArray[refArray.length - 1]) {
                res.status(200).json(refArray[refArray.length - 1])
            } else {
                res.status(404).text("No data.")
            }
        }

    })
}
module.exports = get