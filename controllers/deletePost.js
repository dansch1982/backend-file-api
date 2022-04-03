const fs = require('fs')

const getFileName = require('../services/getFileName')
const incorrectEntry = require('../services/incorrectEntry')
const resolve = require('../services/resolve')
const error = require('../services/error')
const getRefArray = require('../services/getRefArray')

function deletePost(res, parts) {

    const file = getFileName(parts);

    if (parts.length <= 0) {
        return incorrectEntry(res)
    }
    else if (parts.length <= 1) {
        return resolve(res, error("Can't delete an entry point."), "application/json")
    }

    fs.readFile(file, (err, data) => {

        if (err) {

            return resolve(res, error(err), "application/json")

        } else {

            const object = JSON.parse(data)
            const refArray = getRefArray(object, parts)
            if (!refArray[refArray.length - 1]) {
                return resolve(res, error("No such data."), "application/json");
            }
            delete refArray[refArray.length-2][parts[parts.length-1]]

            fs.writeFile(file, JSON.stringify(object), (err) => {
                
                let response;
                
                if (err) {
                    response = error(err.toString())
                } else {
                    response = {
                        "succes": "Data removed."
                    }
                }
                resolve(res, response, "application/json")
            })

        }

    })

}
module.exports = deletePost