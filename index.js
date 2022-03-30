const http = require('http');
const fs = require('fs');
const path = require('path');
const Switcher = require('./switcher');

http.createServer((req, res) => {
    const host = 'http' + '://' + req.headers.host + '/';
    const url = new URL(req.url, host);
    console.log(`${req.method}: ${url.pathname}`);
    const parts = url.pathname.split('/').filter(Boolean)

    const switcher = new Switcher()

    switcher.addObjective("OPTIONS", () => {
        options(res)
    })

    switcher.addObjective("GET", () => {
        get(res, parts);
    })
    
    switcher.addObjective("PUT", () => {
        switcher.switch('POST', true)
    })
    
    switcher.addObjective("POST", (...args) => {
        const [put] = args
        postAndPut(req, res, parts, put);
    })

    switcher.addObjective("DELETE", () => {
        deletePost(req, res, parts)
    })

    if(!switcher.switch(req.method)) {
        resolve(res, error("Something went wrong."), "application/json")
    }

}).listen(8080);

function options(res) {
    res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, PUT, GET, OPTIONS",
        "Content-Type" : "application/json"
    })
    res.end()
}

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

function postAndPut(req, res, parts, put) {

    const file = getFileName(parts);

    fs.readFile(file, async (err, data) => {

        const body = await getBody(req);

        if (!body) {
            return resolve(res, error("Not a valid JSON data."), "application/json")
        }
        
        if (err) {
            console.log(body)
            return incorrectEntry(res)
        } 

        const object = JSON.parse(data)
        const refArray = getRefArray(object, parts)

        if (!refArray[refArray.length - 1]) {
            return resolve(res, error("Incorrect path"), "application/json")
        }
        const before = JSON.parse(JSON.stringify(refArray[refArray.length - 1]))
        
        if (typeof body !== "object") {
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
                        "after": object[parts[parts.length - 1]]
                    }
                }
                resolve(res, response, "application/json")
            })
        }
    })
}

function deletePost(req, res, parts) {

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

function getRefArray(object, parts) {
    const refArray = []
    for (let i = 0; i < parts.length; i++) {
        if (refArray.length <= 0) {
            refArray.push(object)
        } else {
            refArray.push(refArray[i-1][parts[i]])
        }
    }
    return refArray;
}

async function getBody(req) {

    const buffers = await getBuffers();

    try {
        return JSON.parse(Buffer.concat(buffers));
    } catch (error) {
        console.log(error)
        return null
    }

    async function getBuffers() {
        const buffers = [];
            for await (const chunk of req) {
                buffers.push(chunk);
            }
            return buffers
    }

}

function addDeepData(object, element, key, bool) {
    if (typeof element === "object") {
        for (const deepKey in element) {
            const deepElement = element[deepKey]
            if (!object[key] || typeof object[key] !== "object") {
                object[key] = {}
            }
            addDeepData(object[key], deepElement, deepKey, bool)
        }
    }
    else if (bool === true || !object[key]) {
        object[key] = element;
    }
}

function resolve(res, data, type) {
    res.writeHead(200, {
        "Content-Type": type,
        "Access-Control-Allow-Origin": "*"
    })
    try {
        JSON.parse(data)
    } catch (error) {
        data = JSON.stringify(data)
    }
    if (typeof data !== "string") {
        data = new String(data).toString()
    }
    res.end(data);
}

function getFileName(parts) {
    const file = path.join(__dirname, "json", (parts[0] ? parts[0] : "") + ".json")
    return file;
}

function incorrectEntry(res) {
    const files = fs.readdirSync(path.join(__dirname, "json"))

    for (let i = 0; i < files.length; i++) {
        files[i] = path.parse(files[i]).name
    }
    const response = error(`Available entry points: ${files.join(', ')}.`)

    resolve(res, response, "application/json");
}

function error(message) {
    const object = {
        "error": message
    }
    return object
}