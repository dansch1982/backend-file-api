const fs = require('fs')

const getFileName = require('../services/getFileName')
const getBody = require('../services/getBody')
const incorrectEntry = require('../services/incorrectEntry')
const getRefArray = require('../services/getRefArray')
const addDeepData = require('../services/addDeepData')

function post(req, res, args) {
    
    const [put] = args

    const file = getFileName(req.parts);

    fs.readFile(file, async (err, data) => {

        if (err) {
            return incorrectEntry(res)
        } 

        const body = await getBody(req);
        if (!body) {
            return res.status(400).text('Incorrect JSON format.')
        }
        
        const object = JSON.parse(data)
        const refArray = getRefArray(object, req.parts)

        if (!refArray[refArray.length - 1]) {
            return res.status(400).text("Incorrect path.")
        }
        const before = JSON.parse(JSON.stringify(refArray[refArray.length - 1]))
        
        if (typeof body !== "object" || typeof refArray[refArray.length-1] !== "object") {
            try {
                refArray[refArray.length-2][req.parts[req.parts.length - 1]] = body
            } catch (error) {
                return res.status(500).text('Something went wrong.')
            }
        } else {
            for (const key in body) {
                const element = body[key];
                addDeepData(refArray[refArray.length - 1], element, key, put)
            }
        }
        
        if (JSON.stringify(refArray[refArray.length - 1]) === JSON.stringify(before) && put !== true) {
            res.status(304).text("No data changed.")
        } else {
            fs.writeFile(file, JSON.stringify(object), (error) => {
                
                if (error) {
                    res.status(500).text(error.toString())
                } else {
                    const response = { "before": before }
                    try {
                        response["after"] = refArray[refArray.length-2][req.parts[req.parts.length - 1]]
                    } catch (error) {
                        response["after"] = object
                    }
                    res.status(200).json(response)
                }
            })
        }
    })
}
module.exports = post