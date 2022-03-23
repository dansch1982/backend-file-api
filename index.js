const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const mysql = require('mysql2');

http.createServer((req, res) => {
    const host = 'http' + '://' + req.headers.host + '/';
    const url = new URL(req.url, host);
    console.log(`${req.method}: ${url.pathname}`);
    const parts = url.pathname.split('/').filter(Boolean)

    switch (req.method) {
        case "GET":
            get(res, parts);
            break;
        case "POST":
            post(req, res, parts);
            break;
        default:
            resolve(res, "something went wrong.")
            break;
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

            response = `Available entrypoints: ${files.join(', ')}.`

        } else {

            response = getDeepObject(data, parts)

        }
        resolve(res, JSON.stringify(response));
    })
}

function post(req, res, parts) {

    const file = getFileName(parts);
    let object;

    fs.readFile(file, async (err, data) => {

        let response;

        if (err) {
            console.log(err.toString())
        } else {
            object = getDeepObject(data, parts)
        }

        if (object) {
            const buffers = [];
            for await (const chunk of req) {
                buffers.push(chunk);
            }
            const body = JSON.parse(Buffer.concat(buffers));
            if (body) {
                for (const key in body) {
                    const element = body[key];
                    if (!object[key]) {
                        object[key] = element;
                    }
                }
            }
            data = JSON.parse(data)
            const refArray = [];
            for (let i = 0; i < parts.length; i++) {
                if (refArray.length <= 0) {
                    refArray.push(data[parts[i]])
                } else {
                    refArray.push(refArray[i-1][parts[i]])
                }
            }
            //console.log(object)
            //console.log(refArray[refArray.length-1])
            const old = refArray[refArray.length-2][parts[parts.length-1]];
            refArray[refArray.length-2][parts[parts.length-1]] = object
            const notOld = refArray[refArray.length-2][parts[parts.length-1]];
            //console.log(data)
            //response = JSON.stringify(old) + "" + JSON.stringify(notOld)
            response = "Data added."
        }

        resolve(res, response)
    })

}

function resolve(res, data) {
    res.writeHead(200, {
        "Content-Type": "text/json",
        "Access-Control-Allow-Origin": "*"
    })
    res.end(data);
}

function getFileName(parts) {
    const file = path.join(__dirname, "json", (parts[0] ? parts.shift() : "") + ".json")
    return file;
}

function getDeepObject(data, parts) {

    let response;
    try {
        response = JSON.parse(data)
    } catch (error) {
        response = data
    }

    if (parts.length) {
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (response[part]) {
                response = response[part]
            } else {
                response = null
                break;
            }
        }
    }
    return response
}