const http = require('http');
const fs = require('fs');
const path = require('path');

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
            resolve(res, error("Something went wrong."), "application/json")
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

            response = error(`Available entrypoints: ${files.join(', ')}.`)

        } else {

            response = getDeepObject(data, parts)

        }
        resolve(res, response, "application/json");
    })
}

function post(req, res, parts) {

    const file = getFileName(parts);
    let object;

    fs.readFile(file, async (err, data) => {
        let response;
        if (err) {
            // create file ?
            return resolve(res, err, "application/json")
        } else {
            object = getDeepObject(data, parts)
        }
        if (!object) {
            // create deep object?
            return resolve(res, error("Incorrect path"), "application/json")
        }
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
                "error": "nobody"
            }), "application/json")
        }
        for (const key in body) {
            const element = body[key];
            if (!object[key]) {
                object[key] = element;
            }
        }
        data = JSON.parse(data)
        const refArray = [data];
        for (let i = 1; i < parts.length; i++) {
            refArray.push(refArray[i - 1][parts[i]])
        }
        let before, after;
        if (parts.length <= 1) {
            before = refArray[0];
            data = object
            after = object;

        } else {
            before = refArray[refArray.length - 2][parts[parts.length - 1]];
            refArray[refArray.length - 2][parts[parts.length - 1]] = object
            after = refArray[refArray.length - 2][parts[parts.length - 1]];
        }
        if (JSON.stringify(before) === JSON.stringify(object)) {
            resolve(res, error("No data added."), "application/json")
        } else {
            fs.writeFile(file, JSON.stringify(data), (err) => {

                if (err) {
                    response = error(err.toString())
                } else {
                    response = {
                        "succes": "Data added.",
                        "before": before,
                        "after": object
                    }
                }
                resolve(res, response, "application/json")
            })
        }
    })

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

function getDeepObject(data, parts) {

    let response;
    try {
        response = JSON.parse(data)
    } catch (error) {
        response = data
    }

    if (parts.length - 1) {
        for (let i = 1; i < parts.length; i++) {
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

function error(message) {
    const object = {
        "error": message
    }
    return object
}