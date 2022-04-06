const fs = require('fs')

const getFileName = require('../services/getFileName')
const incorrectEntry = require('../services/incorrectEntry')
const getRefArray = require('../services/getRefArray')

function deletePost(res, parts) {

    const file = getFileName(parts);

    if (parts.length <= 0) {
        return incorrectEntry(res)
    }
    else if (parts.length <= 1) {
        return res.status(403).text("Can't delete an entry point.")
    }

    fs.readFile(file, (error, data) => {

        if (error) {

            return res.status(500).text(error.toString())

        } else {

            const object = JSON.parse(data)
            const refArray = getRefArray(object, parts)
            if (!refArray[refArray.length - 1]) {
                return res.status(404).text("No data.")
            }

            delete refArray[refArray.length-2][parts[parts.length-1]]

            fs.writeFile(file, JSON.stringify(object), (error) => {
                
                let response;
                
                if (error) {
                    res.status(500).text(error.toString())
                } else {
                    res.status(200).text("Data removed.")
                }
            })

        }

    })

}
module.exports = deletePost