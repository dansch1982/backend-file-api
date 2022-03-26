const http = require('http');
const fs = require('fs');
const path = require('path');
const Switcher = require('./switcher')

http.createServer((req, res) => {
    const host = 'http' + '://' + req.headers.host + '/';
    const url = new URL(req.url, host);
    console.log(`${req.method}: ${url.pathname}`);
    const parts = url.pathname.split('/').filter(Boolean)

    const switcher = new Switcher()

    switcher.addObjective("GET", ()=> {
        get(res, parts);
    })
    
    switcher.addObjective("PUT", ()=> {
        switcher.switch('POST', true)
    })
    
    switcher.addObjective("POST", (...args)=> {
        const [put] = args
        postAndPut(req, res, parts, put);
    })

    if(!switcher.switch(req.method)) {
        resolve(res, error("Something went wrong."), "application/json")
    }

}).listen(8080);

function get(res, parts) {

    const file = getFileName(parts);

    fs.readFile(file, (err, data) => {

        let response;

        if (err) {

            const files = fs.readdirSync(path.join(__dirname, "json"))

            for (let i = 0; i < files.length; i++) {
                files[i] = path.parse(files[i]).name
            }
            response = error(`Available entrypoints: ${files.join(', ')}.`)

        } else {

            const object = JSON.parse(data)
            const refArray = getRefArray(object, parts)
            response = refArray[refArray.length - 1] || error("No such data.")

        }

        resolve(res, response, "application/json");
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

function postAndPut(req, res, parts, put) {

    const file = getFileName(parts);

    fs.readFile(file, async (err, data) => {
        
        const buffers = [];
        for await (const chunk of req) {
            buffers.push(chunk);
        }

        let body;

        try {
            body = JSON.parse(Buffer.concat(buffers));
        } catch (err) {
            return resolve(res, error({
                "nobody": "",
                "error": "crashes"
            }), "application/json")
        }
        
        if (err) {
            console.log(body)
            return resolve(res, err, "application/json")
        } 

        const object = JSON.parse(data)
        const refArray = getRefArray(object, parts)
        
        if (!refArray[refArray.length - 1]) {
            return resolve(res, error("Incorrect path"), "application/json")
        }


        
        for (const key in body) {
            const element = body[key];
            compareDeepData(refArray[refArray.length - 1], element, key, put)
        }

        const before = JSON.parse(data)
        
        if (JSON.stringify(object) === JSON.stringify(before) && put !== true) {
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
                        "after": object
                    }
                }
                resolve(res, response, "application/json")
            })
        }
    })
}

async function getBuffers(req) {

    return buffers
}

function compareDeepData(object, element, key, bool) {
    if (typeof element === "object") {
        for (const deepKey in element) {
            const deepElement = element[deepKey]
            compareDeepData(object[key], deepElement, deepKey, bool)
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

function error(message) {
    const object = {
        "error": message
    }
    return object
}