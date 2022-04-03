const fs = require('fs')

const getFileName = require('../services/getFileName')
const getBody = require('../services/getBody')
const resolve = require('../services/resolve')
const error = require('../services/error')
const incorrectEntry = require('../services/incorrectEntry')
const getRefArray = require('../services/getRefArray')
const addDeepData = require('../services/addDeepData')

function postAndPut(req, res, parts, put = false) {

    const file = getFileName(parts);

    fs.readFile(file, async (err, data) => {

        const body = await getBody(req);

        if (!body) {
            return resolve(res, error("Not a valid JSON data."), "application/json")
        }
        
        if (err) {
            return incorrectEntry(res)
        } 

        const object = JSON.parse(data)
        const refArray = getRefArray(object, parts)

        if (!refArray[refArray.length - 1]) {
            return resolve(res, error("Incorrect path"), "application/json")
        }
        const before = JSON.parse(JSON.stringify(refArray[refArray.length - 1]))
        
        if (typeof body !== "object" || typeof refArray[refArray.length-1] !== "object") {
            refArray[refArray.length-2][parts[parts.length - 1]] = body
        } else {
            for (const key in body) {
                    const element = body[key];
                    addDeepData(refArray[refArray.length - 1], element, key, put)
            }
        }

        if (JSON.stringify(refArray[refArray.length - 1]) === JSON.stringify(before) && put !== true) {
            resolve(res, error("No data added."), "application/json")
        } else {
            fs.writeFile(file, JSON.stringify(object), (err) => {
                
                let response;
                
                if (err) {
                    response = error(err.toString())
                } else {
                    response = {
                        "succes": "Data saved.",
                        "before": before,
                        "after": object[parts[parts.length - 1]] || object
                    }
                }
                resolve(res, response, "application/json")
            })
        }
    })
}
module.exports = postAndPut